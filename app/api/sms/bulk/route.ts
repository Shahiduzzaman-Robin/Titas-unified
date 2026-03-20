import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SMSService } from '@/lib/sms'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { message, sessions, departments } = body // Added departments

        if (!message) {
            return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 })
        }

        // Build filter
        const where: any = {
            approval: 1,
            mobile: { not: null }
        }

        if (sessions && Array.isArray(sessions) && sessions.length > 0) {
            const expandedSessions = new Set<string>()
            sessions.forEach(s => {
                expandedSessions.add(s)
                const match = s.match(/^(\d{4})-\d{2}(\d{2})$/)
                if (match) expandedSessions.add(`${match[1]}-${match[2]}`)
            })
            where.student_session = { in: Array.from(expandedSessions) }
        }

        if (departments && Array.isArray(departments) && departments.length > 0) {
            where.department = { in: departments }
        }

        // Fetch students
        const students = await prisma.students.findMany({
            where,
            select: { id: true, mobile: true }
        })

        if (students.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No eligible students found.',
                result: { sent: 0, total: 0 }
            })
        }

        // Efficiently format and send all at once
        const numbers = students.map(s => {
            let n = String(s.mobile).replace(/\D/g, '')
            if (n.length === 11 && n.startsWith('0')) n = '88' + n
            return n
        }).filter(n => n.length >= 10)

        const result = await SMSService.sendBulkSMS(numbers, message)

        if (result.success) {
            const adminId = getAdminIdFromSession(session)
            await logAdminActivity({
                adminId,
                action: 'send_bulk_sms',
                description: `Sent bulk SMS to ${numbers.length} recipients`,
                metadata: {
                    recipientCount: numbers.length,
                    messagePreview: message.substring(0, 50),
                    filters: { sessions, departments }
                },
                ipAddress: getIpAddress(request),
                userAgent: getUserAgent(request)
            })

            // Log individually to sms_logs table (Async/Background)
            // Use 'as any' or explicit cast for result as it can be success result without some fields in theory
            const smsId = (result as any).smsId
            const logEntries = students.map(s => ({
                studentId: s.id,
                phone: s.mobile!,
                message: message,
                smsId: smsId,
                status: 'sent'
            }))

            // Chunked DB inserts
            for (let i = 0; i < logEntries.length; i += 100) {
                const chunk = logEntries.slice(i, i + 100)
                await prisma.sms_logs.createMany({ data: chunk }).catch(e => console.error("Log error", e))
            }
        }

        return NextResponse.json({
            success: result.success,
            message: result.message,
            result: {
                sent: (result as any).sent || numbers.length,
                total: students.length
            }
        })

    } catch (error) {
        console.error("Bulk SMS Error:", error)
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
    }
}
