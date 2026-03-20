import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const [logs, total] = await Promise.all([
            prisma.sms_logs.findMany({
                skip,
                take: limit,
                orderBy: { sentAt: 'desc' },
                include: {
                    student: {
                        select: {
                            name_en: true,
                            name_bn: true
                        }
                    }
                }
            }),
            prisma.sms_logs.count()
        ])

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch logs' },
            { status: 500 }
        )
    }
}
