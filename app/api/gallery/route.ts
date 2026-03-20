import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { uploadImage } from '@/lib/upload'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || 'all'
        const limit = parseInt(searchParams.get('limit') || '20')

        const where: any = {}
        if (category !== 'all') {
            where.category = category
        }

        const images = await prisma.gallery_images.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                uploadedBy: {
                    select: { name: true }
                }
            }
        })

        return NextResponse.json(images)
    } catch (error) {
        console.error('Gallery fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch gallery images' },
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
        const category = formData.get('category') as string || 'General'
        const image = formData.get('image') as File

        if (!image) {
            return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
        }

        const imageUrl = await uploadImage(image)

        const galleryImage = await prisma.gallery_images.create({
            data: {
                url: imageUrl,
                title: title || null,
                category,
                adminId
            }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'upload_gallery_image' as any, // Custom action
            description: `Uploaded gallery image "${title || 'Untitled'}"`,
            metadata: { image_id: galleryImage.id, category: galleryImage.category },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json(galleryImage, { status: 201 })
    } catch (error: any) {
        console.error('Gallery upload error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to upload gallery image' },
            { status: 500 }
        )
    }
}
