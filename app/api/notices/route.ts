import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin'

    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === '1'
    
    // Public users only see active notices. Admins can see all if they pass ?all=1
    const whereActive = (all && isAdmin) ? {} : { isActive: true }

    const notices = await prisma.notices.findMany({
        where: whereActive,
        orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
        ]
    })

    return NextResponse.json({
        success: true,
        data: notices
    })
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, link, priority, isActive } = await request.json()
    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 })

    const notice = await prisma.notices.create({
        data: { text, link, priority: priority || 'normal', isActive: isActive ?? true }
    })

    // Log admin activity
    try {
        const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
        const adminId = getAdminIdFromSession(session)
        await logAdminActivity({
            adminId,
            action: 'create_notice',
            description: `Created new notice: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
            metadata: { noticeId: notice.id, text, priority, isActive },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })
    } catch (logError) {
        console.error('Failed to log notice creation:', logError)
    }

    // NEW: Bulk Email Notification
    try {
        const { notifyStudentsAboutNewNotice } = await import('@/lib/email')
        // Run in background (not awaited) to keep API fast
        notifyStudentsAboutNewNotice({ text, link }).catch(err => {
            console.error('Bulk notice email failed:', err)
        })
    } catch (emailError) {
        console.error('Failed to initiate bulk notice email:', emailError)
    }

    return NextResponse.json({ success: true, data: notice })
}
