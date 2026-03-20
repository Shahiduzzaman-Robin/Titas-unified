import { NextRequest, NextResponse } from 'next/server'
import { SMSService } from '@/lib/sms'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const result = await SMSService.checkBalance()

        if (result.success && result.data) {
            return NextResponse.json({
                success: true,
                balance: result.data.nonmask,
                maskBalance: result.data.mask,
                totalSent: await prisma.sms_logs.count({
                    where: { status: 'sent' }
                })
            })
        } else {
            return NextResponse.json(
                { success: false, msg: result.message || 'Failed to fetch balance' },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Balance Route Error:', error)
        return NextResponse.json(
            { success: false, msg: 'Internal server error' },
            { status: 500 }
        )
    }
}
