import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { sendNotificationTestEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, recipientEmail } = await request.json()
    if (!type || !recipientEmail) {
        return NextResponse.json({ error: 'type and recipientEmail are required' }, { status: 400 })
    }

    const result = await sendNotificationTestEmail(type, recipientEmail)

    // Log this action
    try {
        const { logAdminActivity, getIpAddress, getUserAgent } = await import("@/lib/admin-activity")
        await logAdminActivity({
            adminId: parseInt(session.user.id),
            action: 'other',
            description: `Sent test email (${type}) to ${recipientEmail}`,
            metadata: { type, recipientEmail, success: result.sent },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })
    } catch (logError) {
        console.error('Failed to log test email action:', logError)
    }

    return NextResponse.json(result)
}
