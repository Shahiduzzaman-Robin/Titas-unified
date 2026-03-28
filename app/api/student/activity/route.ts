import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = parseInt(session.user.id)

    try {
        const activities = await prisma.student_activity_logs.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            take: 10 // Only show last 10 activities for simplicity
        })

        // Filter/Format data if needed (e.g. parse metadata)
        const formattedActivities = activities.map(activity => ({
            ...activity,
            metadata: activity.metadata ? JSON.parse(activity.metadata) : null
        }))

        return NextResponse.json({ activities: formattedActivities })
    } catch (error) {
        console.error('Failed to fetch student activity:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
