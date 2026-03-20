import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { SMSService } from "@/lib/sms"
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from "@/lib/admin-activity"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { to, filters, message } = body
        let numbers: string[] = []

        if (!message) {
            return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 })
        }

        if (filters) {
            // Complex filtering like Express backend
            const where: any = { approval: 1 } // Only approved students
            
            if (filters.department && filters.department !== 'all') {
                where.department = filters.department
            }
            
            if (filters.session) {
                if (Array.isArray(filters.session) && filters.session.length > 0) {
                    where.student_session = { in: filters.session }
                } else if (typeof filters.session === 'string' && filters.session !== 'all') {
                    where.student_session = filters.session
                }
            }

            const students = await prisma.students.findMany({
                where,
                select: { mobile: true }
            })
            numbers = students.map(s => s.mobile).filter(Boolean) as string[]
        } else if (to) {
            numbers = to.split(',').map((s: string) => s.trim()).filter(Boolean)
        }

        if (numbers.length === 0) {
            return NextResponse.json({ success: false, message: 'No recipients found' }, { status: 400 })
        }

        // Format numbers (add 880 prefix)
        const formattedNumbers = numbers.map(num => {
            let n = String(num).replace(/\D/g, '')
            if (n.length === 11 && n.startsWith('0')) n = '88' + n
            return n
        }).filter(n => n.length >= 10)

        const result = await SMSService.sendBulkSMS(formattedNumbers, message)

        if (result.success) {
            const adminId = getAdminIdFromSession(session)
            await logAdminActivity({
                adminId,
                action: 'send_bulk_sms',
                description: `Sent SMS to ${formattedNumbers.length} recipients`,
                metadata: {
                    recipientCount: formattedNumbers.length,
                    messagePreview: message.substring(0, 50),
                    filters: filters || 'Manual'
                },
                ipAddress: getIpAddress(request),
                userAgent: getUserAgent(request)
            })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('SMS Send API Error:', error)
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
    }
}
