import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function GET(
    request: NextRequest,
    { params }: { params: { type: string } }
) {
    try {
        const { type } = params
        let data

        switch (type) {
            case 'sessions':
                data = await prisma.sessions.findMany({
                    where: { isActive: true },
                    orderBy: { name: 'desc' }
                })
                break
            case 'departments':
                data = await prisma.departments.findMany({
                    where: { isActive: true },
                    orderBy: { name: 'asc' }
                })
                break
            case 'halls':
                data = await prisma.halls.findMany({
                    where: { isActive: true },
                    orderBy: { name: 'asc' }
                })
                break
            case 'upazilas':
                data = await prisma.upazilas.findMany({
                    where: { isActive: true },
                    orderBy: { name: 'asc' }
                })
                break
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Options fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { type: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { type } = params
        const body = await request.json()
        const { name, name_bn } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        let data

        switch (type) {
            case 'sessions':
                data = await prisma.sessions.create({ data: { name, name_bn } })
                break
            case 'departments':
                data = await prisma.departments.create({ data: { name, name_bn } })
                break
            case 'halls':
                data = await prisma.halls.create({ data: { name, name_bn } })
                break
            case 'upazilas':
                data = await prisma.upazilas.create({ data: { name, name_bn } })
                break
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        // Log Activity
        try {
            const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
            const adminId = getAdminIdFromSession(session)
            await logAdminActivity({
                adminId,
                action: 'create_option',
                description: `Created new ${type.slice(0, -1)}: ${name}`,
                metadata: { type, name, name_bn },
                ipAddress: getIpAddress(request),
                userAgent: getUserAgent(request)
            })
        } catch (e) {
            console.error('Log error', e)
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Option creation error:', error)
        return NextResponse.json({ error: 'Failed to create option' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { type: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { type } = params
        const { searchParams } = new URL(request.url)
        const id = parseInt(searchParams.get('id') || '0')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // Get name before delete for logging
        let item
        switch (type) {
            case 'sessions': item = await prisma.sessions.findUnique({ where: { id } }); break
            case 'departments': item = await prisma.departments.findUnique({ where: { id } }); break
            case 'halls': item = await prisma.halls.findUnique({ where: { id } }); break
            case 'upazilas': item = await prisma.upazilas.findUnique({ where: { id } }); break
        }

        switch (type) {
            case 'sessions':
                await prisma.sessions.delete({ where: { id } })
                break
            case 'departments':
                await prisma.departments.delete({ where: { id } })
                break
            case 'halls':
                await prisma.halls.delete({ where: { id } })
                break
            case 'upazilas':
                await prisma.upazilas.delete({ where: { id } })
                break
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        // Log Activity
        if (item) {
            try {
                const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
                const adminId = getAdminIdFromSession(session)
                await logAdminActivity({
                    adminId,
                    action: 'delete_option',
                    description: `Deleted ${type.slice(0, -1)}: ${item.name}`,
                    metadata: { type, id, name: item.name },
                    ipAddress: getIpAddress(request),
                    userAgent: getUserAgent(request)
                })
            } catch (e) {
                console.error('Log error', e)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Option delete error:', error)
        return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { type: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { type } = params
        const body = await request.json()
        const { id, name, name_bn } = body

        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 })
        }

        let data

        switch (type) {
            case 'sessions':
                data = await prisma.sessions.update({
                    where: { id: parseInt(id) },
                    data: { name, name_bn }
                })
                break
            case 'departments':
                data = await prisma.departments.update({
                    where: { id: parseInt(id) },
                    data: { name, name_bn }
                })
                break
            case 'halls':
                data = await prisma.halls.update({
                    where: { id: parseInt(id) },
                    data: { name, name_bn }
                })
                break
            case 'upazilas':
                data = await prisma.upazilas.update({
                    where: { id: parseInt(id) },
                    data: { name, name_bn }
                })
                break
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        // Log Activity
        try {
            const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
            const adminId = getAdminIdFromSession(session)
            await logAdminActivity({
                adminId,
                action: 'update_option',
                description: `Updated ${type.slice(0, -1)}: ${name}`,
                metadata: { type, id, name, name_bn },
                ipAddress: getIpAddress(request),
                userAgent: getUserAgent(request)
            })
        } catch (e) {
            console.error('Log error', e)
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Option update error:', error)
        return NextResponse.json({ error: 'Failed to update option' }, { status: 500 })
    }
}
