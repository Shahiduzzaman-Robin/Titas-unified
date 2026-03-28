import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'No active session' }, { status: 401 })
        }

        // Get actual request details
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'Unknown'
        const ua = req.headers.get('user-agent') || 'Unknown'

        // Log based on role
        if (session.user.role === 'admin') {
            const { logAdminActivity } = await import('@/lib/admin-activity')
            await logAdminActivity({
                adminId: parseInt(session.user.id),
                action: 'admin_logout',
                description: `Admin logged out: ${session.user.name || session.user.email}`,
                metadata: { email: session.user.email },
                ipAddress: ip,
                userAgent: ua,
            }).catch(e => console.error('Admin logout log failed:', e))
        } else if (session.user.role === 'student') {
            const { logStudentActivity } = await import('@/lib/student-activity')
            // Fire and forget so we don't delay the actual logout redirect
            logStudentActivity(
                parseInt(session.user.id),
                'logout',
                `Student logged out: ${session.user.name || session.user.email}`,
                ip,
                ua
            ).catch(e => console.error('Student logout log failed:', e))
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Logout logging error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
