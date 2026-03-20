import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.email_templates.findMany({ orderBy: { key: 'asc' } })
    return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, name, subject, content, variables } = await request.json()

    const existing = await prisma.email_templates.findUnique({ where: { key } })
    if (existing) {
        const updated = await prisma.email_templates.update({
            where: { key },
            data: { name, subject, content, variables }
        })
        return NextResponse.json(updated)
    }

    const template = await prisma.email_templates.create({
        data: { key, name, subject, content, variables: variables || '' }
    })
    return NextResponse.json(template)
}
