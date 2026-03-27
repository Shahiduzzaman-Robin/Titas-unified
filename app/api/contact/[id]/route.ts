import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from "@/lib/admin-activity"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { status } = await request.json()
    const id = parseInt(params.id)

    const updated = await prisma.contact_messages.update({
        where: { id },
        data: { status }
    })

    // Log admin activity
    await logAdminActivity({
        adminId: getAdminIdFromSession(session),
        action: 'update_message_status',
        description: `Marked message from ${updated.name} as ${status}`,
        metadata: { messageId: id, newStatus: status, subject: updated.subject },
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request)
    })

    return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = parseInt(params.id)
    
    // Fetch info before deletion for logging
    const msg = await prisma.contact_messages.findUnique({ where: { id } })

    if (msg) {
        await prisma.contact_messages.delete({ where: { id } })

        // Log admin activity
        await logAdminActivity({
            adminId: getAdminIdFromSession(session),
            action: 'delete_message',
            description: `Deleted contact message from ${msg.name}`,
            metadata: { messageId: id, sender: msg.name, subject: msg.subject },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })
    }

    return NextResponse.json({ success: true })
}
