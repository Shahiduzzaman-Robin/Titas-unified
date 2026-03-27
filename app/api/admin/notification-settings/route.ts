import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { getNotificationSettings, saveNotificationSettings } from "@/lib/email"
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from "@/lib/admin-activity"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const settings = await getNotificationSettings()
    return NextResponse.json({ settings })
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { settings } = await request.json()
    const updated = await saveNotificationSettings(settings, session.user?.name || session.user?.email || 'admin')

    // Log admin activity
    await logAdminActivity({
        adminId: getAdminIdFromSession(session),
        action: 'update_notification_settings',
        description: `Updated system-wide notification settings`,
        metadata: { newSettings: settings },
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request)
    })

    return NextResponse.json({ settings: updated })
}
