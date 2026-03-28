import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

// Helper to check if user is admin
async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.role === 'admin' || session?.user?.email === process.env.ADMIN_EMAIL
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const student = await prisma.students.findUnique({
            where: { id: parseInt(params.id) },
        })

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(student)
    } catch (error) {
        console.error('Student fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch student' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const body = await request.json()

        const student = await prisma.students.update({
            where: { id: parseInt(params.id) },
            data: body,
        })

        return NextResponse.json(student)
    } catch (error) {
        console.error('Student update error:', error)
        return NextResponse.json(
            { error: 'Failed to update student' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        await prisma.students.delete({
            where: { id: parseInt(params.id) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Student delete error:', error)
        return NextResponse.json(
            { error: 'Failed to delete student' },
            { status: 500 }
        )
    }
}
