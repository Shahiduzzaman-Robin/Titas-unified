import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { DiscordService } from "@/lib/discord"

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [messages, total] = await Promise.all([
        prisma.contact_messages.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.contact_messages.count({ where })
    ])

    return NextResponse.json({ messages, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(request: NextRequest) {
    // Public: allow anyone to submit a contact message
    try {
        const body = await request.json()
        const { name, email, subject, message } = body
        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }
        const msg = await prisma.contact_messages.create({
            data: { name, email, subject: subject || 'General Enquiry', message }
        })

        // Notify Discord
        await DiscordService.sendContactNotification({ name, email, subject, message }).catch(console.error)

        return NextResponse.json({ success: true, id: msg.id })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { messageIds } = await request.json()
        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return NextResponse.json({ error: 'No message IDs provided' }, { status: 400 })
        }

        await prisma.contact_messages.deleteMany({
            where: {
                id: { in: messageIds }
            }
        })

        // Log the bulk delete action
        await prisma.admin_activity_logs.create({
            data: {
                adminId: parseInt((session.user as any).id),
                action: 'bulk_delete_messages',
                description: `Bulk deleted ${messageIds.length} contact messages`,
                ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
                userAgent: request.headers.get('user-agent') || 'unknown'
            }
        })

        return NextResponse.json({ success: true, count: messageIds.length })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete messages' }, { status: 500 })
    }
}
