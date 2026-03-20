import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { DiscordService } from "@/lib/discord"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Verify session is student
        if (!session || session.user.role !== 'student') {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const studentId = parseInt(session.user.id)
        const changes = await req.json()

        // Validate basic payload (optional, but good practice)
        if (!changes || Object.keys(changes).length === 0) {
            return NextResponse.json(
                { message: "No changes provided" },
                { status: 400 }
            )
        }

        // Sanitize: Don't allow changing ID, createdAt, approved status, etc.
        delete changes.id
        delete changes.createdAt
        delete changes.updatedAt
        delete changes.approval
        delete changes.password
        // image_path is allowed

        // Map form fields to DB fields
        if (changes.name) {
            changes.name_en = changes.name
            delete changes.name
        }
        if (changes.address) {
            changes.address_en = changes.address
            delete changes.address
        }

        // Fetch current student data to compare
        const currentStudent = await prisma.students.findUnique({
            where: { id: studentId }
        })

        if (!currentStudent) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 })
        }

        // Filter out unchanged fields
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actualChanges: any = {}
        let hasChanges = false

        for (const [key, value] of Object.entries(changes)) {
            // Check if key exists in currentStudent (ignoring extra fields sent by frontend if any)
            if (Object.prototype.hasOwnProperty.call(currentStudent, key)) {
                // strict comparison since we expect same types usually, 
                // but beware of null vs undefined or string vs int (though schema is mostly string)
                // DB might have null, form might send empty string.
                // Logic: 
                // If DB is null and form is "", consider same? 
                // If DB is "foo" and form is "foo", same.

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const currentValue = (currentStudent as any)[key]

                // Normalize empty string and null equality
                const normalizedCurrent = currentValue === null ? "" : currentValue
                const normalizedNew = value === null ? "" : value

                if (normalizedCurrent != normalizedNew) {
                    actualChanges[key] = value
                    hasChanges = true
                }
            } else {
                // If field not in DB schema (shouldn't happen with strict typing but here we use any), ignore or add?
                // Probably better to ignore unknown fields
            }
        }

        if (!hasChanges) {
            return NextResponse.json({ message: "No changes detected" })
        }

        // Create edit record
        await prisma.student_edits.create({
            data: {
                studentId: studentId,
                changes: actualChanges,
                status: "pending"
            }
        })

        // Send Discord webhook notification
        try {
            await DiscordService.sendStudentEditNotification(
                'new',
                currentStudent,
                actualChanges
            )
        } catch (webhookError) {
            console.error('Discord webhook error:', webhookError)
            // Don't fail the request if webhook fails
        }

        return NextResponse.json({ message: "Changes submitted for approval" })

    } catch (error) {
        console.error("Student edit submission error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
