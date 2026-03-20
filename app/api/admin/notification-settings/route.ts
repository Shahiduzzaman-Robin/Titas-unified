import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { getNotificationSettings, saveNotificationSettings } from "@/lib/email"

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
    return NextResponse.json({ settings: updated })
}
