import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const queries = [
            prisma.students.count({ where: { approval: 1 } }), // Total approved students
            prisma.students.count({ where: { gender: { in: ['Male', 'male', 'পুরুষ'] }, approval: 1 } }),
            prisma.students.count({ where: { gender: { in: ['Female', 'female', 'মহিলা', 'নারী'] }, approval: 1 } }),
            prisma.students.groupBy({ by: ['blood_group'], _count: { blood_group: true }, where: { blood_group: { not: null }, approval: 1 }, orderBy: { _count: { blood_group: 'desc' } } }),
            prisma.students.groupBy({ by: ['upazila'], _count: { upazila: true }, where: { upazila: { not: null }, approval: 1 }, orderBy: { _count: { upazila: 'desc' } } }),
            prisma.students.groupBy({ by: ['hall'], _count: { hall: true }, where: { hall: { not: null }, approval: 1 }, orderBy: { _count: { hall: 'desc' } } }),
            prisma.students.groupBy({ by: ['department'], _count: { department: true }, where: { department: { not: null }, approval: 1 }, orderBy: { _count: { department: 'desc' } } }),
            prisma.students.groupBy({ by: ['student_session'], _count: { student_session: true }, where: { student_session: { not: null }, approval: 1 }, orderBy: { student_session: 'desc' } }),
        ] as any[]

        const [
            totalApproved,
            males,
            females,
            bloodGroupRaw,
            upazilaRaw,
            hallRaw,
            departmentRaw,
            sessionRaw,
        ] = await Promise.all(queries)

        return NextResponse.json({
            total: totalApproved,
            males,
            females,
            bloodGroups: bloodGroupRaw.map((b: any) => ({ label: b.blood_group, count: b._count.blood_group })),
            upazilas: upazilaRaw.map((u: any) => ({ label: u.upazila, count: u._count.upazila })),
            halls: hallRaw.map((h: any) => ({ label: h.hall, count: h._count.hall })),
            departments: departmentRaw.map((d: any) => ({ label: d.department, count: d._count.department })),
            sessions: sessionRaw.map((s: any) => ({ label: s.student_session, count: s._count.student_session })),
        })
    } catch (error) {
        console.error('Public stats error:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
