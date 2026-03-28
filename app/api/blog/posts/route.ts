import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { slugify, generateUniqueSlug, calculateReadingTime, buildExcerpt } from '@/lib/blog-utils'
import { uploadImage } from '@/lib/upload'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit
        const search = searchParams.get('search') || ''
        const categorySlug = searchParams.get('category') ? decodeURIComponent(searchParams.get('category')!) : null
        const tagSlug = searchParams.get('tag') ? decodeURIComponent(searchParams.get('tag')!) : null
        const isAdmin = searchParams.get('admin') === 'true'
        const status = searchParams.get('status')
        const isFeatured = searchParams.get('featured') === 'true'

        const where: any = {}
        
        // Handle status filter
        if (status && status !== 'all') {
            where.status = status
        } else if (!status && !isAdmin) {
            // Default to published for non-admins if no status specified
            where.status = 'published'
        }
        
        if (isFeatured) where.status = 'published'

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { excerpt: { contains: search } }
            ]
        }

        if (categorySlug) {
            where.category = { slug: categorySlug }
        }

        if (tagSlug) {
            where.tags = { some: { slug: tagSlug } }
        }

        const [posts, total] = await Promise.all([
            prisma.blog_posts.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    featuredImage: true,
                    authorName: true,
                    categoryId: true,
                    views: true,
                    status: true,
                    publishedAt: true,
                    createdAt: true,
                    updatedAt: true,
                    category: true,
                    tags: true,
                    author: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: isFeatured ? { views: 'desc' } : { publishedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.blog_posts.count({ where })
        ])

        return NextResponse.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Posts fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
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
        const formData = await request.formData()

        const title = formData.get('title') as string
        const content = formData.get('content') as string
        const categoryId = parseInt(formData.get('categoryId') as string)
        const status = (formData.get('status') as string) || 'draft'
        const excerpt = (formData.get('excerpt') as string) || ''
        const tagIds = JSON.parse((formData.get('tagIds') as string) || '[]')
        const authorName = (formData.get('authorName') as string) || null

        const featuredImage = formData.get('featuredImage') as File | null

        if (!title || !content || !categoryId) {
            return NextResponse.json({ error: 'Title, content and category are required' }, { status: 400 })
        }

        const isFile = featuredImage && typeof featuredImage !== 'string';
        let featuredImageUrl = ''
        if (isFile) {
            featuredImageUrl = await uploadImage(featuredImage as File)
        }

        const slug = await generateUniqueSlug('blog_posts', title)
        const publishedAt = status === 'published' ? new Date() : null

        const post = await prisma.blog_posts.create({
            data: {
                title,
                slug,
                content,
                excerpt: excerpt || buildExcerpt(content),
                featuredImage: featuredImageUrl,
                status,
                publishedAt,
                readingTime: calculateReadingTime(content),
                categoryId,
                authorId: adminId,
                authorName,
                tags: {
                    connect: tagIds.map((id: number) => ({ id }))
                }
            },
            include: {
                category: true,
                tags: true
            }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'create_post',
            description: `Created blog post "${title}"`,
            metadata: { post_id: post.id, slug: post.slug, status: post.status },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        // Revalidate blog pages for instant mode
        revalidatePath('/blog', 'layout')
        revalidatePath('/[locale]/blog', 'layout')

        return NextResponse.json(post, { status: 201 })
    } catch (error: any) {
        console.error('Post create error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create post' },
            { status: 500 }
        )
    }
}
