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
    const limit = parseInt(searchParams.get('limit') || '30')
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (category) where.category = category
    if (status) where.status = status

    try {
        const [logs, total] = await Promise.all([
            prisma.email_logs.findMany({
                where,
                orderBy: { sentAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.email_logs.count({ where })
        ])

        // Summary stats
        const [sent, failed] = await Promise.all([
            prisma.email_logs.count({ where: { status: 'sent' } }),
            prisma.email_logs.count({ where: { status: 'failed' } }),
        ])

        return NextResponse.json({
            logs, total, page,
            pages: Math.ceil(total / limit),
            summary: { sent, failed, total: sent + failed }
        })
    } catch (error: any) {
        console.error('Email logs API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
