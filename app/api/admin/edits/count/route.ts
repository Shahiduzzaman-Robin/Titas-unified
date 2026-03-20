import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const count = await prisma.student_edits.count({
            where: { status: 'pending' }
        })

        return NextResponse.json({ count })
    } catch (error) {
        return NextResponse.json({ count: 0 }, { status: 500 })
    }
}
