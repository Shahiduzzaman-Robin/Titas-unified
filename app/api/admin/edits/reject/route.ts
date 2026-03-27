import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { DiscordService } from "@/lib/discord"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL || session?.user?.role === 'admin'

        if (!isAdmin) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { editId, reason } = body

        if (!editId) {
            return NextResponse.json({ message: "Edit ID required" }, { status: 400 })
        }

        const edit = await prisma.student_edits.findUnique({
            where: { id: parseInt(editId) }
        })

        if (!edit || edit.status !== 'pending') {
            return NextResponse.json({ message: "Edit not found or not pending" }, { status: 404 })
        }

        // Mark rejected
        // Get admin ID from session
        let adminId: number | null = null
        if (session?.user?.id && session.user.id !== 'admin-static') {
            adminId = parseInt(session.user.id)
        }

        await prisma.student_edits.update({
            where: { id: edit.id },
            data: {
                status: 'rejected',
                adminId: adminId,
                reviewNote: reason,
                reviewedAt: new Date()
            }
        })

        // Fetch student info for notification and logging
        const student = await prisma.students.findUnique({
            where: { id: edit.studentId },
            select: { email: true, name_en: true, name_bn: true }
        })

        // Fetch student info for notification and logging
        const studentForLogging = await prisma.students.findUnique({
            where: { id: edit.studentId },
            select: { email: true, name_en: true, name_bn: true }
        })

        // Log admin activity
        try {
            const { logAdminActivity, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
            await logAdminActivity({
                adminId,
                studentId: edit.studentId,
                action: 'reject_edit',
                description: `Rejected profile edit for ${student?.name_en || student?.name_bn || 'student'}${reason ? `: ${reason}` : ''}`,
                metadata: {
                    editId: edit.id,
                    changes: edit.changes,
                    rejection_reason: reason,
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
            const { sendEditRejectedEmail } = await import("@/lib/email")
            const adminName = session?.user?.name || 'Admin'
            // Await to ensure delivery on Vercel
            try {
                await sendEditRejectedEmail(student.email, student.name_en || 'Student', reason || 'No reason provided', adminName)
            } catch (emailError) {
                console.error("Failed to send rejection email:", emailError)
            }
        }

        // Send Discord webhook notification
        try {
            const updatedStudent = await prisma.students.findUnique({
                where: { id: edit.studentId }
            })
            if (updatedStudent) {
                const adminName = session?.user?.name || session?.user?.email || 'Admin'
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const changes = edit.changes as any
                await DiscordService.sendStudentEditNotification(
                    'rejected',
                    updatedStudent,
                    changes,
                    adminName,
                    reason || 'No reason provided'
                )
            }
        } catch (webhookError) {
            console.error('Discord webhook error:', webhookError)
            // Don't fail the request if webhook fails
        }

        return NextResponse.json({ message: "Changes rejected" })
    } catch (error) {
        console.error("Reject edit error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
