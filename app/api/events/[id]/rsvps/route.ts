import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const rsvps = await prisma.event_rsvps.findMany({
            where: { eventId: id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, data: rsvps })
    } catch (error) {
        console.error('Failed to fetch RSVPs:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
