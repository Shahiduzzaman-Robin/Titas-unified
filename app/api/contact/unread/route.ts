import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ count: 0 }, { status: 401 })
    }
    try {
        const count = await prisma.contact_messages.count({ where: { status: 'unread' } })
        return NextResponse.json({ count })
    } catch (error) {
        return NextResponse.json({ count: 0 })
    }
}
