import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const templates = await prisma.sms_templates.findMany()
        return NextResponse.json(templates)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, template } = body

        if (!type || !template) {
            return NextResponse.json(
                { error: 'Type and template are required' },
                { status: 400 }
            )
        }

        const result = await prisma.sms_templates.upsert({
            where: { type },
            update: { template },
            create: { type, template }
        })

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to save template' },
            { status: 500 }
        )
    }
}
