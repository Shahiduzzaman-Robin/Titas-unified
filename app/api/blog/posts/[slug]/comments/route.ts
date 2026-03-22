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
        if (action === 'like' && commentId && clientId) {
            const comment = await prisma.blog_comments.findUnique({
                where: { id: parseInt(commentId) },
                select: { likes: true, likedBy: true }
            })

            if (!comment) {
                return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
            }

            let likedBy = (comment.likedBy as string[]) || []
            const hasLiked = likedBy.includes(clientId)
            
            let updateData: any = {}
            if (hasLiked) {
                // Remove like (toggle)
                likedBy = likedBy.filter(id => id !== clientId)
                updateData = {
                    likes: { decrement: 1 },
                    likedBy
                }
            } else {
                // Add like
                likedBy.push(clientId)
                updateData = {
                    likes: { increment: 1 },
                    likedBy
                }
            }

            const updatedComment = await prisma.blog_comments.update({
                where: { id: parseInt(commentId) },
                data: updateData
            })

            return NextResponse.json({
                message: hasLiked ? 'Unliked' : 'Liked',
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
                name: name.slice(0, 100) || 'Anonymous',
                email: email?.slice(0, 100),
                text: text,
                approved: true // Auto-approve for now
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
