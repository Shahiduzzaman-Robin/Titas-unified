import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { slugify, generateUniqueSlug, calculateReadingTime, buildExcerpt } from '@/lib/blog-utils'
import { uploadImage, deleteImage } from '@/lib/upload'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'
import { revalidatePath } from 'next/cache'

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const slug = decodeURIComponent(params.slug)
        const { searchParams } = new URL(request.url)
        const isAdmin = searchParams.get('admin') === 'true'

        const post = await prisma.blog_posts.findUnique({
            where: { slug },
            include: {
                category: true,
                tags: true,
                author: {
                    select: { name: true, email: true }
                }
            }
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        // If not admin, only show published posts
        if (!isAdmin && post.status !== 'published') {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        // Fetch related posts
        const related = await prisma.blog_posts.findMany({
            where: {
                id: { not: post.id },
                status: 'published',
                categoryId: post.categoryId
            },
            take: 3,
            orderBy: { publishedAt: 'desc' },
            select: {
                title: true,
                slug: true,
                featuredImage: true,
                publishedAt: true,
                readingTime: true
            }
        })

        return NextResponse.json({ post, related })
    } catch (error) {
        console.error('Post fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch post' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const currentSlug = decodeURIComponent(params.slug)
        const formData = await request.formData()

        const post = await prisma.blog_posts.findUnique({
            where: { slug: currentSlug }
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        const title = formData.get('title') as string
        const content = formData.get('content') as string
        const categoryId = parseInt(formData.get('categoryId') as string)
        const status = formData.get('status') as string
        const excerpt = formData.get('excerpt') as string
        const tagIds = JSON.parse((formData.get('tagIds') as string) || '[]')
        const authorName = formData.has('authorName') ? (formData.get('authorName') as string) : undefined
        const featuredImage = formData.get('featuredImage') as File | string | null

        const data: any = {}
        console.log('--- Post Update Debug ---')
        console.log('Slug:', currentSlug)
        if (title && title !== post.title) {
            data.title = title
            data.slug = await generateUniqueSlug('blog_posts', title, post.id)
        }
        if (content !== undefined) {
            data.content = content
            data.readingTime = calculateReadingTime(content)
            if (!excerpt) data.excerpt = buildExcerpt(content)
        }
        if (excerpt !== undefined) data.excerpt = excerpt
        if (categoryId) data.categoryId = categoryId
        if (status) {
            if (post.status !== 'published' && status === 'published') {
                data.publishedAt = new Date()
            }
            if (status === 'draft') {
                data.publishedAt = null
            }
            data.status = status
        }
        if (authorName !== undefined) {
            data.authorName = authorName === '' ? null : authorName
        }

        // More robust check for File/Blob object
        // formData.get() returns either a string or a File/Blob
        const isFile = featuredImage && typeof featuredImage !== 'string';

        if (isFile) {
            console.log('Detected File/Blob for featuredImage, uploading...')
            // Delete old image if it exists
            if (post.featuredImage) {
                try {
                    console.log('Deleting old image:', post.featuredImage)
                    await deleteImage(post.featuredImage)
                } catch (err) {
                    console.error('Failed to delete old image:', err)
                }
            }
            data.featuredImage = await uploadImage(featuredImage as File)
        } else if (featuredImage === 'null') {
             // Handle explicit delete only if string 'null' is passed
             console.log('Clearing image for post')
             if (post.featuredImage) {
                try {
                    await deleteImage(post.featuredImage)
                } catch (err) {
                    console.error('Failed to delete image:', err)
                }
             }
             data.featuredImage = null;
        }

        if (tagIds.length > 0) {
            data.tags = {
                set: tagIds.map((id: number) => ({ id }))
            }
        }


        const updated = await prisma.blog_posts.update({
            where: { id: post.id },
            data,
            include: {
                category: true,
                tags: true
            }
        })
        console.log('Post updated in DB. New featuredImage:', updated.featuredImage)

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'update_post',
            description: `Updated blog post "${updated.title}"`,
            metadata: { post_id: post.id, slug: updated.slug, status: updated.status },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        // Revalidate blog pages for instant mode
        revalidatePath('/blog', 'layout')
        revalidatePath('/[locale]/blog', 'layout')
        revalidatePath(`/[locale]/blog/${updated.slug}`)

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('Post update error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update post' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const slug = decodeURIComponent(params.slug)

        const post = await prisma.blog_posts.findUnique({
            where: { slug }
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        // Delete featured image
        if (post.featuredImage) {
            try {
                await deleteImage(post.featuredImage)
            } catch (err) {
                console.error('Failed to delete featured image:', err)
            }
        }

        await prisma.blog_posts.delete({
            where: { id: post.id }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'delete_post',
            description: `Deleted blog post "${post.title}"`,
            metadata: { post_id: post.id, title: post.title },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        // Revalidate blog pages
        revalidatePath('/blog', 'layout')
        revalidatePath('/[locale]/blog', 'layout')

        return NextResponse.json({ message: 'Post deleted' })
    } catch (error: any) {
        console.error('Post delete error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete post' },
            { status: 500 }
        )
    }
}
