import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function normalizeSession(session: string) {
    if (!session) return session
    // Convert YYYY-YY to YYYY-YYYY
    const match = session.match(/^(\d{4})-(\d{2})$/)
    if (match) {
        const startYear = match[1]
        const endYearShort = match[2]
        return `${startYear}-20${endYearShort}`
    }
    return session
}

export async function GET(request: NextRequest) {
    try {
        const [studentData, departmentsFromTable] = await Promise.all([
            prisma.students.groupBy({
                by: ['student_session'],
                where: { 
                    approval: 1,
                    student_session: { not: null }
                }
            }),
            prisma.departments.findMany({ 
                where: { isActive: true }, 
                select: { name: true }, 
                orderBy: { name: 'asc' } 
            }),
        ])

        const sessionsSet = new Set<string>()

        // Add only from students table with approval: 1 (actual approved data)
        studentData.forEach(s => {
            if (s.student_session) {
                sessionsSet.add(normalizeSession(s.student_session))
            }
        })

        const sessions = Array.from(sessionsSet).sort((a, b) => b.localeCompare(a))

        return NextResponse.json({
            success: true,
            sessions: sessions,
            departments: departmentsFromTable.map(d => d.name)
        })
    } catch (error) {
        console.error('SMS Filters API Error:', error)
        return NextResponse.json({ success: false, msg: 'Internal server error' }, { status: 500 })
    }
}
