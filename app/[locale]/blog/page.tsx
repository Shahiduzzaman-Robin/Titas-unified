import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import BlogClient from "./BlogClient"

export default async function PublicBlogPage({ params }: { params: { locale: string } }) {
    const { locale } = params

    // Fetch initial data in parallel on the server
    const [postsData, categories, latestPosts, trendingPosts] = await Promise.all([
        prisma.blog_posts.findMany({
            where: { status: 'published' },
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
                category: true,
                tags: true,
                author: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { publishedAt: 'desc' },
            take: 19
        }),
        prisma.blog_categories.findMany({
            orderBy: { name: 'asc' }
        }),
        prisma.blog_posts.findMany({
            where: { status: 'published' },
            take: 5,
            orderBy: { publishedAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                featuredImage: true,
                publishedAt: true,
                category: { select: { name: true } }
            }
        }),
        prisma.blog_posts.findMany({
            where: { status: 'published' },
            take: 5,
            orderBy: { views: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                featuredImage: true,
                publishedAt: true,
                views: true,
                category: { select: { name: true } }
            }
        })
    ])

    const total = await prisma.blog_posts.count({ where: { status: 'published' } })

    const initialPagination = {
        page: 1,
        limit: 19,
        total,
        totalPages: Math.ceil(total / 19)
    }

    return (
        <Suspense fallback={<div className="min-h-screen bg-white pt-32 px-4 max-w-7xl mx-auto">Loading...</div>}>
            <BlogClient 
                initialPosts={postsData as any}
                initialPagination={initialPagination}
                initialCategories={categories as any}
                sidebarData={{
                    latest: latestPosts as any,
                    trending: trendingPosts as any
                }}
            />
        </Suspense>
    )
}

