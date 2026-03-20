import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { slugify, generateUniqueSlug } from '@/lib/blog-utils'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'

export async function GET() {
    try {
        const tags = await prisma.blog_tags.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        })
        return NextResponse.json(tags)
    } catch (error) {
        console.error('Tags fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
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
        const { name } = await request.json()

        if (!name) {
            return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
        }

        const slug = await generateUniqueSlug('blog_tags', name)
        const tag = await prisma.blog_tags.create({
            data: {
                name,
                slug
            }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'create_tag',
            description: `Created blog tag "${name}"`,
            metadata: { tag_id: tag.id, slug: tag.slug },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json(tag, { status: 201 })
    } catch (error: any) {
        console.error('Tag create error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create tag' },
            { status: 500 }
        )
    }
}
