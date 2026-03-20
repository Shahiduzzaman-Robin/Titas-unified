import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        const search = searchParams.get('search') || ''
        const session = searchParams.get('session') || ''
        const department = searchParams.get('department') || ''
        const hall = searchParams.get('hall') || ''
        const upazila = searchParams.get('upazila') || ''
        const bloodGroup = searchParams.get('bloodGroup') || ''

        // Build where clause
        const where: any = {
            approval: 1 // Only approved students
        }

        if (search) {
            where.OR = [
                { name_en: { contains: search } },
                { name_bn: { contains: search } },
                { mobile: { contains: search } },
                { email: { contains: search } }
            ]
        }

        if (session) where.student_session = session
        if (department) where.department = department
        if (hall) where.hall = hall
        if (upazila) where.upazila = upazila
        if (bloodGroup) where.blood_group = bloodGroup

        const students = await prisma.students.findMany({
            where,
            select: {
                id: true,
                name_en: true,
                name_bn: true,
                address_en: true,
                address_bn: true,
                student_session: true,
                department: true,
                hall: true,
                upazila: true,
                mobile: true,
                email: true,
                blood_group: true,
                gender: true,
                image_path: true
            },
            orderBy: {
                id: 'asc'
            }
        })

        return NextResponse.json({
            students,
            count: students.length
        })

    } catch (error) {
        console.error('Error fetching students:', error)
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        )
    }
}
