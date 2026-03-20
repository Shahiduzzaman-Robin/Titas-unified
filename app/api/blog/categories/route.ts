import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { slugify, generateUniqueSlug } from '@/lib/blog-utils'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'

export async function GET() {
    try {
        const categories = await prisma.blog_categories.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        })
        return NextResponse.json(categories)
    } catch (error) {
        console.error('Categories fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const { name, description } = await request.json()

        if (!name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
        }

        const slug = await generateUniqueSlug('blog_categories', name)
        const category = await prisma.blog_categories.create({
            data: {
                name,
                slug,
                description: description || null
            }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'create_category',
            description: `Created blog category "${name}"`,
            metadata: { category_id: category.id, slug: category.slug },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error: any) {
        console.error('Category create error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create category' },
            { status: 500 }
        )
    }
}
