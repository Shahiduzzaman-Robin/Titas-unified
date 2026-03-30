import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get('admin') === '1'
    
    // We purposefully omit the admin check here because public homepage 
    // components fetch this endpoint to display upcoming events.
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [events, total] = await Promise.all([
        prisma.events.findMany({
            orderBy: { date: 'desc' },
            skip,
            take: limit,
            include: { _count: { select: { rsvps: true } } }
        }),
        prisma.events.count()
    ])

    return NextResponse.json({ success: true, data: events, total })
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, date, location, description, link, rsvpEnabled, capacity } = body

    if (!title || !date || !location) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const event = await prisma.events.create({
        data: {
            title,
            date: new Date(date),
            location,
            description,
            link,
            rsvpEnabled: rsvpEnabled ?? true,
            capacity: capacity ?? 0
        }
    })

    // Log admin activity
    try {
        const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
        const adminId = getAdminIdFromSession(session)
        await logAdminActivity({
            adminId,
            action: 'create_event',
            description: `Created new event: ${title}`,
            metadata: { eventId: event.id, title, date, location },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })
    } catch (logError) {
        console.error('Failed to log event creation:', logError)
    }

    // NEW: Bulk Event Notification (Reminder/Announcement)
    try {
        const { notifyStudentsEventReminder } = await import('@/lib/email')
        // Run in background (not awaited) to keep API fast
        notifyStudentsEventReminder({ 
            title: event.title, 
            date: event.date, 
            location: event.location, 
            link: event.link 
        }).catch(err => {
            console.error('Bulk event email failed:', err)
        })
    } catch (emailError) {
        console.error('Failed to initiate bulk event email:', emailError)
    }

    return NextResponse.json(event)
}
