import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all approved comments for a post
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params

        const post = await prisma.blog_posts.findUnique({
            where: { slug }
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        const comments = await prisma.blog_comments.findMany({
            where: { 
                postId: post.id,
                approved: true 
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({
            comments,
            total: comments.length
        })
    } catch (error) {
        console.error('Fetch comments error:', error)
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }
}

// POST a new comment
export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params
        const body = await request.json()
        const { name, text, email, action, commentId, clientId } = body

        const post = await prisma.blog_posts.findUnique({
            where: { slug }
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        // Handle Like Action
        if (action === 'like' && commentId) {
            // Note: In Prisma/SQL we don't have a likedBy JSON array easily without extra relations or JSON fields.
            // For now, we'll just increment the likes counter.
            // If we want real 'likedBy', we'd need another table. 
            // The clone uses a client-side clientId. We can store this in a JSON field if available.
            
            const updatedComment = await prisma.blog_comments.update({
                where: { id: parseInt(commentId) },
                data: {
                    likes: { increment: 1 }
                }
            })

            return NextResponse.json({
                message: 'Liked',
                comment: updatedComment
            })
        }

        // Create New Comment
        if (!name || !text) {
            return NextResponse.json({ error: 'Name and text are required' }, { status: 400 })
        }

        const comment = await prisma.blog_comments.create({
            data: {
                postId: post.id,
                name: name.slice(0, 100),
                email: email?.slice(0, 100),
                text: text,
                approved: true // Auto-approve for now, or false if moderation is needed
            }
        })

        return NextResponse.json({
            message: 'Comment posted',
            comment
        }, { status: 201 })

    } catch (error) {
        console.error('Post comment error:', error)
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
    }
}
