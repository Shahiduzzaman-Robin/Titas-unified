import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, link, priority, isActive } = body

    const notice = await prisma.notices.update({
        where: { id: parseInt(params.id) },
        data: {
            ...(text !== undefined && { text }),
            ...(link !== undefined && { link }),
            ...(priority !== undefined && { priority }),
            ...(isActive !== undefined && { isActive }),
        }
    })

    // Log admin activity
    try {
        const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
        const adminId = getAdminIdFromSession(session)
        await logAdminActivity({
            adminId,
            action: 'update_notice',
            description: `Updated notice: ${notice.text.substring(0, 50)}`,
            metadata: { noticeId: notice.id, updates: body },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })
    } catch (logError) {
        console.error('Failed to log notice update:', logError)
    }

    return NextResponse.json({ success: true, data: notice })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const notice = await prisma.notices.findUnique({ where: { id } })

    await prisma.notices.delete({ where: { id } })

    // Log admin activity
    try {
        const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
        const adminId = getAdminIdFromSession(session)
        await logAdminActivity({
            adminId,
            action: 'delete_notice',
            description: `Deleted notice: ${notice?.text?.substring(0, 50) || id}`,
            metadata: { noticeId: id, noticeText: notice?.text },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })
    } catch (logError) {
        console.error('Failed to log notice deletion:', logError)
    }

    return NextResponse.json({ success: true })
}
