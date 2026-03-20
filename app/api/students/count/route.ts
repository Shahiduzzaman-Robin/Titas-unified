import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sessions = searchParams.getAll('sessions')
        const departments = searchParams.getAll('departments')

        // Build filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            approval: 1,
            NOT: [
                { mobile: null },
                { mobile: "" }
            ]
        }

        if (sessions && sessions.length > 0) {
            const expandedSessions = new Set<string>()
            sessions.forEach(s => {
                expandedSessions.add(s)
                const match = s.match(/^(\d{4})-\d{2}(\d{2})$/)
                if (match) expandedSessions.add(`${match[1]}-${match[2]}`)
            })
            where.student_session = { in: Array.from(expandedSessions) }
        }

        if (departments && departments.length > 0) {
            where.department = { in: departments }
        }

        const count = await prisma.students.count({ where })

        return NextResponse.json({ count })
    } catch (error) {
        console.error("Count Error:", error)
        return NextResponse.json(
            { count: 0 },
            { status: 500 }
        )
    }
}
