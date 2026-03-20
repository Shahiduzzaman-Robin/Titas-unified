import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { generateUniqueSlug } from '@/lib/blog-utils'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const id = parseInt(params.id)
        const { name, description } = await request.json()

        const category = await prisma.blog_categories.findUnique({ where: { id } })
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        const data: any = {}
        if (name && name !== category.name) {
            data.name = name
            data.slug = await generateUniqueSlug('blog_categories', name, id)
        }
        if (description !== undefined) {
            data.description = description
        }

        const updated = await prisma.blog_categories.update({
            where: { id },
            data
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'update_category',
            description: `Updated blog category "${updated.name}"`,
            metadata: { category_id: id, before: category, after: updated },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('Category update error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update category' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const id = parseInt(params.id)

        // Check if category is in use
        const postCount = await prisma.blog_posts.count({
            where: { categoryId: id }
        })

        if (postCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category that has blog posts' },
                { status: 400 }
            )
        }

        const category = await prisma.blog_categories.delete({
            where: { id }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'delete_category',
            description: `Deleted blog category "${category.name}"`,
            metadata: { category_id: id, name: category.name },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json({ message: 'Category deleted' })
    } catch (error: any) {
        console.error('Category delete error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete category' },
            { status: 500 }
        )
    }
}
