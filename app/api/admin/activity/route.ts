import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const action = searchParams.get('action') || ''
    const search = searchParams.get('search') || ''
    const adminId = searchParams.get('adminId')
    const studentId = searchParams.get('studentId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const skip = (page - 1) * limit

    const where: any = {}

    if (action) {
        where.action = { contains: action }
    }

    if (adminId) {
        where.adminId = parseInt(adminId)
    }

    if (studentId) {
        where.studentId = parseInt(studentId)
    }

    if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = new Date(startDate)
        if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            where.createdAt.lte = end
        }
    }

    if (search) {
        where.OR = [
            { description: { contains: search } },
            { admin: { name: { contains: search } } },
            { admin: { email: { contains: search } } },
            { student: { name_en: { contains: search } } },
            { student: { name_bn: { contains: search } } },
            { student: { mobile: { contains: search } } },
        ]
    }

    const [logs, total] = await Promise.all([
        prisma.admin_activity_logs.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                admin: { select: { name: true, email: true } },
                student: { select: { name_en: true, name_bn: true } }
            }
        }),
        prisma.admin_activity_logs.count({ where })
    ])

    return NextResponse.json({ 
        logs, 
        total, 
        page, 
        pages: Math.ceil(total / limit),
        limit 
    })
}
