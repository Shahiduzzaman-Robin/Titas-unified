
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { verifyPassword, hashPassword } from "@/lib/auth"
import { z } from "zod"

const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().optional().or(z.literal('')),
})


export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const adminId = parseInt(session.user.id)
        if (isNaN(adminId)) {
            return NextResponse.json({ message: "Invalid admin ID" }, { status: 400 })
        }

        const admin = await prisma.admins.findUnique({
            where: { id: adminId },
            select: { name: true, email: true }
        })

        if (!admin) {
            return NextResponse.json({ message: "Admin not found" }, { status: 404 })
        }

        return NextResponse.json(admin)
    } catch (error) {
        console.error("Profile fetch error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const adminId = parseInt(session.user.id)
        if (isNaN(adminId)) {
            return NextResponse.json({ message: "Invalid admin ID" }, { status: 400 })
        }

        const body = await req.json()
        const result = updateProfileSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors
            }, { status: 400 })
        }

        const { name, email, currentPassword, newPassword } = result.data

        // Fetch current admin
        const admin = await prisma.admins.findUnique({
            where: { id: adminId }
        })

        if (!admin) {
            return NextResponse.json({ message: "Admin not found" }, { status: 404 })
        }

        // Verify current password
        const isValid = await verifyPassword(currentPassword, admin.password)
        if (!isValid) {
            return NextResponse.json({ message: "Incorrect current password" }, { status: 403 })
        }

        // Check if email is being changed and if it's already taken
        if (email !== admin.email) {
            const existingAdmin = await prisma.admins.findUnique({
                where: { email }
            })

            if (existingAdmin) {
                return NextResponse.json({ message: "Email already in use" }, { status: 409 })
            }
        }

        const dataToUpdate: any = {
            name,
            email
        }

        if (newPassword && newPassword.length >= 6) {
            dataToUpdate.password = await hashPassword(newPassword)
        } else if (newPassword && newPassword.length > 0 && newPassword.length < 6) {
            return NextResponse.json({ message: "New password must be at least 6 characters" }, { status: 400 })
        }

        // Update admin
        await prisma.admins.update({
            where: { id: adminId },
            data: dataToUpdate
        })

        // Log activity
        try {
            const { logAdminActivity, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
            await logAdminActivity({
                adminId,
                action: 'other', // or create a new action type 'update_profile'
                description: `Updated own profile${newPassword ? ' and changed password' : ''}`,
                metadata: {
                    name_changed: name !== admin.name,
                    email_changed: email !== admin.email,
                    password_changed: !!newPassword
                },
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req)
            })
        } catch (error) {
            console.error('Failed to log activity', error)
        }

        return NextResponse.json({ message: "Profile updated successfully" })

    } catch (error) {
        console.error("Profile update error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
