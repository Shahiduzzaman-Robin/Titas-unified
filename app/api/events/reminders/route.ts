import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { notifyStudentsEventReminder } from "@/lib/email"

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { daysAhead } = await request.json()
        
        // Find upcoming events within the specified range
        const now = new Date()
        const targetDate = new Date()
        targetDate.setDate(now.getDate() + (daysAhead || 3))

        const upcomingEvents = await prisma.events.findMany({
            where: {
                date: {
                    gte: now,
                    lte: targetDate
                }
            }
        })

        if (upcomingEvents.length === 0) {
            return NextResponse.json({ sent: false, message: 'No events found in this range' })
        }

        let totalSent = 0
        for (const event of upcomingEvents) {
            const result = await notifyStudentsEventReminder({
                title: event.title,
                date: event.date,
                location: event.location,
                link: event.link
            })
            if (result && !result.disabled) {
                totalSent += result.sentCount || 0
            }
        }

        // Log admin activity
        try {
            const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
            const adminId = getAdminIdFromSession(session)
            await logAdminActivity({
                adminId,
                action: 'other',
                description: `Sent manual event reminders for ${upcomingEvents.length} events (+${daysAhead} days)`,
                metadata: { daysAhead, eventCount: upcomingEvents.length, totalEmails: totalSent },
                ipAddress: getIpAddress(request),
                userAgent: getUserAgent(request)
            })
        } catch (logError) {
            console.error('Failed to log reminder action:', logError)
        }

        return NextResponse.json({ sent: true, eventCount: upcomingEvents.length, totalEmails: totalSent })
    } catch (error: any) {
        console.error('Event reminder API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
