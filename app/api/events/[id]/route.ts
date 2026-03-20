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
    const { title, date, location, description, link, rsvpEnabled, capacity } = body

    const event = await prisma.events.update({
        where: { id: parseInt(params.id) },
        data: {
            ...(title && { title }),
            ...(date && { date: new Date(date) }),
            ...(location && { location }),
            ...(description !== undefined && { description }),
            ...(link !== undefined && { link }),
            ...(rsvpEnabled !== undefined && { rsvpEnabled }),
            ...(capacity !== undefined && { capacity }),
        }
    })

    // Log admin activity
    try {
        const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
        const adminId = getAdminIdFromSession(session)
        await logAdminActivity({
            adminId,
            action: 'update_event',
            description: `Updated event: ${event.title}`,
            metadata: { eventId: event.id, updates: body },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })
    } catch (logError) {
        console.error('Failed to log event update:', logError)
    }

    return NextResponse.json(event)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const event = await prisma.events.findUnique({ where: { id } })

    // Delete RSVPs first
    await prisma.event_rsvps.deleteMany({ where: { eventId: id } })
    await prisma.events.delete({ where: { id } })

    // Log admin activity
    try {
        const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
        const adminId = getAdminIdFromSession(session)
        await logAdminActivity({
            adminId,
            action: 'delete_event',
            description: `Deleted event: ${event?.title || id}`,
            metadata: { eventId: id, eventTitle: event?.title },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })
    } catch (logError) {
        console.error('Failed to log event deletion:', logError)
    }

    return NextResponse.json({ success: true })
}
