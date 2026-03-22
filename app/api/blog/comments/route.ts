import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'

// GET all comments for admin review
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'all' // all, approved, pending, flagged

        const where: any = {}
        if (status === 'approved') where.approved = true
        if (status === 'pending') where.approved = false
        if (status === 'flagged') where.flagged = true

        const comments = await prisma.blog_comments.findMany({
            where,
            include: {
                post: {
                    select: { title: true, slug: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(comments)
    } catch (error) {
        console.error('Admin fetch comments error:', error)
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }
}
