import { NextRequest, NextResponse } from 'next/server'
import { SMSService } from '@/lib/sms'

export async function GET(request: NextRequest) {
    try {
        const result = await SMSService.checkBalance()

        return NextResponse.json({
            success: result.success,
            message: result.success ? 'API Connected Successfully' : result.message
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Connection Failed' },
            { status: 500 }
        )
    }
}
