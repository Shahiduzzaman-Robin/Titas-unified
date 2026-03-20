import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { deleteImage } from '@/lib/upload'
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminId = getAdminIdFromSession(session)
        const id = parseInt(params.id)

        const galleryImage = await prisma.gallery_images.findUnique({
            where: { id }
        })

        if (!galleryImage) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 })
        }

        // Delete from storage
        try {
            await deleteImage(galleryImage.url)
        } catch (err) {
            console.error('Failed to delete image from storage:', err)
        }

        await prisma.gallery_images.delete({
            where: { id }
        })

        // Log admin activity
        await logAdminActivity({
            adminId,
            action: 'delete_gallery_image' as any,
            description: `Deleted gallery image "${galleryImage.title || 'Untitled'}"`,
            metadata: { image_id: id, url: galleryImage.url },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        return NextResponse.json({ message: 'Gallery image deleted' })
    } catch (error: any) {
        console.error('Gallery delete error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete gallery image' },
            { status: 500 }
        )
    }
}
