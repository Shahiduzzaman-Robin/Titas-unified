import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
