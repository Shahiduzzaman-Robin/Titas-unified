import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params

        const post = await prisma.blog_posts.update({
            where: { slug },
            data: {
                views: { increment: 1 }
            },
            select: { views: true }
        })

        return NextResponse.json({ views: post.views })
    } catch (error) {
        console.error('Post view count error:', error)
        return NextResponse.json(
            { error: 'Failed to increment view count' },
            { status: 500 }
        )
    }
}
