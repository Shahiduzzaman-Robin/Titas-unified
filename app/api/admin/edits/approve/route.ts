import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { DiscordService } from "@/lib/discord"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Admin check (simple role check based on earlier logic, or use email check)
        const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL || session?.user?.role === 'admin'

        if (!isAdmin) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { editId } = body

        if (!editId) {
            return NextResponse.json({ message: "Edit ID required" }, { status: 400 })
        }

        const edit = await prisma.student_edits.findUnique({
            where: { id: parseInt(editId) }
        })

        if (!edit || edit.status !== 'pending') {
            return NextResponse.json({ message: "Edit not found or not pending" }, { status: 404 })
        }

        // Apply changes
        // Parse changes from JSON string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const changes = JSON.parse(edit.changes) as any

        // Fix for legacy edits that might have wrong keys
        if (changes.name) {
            changes.name_en = changes.name
            delete changes.name
        }
        if (changes.address) {
            changes.address_en = changes.address
            delete changes.address
        }

        await prisma.students.update({
            where: { id: edit.studentId },
            data: changes
        })

        // Mark approved
        // Get admin ID from session
        let adminId: number | null = null
        if (session?.user?.id && session.user.id !== 'admin-static') {
            adminId = parseInt(session.user.id)
        }

        await prisma.student_edits.update({
            where: { id: edit.id },
            data: {
                status: 'approved',
                adminId: adminId,
                reviewedAt: new Date()
            }
        })

        // Fetch student info for notification and logging
        const student = await prisma.students.findUnique({
            where: { id: edit.studentId },
            select: { email: true, name_en: true, name_bn: true }
        })

        // Log admin activity
        try {
            const { logAdminActivity, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
            await logAdminActivity({
                adminId,
                studentId: edit.studentId,
                action: 'approve_edit',
                description: `Approved profile edit for ${student?.name_en || student?.name_bn || 'student'}`,
                metadata: {
                    editId: edit.id,
                    changes: edit.changes,
                    student_name: student?.name_en || student?.name_bn,
                },
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req)
            })
        } catch (logError) {
            console.error('Failed to log admin activity:', logError)
            // Don't fail the request if logging fails
        }

        // Send email notification
        if (student && student.email) {
            const { sendEditApprovedEmail } = await import("@/lib/email")
            const adminName = session?.user?.name || 'Admin'
            // Await to ensure delivery on Vercel
            try {
                await sendEditApprovedEmail(student.email, student.name_en || 'Student', adminName)
            } catch (emailError) {
                console.error("Failed to send approval email:", emailError)
            }
        }

        // Send Discord webhook notification
        try {
            const updatedStudent = await prisma.students.findUnique({
                where: { id: edit.studentId }
            })
            if (updatedStudent) {
                const adminName = session?.user?.name || session?.user?.email || 'Admin'
                await DiscordService.sendStudentEditNotification(
                    'approved',
                    updatedStudent,
                    changes,
                    adminName
                )
            }
        } catch (webhookError) {
            console.error('Discord webhook error:', webhookError)
            // Don't fail the request if webhook fails
        }

        return NextResponse.json({ message: "Changes approved and applied" })
    } catch (error) {
        console.error("Approve edit error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
