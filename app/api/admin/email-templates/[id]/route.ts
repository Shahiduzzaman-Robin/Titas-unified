import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL || session?.user?.role === 'admin'

        if (!isAdmin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const template = await prisma.email_templates.findUnique({
            where: { id: parseInt(params.id) }
        })

        if (!template) {
            return NextResponse.json({ message: "Template not found" }, { status: 404 })
        }

        return NextResponse.json(template)
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL || session?.user?.role === 'admin'

        if (!isAdmin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { subject, content } = body

        if (!subject || !content) {
            return NextResponse.json({ message: "Subject and content are required" }, { status: 400 })
        }

        const template = await prisma.email_templates.update({
            where: { id: parseInt(params.id) },
            data: {
                subject,
                content
            }
        })

        return NextResponse.json(template)
    } catch (error) {
        console.error("Error updating template:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
