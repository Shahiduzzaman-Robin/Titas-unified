import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { SMSService } from "@/lib/sms"
import { generateOTP } from "@/lib/otp"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        // Accept identifier (new) or email (legacy)
        const identifier = body.identifier || body.email

        if (!identifier) {
            return NextResponse.json(
                { message: "Email or Mobile is required" },
                { status: 400 }
            )
        }

        const isEmail = identifier.includes('@')

        if (isEmail) {
            // Check if student exists
            const student = await prisma.students.findFirst({
                where: { email: identifier }
            })

            if (!student) {
                return NextResponse.json(
                    { message: "User not found" },
                    { status: 404 }
                )
            }

            // Only allow Pending (0) or Approved (1) users
            if (student.approval !== 0 && student.approval !== 1) {
                return NextResponse.json(
                    { message: "User not found" },
                    { status: 404 }
                )
            }

            // Generate token
            const token = crypto.randomBytes(32).toString("hex")
            const expiresAt = new Date(Date.now() + 3600000) // 1 hour

            // Save token
            await prisma.password_resets.create({
                data: {
                    email: identifier,
                    token,
                    expiresAt
                }
            })

            // Send email
            const result = await sendPasswordResetEmail(identifier, token)

            if (!result.success) {
                return NextResponse.json(
                    { message: "Failed to send email" },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                message: "If an account exists, a reset link has been sent",
                type: 'email',
                email: identifier
            })
        } else {
            // SMS Flow
            const student = await prisma.students.findFirst({
                where: { mobile: identifier }
            })

            if (!student) {
                return NextResponse.json(
                    { message: "User not found" },
                    { status: 404 }
                )
            }

            // Only allow Pending (0) or Approved (1) users
            if (student.approval !== 0 && student.approval !== 1) {
                return NextResponse.json(
                    { message: "User not found" },
                    { status: 404 }
                )
            }

            // COST SAVING: If user has an email, send email instead of SMS
            if (student.email) {
                // Generate token
                const token = crypto.randomBytes(32).toString("hex")
                const expiresAt = new Date(Date.now() + 3600000) // 1 hour

                // Save token
                await prisma.password_resets.create({
                    data: {
                        email: student.email,
                        token,
                        expiresAt
                    }
                })

                // Send email
                const result = await sendPasswordResetEmail(student.email, token)

                if (!result.success) {
                    return NextResponse.json(
                        { message: "Failed to send email" },
                        { status: 500 }
                    )
                }

                // Return as 'email' type so UI shows email success message
                return NextResponse.json({
                    message: "An email registered with this number has been found. Defaulting to email to save costs.",
                    type: 'email',
                    email: student.email
                })
            }

            // Generate OTP
            const otp = generateOTP()
            const expiresAt = new Date(Date.now() + 900000) // 15 mins

            // Save OTP
            await prisma.otp_verifications.create({
                data: {
                    mobile: identifier,
                    otp,
                    expiresAt
                }
            })

            // Send SMS
            const message = `Your Titas password reset OTP is: ${otp}`
            const result = await SMSService.sendSMS(identifier, message, student.id)

            if (!result.success) {
                return NextResponse.json(
                    { message: "Failed to send SMS" },
                    { status: 500 }
                )
            }

            return NextResponse.json({ message: "OTP sent successfully", type: 'mobile' })
        }

    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
