import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { generateUniqueSlug } from '@/lib/blog-utils'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const id = parseInt(params.id)
        const { name } = await request.json()

        const tag = await prisma.blog_tags.findUnique({ where: { id } })
        if (!tag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
        }

        const data: any = {}
        if (name && name !== tag.name) {
            data.name = name
            data.slug = await generateUniqueSlug('blog_tags', name, id)
        }

        const updated = await prisma.blog_tags.update({
            where: { id },
            data
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'update_tag',
            description: `Updated blog tag "${updated.name}"`,
            metadata: { tag_id: id, before: tag, after: updated },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('Tag update error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update tag' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const id = parseInt(params.id)

        // Tags can be deleted even if used (Prisma will handle the implicit junction table)
        // But we should be careful. Actually, it's better to allow it.
        const tag = await prisma.blog_tags.delete({
            where: { id }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'delete_tag',
            description: `Deleted blog tag "${tag.name}"`,
            metadata: { tag_id: id, name: tag.name },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json({ message: 'Tag deleted' })
    } catch (error: any) {
        console.error('Tag delete error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete tag' },
            { status: 500 }
        )
    }
}
