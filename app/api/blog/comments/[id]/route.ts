import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const id = parseInt(params.id)
        const body = await request.json()
        const { approved, flagged, flagReason } = body

        const currentComment = await prisma.blog_comments.findUnique({
            where: { id }
        })

        if (!currentComment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
        }

        const data: any = {}
        if (typeof approved === 'boolean') data.approved = approved
        if (typeof flagged === 'boolean') data.flagged = flagged
        if (flagReason !== undefined) data.flagReason = flagReason

        const updated = await prisma.blog_comments.update({
            where: { id },
            data,
            include: { post: { select: { title: true } } }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'update_comment',
            description: `${approved ? 'Approved' : 'Hidden'} comment by ${updated.name} on "${updated.post.title}"`,
            metadata: { comment_id: id, approved: updated.approved },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Update comment error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const id = parseInt(params.id)

        const deleted = await prisma.blog_comments.delete({
            where: { id },
            include: { post: { select: { title: true } } }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'delete_comment',
            description: `Deleted comment by ${deleted.name} on "${deleted.post.title}"`,
            metadata: { comment_id: id },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json({ message: 'Deleted' })
    } catch (error) {
        console.error('Delete comment error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
