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

        // Unified OTP flow for both email and mobile
        // Try to find student by email or mobile
        let student = null;
        if (isEmail) {
            student = await prisma.students.findFirst({ where: { email: identifier } })
        } else {
            student = await prisma.students.findFirst({ where: { mobile: identifier } })
        }

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

        // Generate OTP
        const otp = generateOTP()
        const expiresAt = new Date(Date.now() + 900000) // 15 mins

        // Save OTP (store with email or mobile for lookup)
        await prisma.otp_verifications.create({
            data: {
                mobile: student.mobile,
                otp,
                expiresAt
            }
        })

        if (student.email) {
            // Send OTP to email
            const result = await (await import('@/lib/email')).sendPasswordResetOtpEmail(student.email, otp)
            if (!result.sent) {
                return NextResponse.json(
                    { message: "Failed to send email" },
                    { status: 500 }
                )
            }
            return NextResponse.json({ message: "OTP sent to email", type: 'email', email: student.email })
        } else {
            // Send OTP to mobile
            const message = `Your Titas password reset OTP is: ${otp}`
            const result = await SMSService.sendSMS(student.mobile, message, student.id)
            if (!result.success) {
                return NextResponse.json(
                    { message: "Failed to send SMS" },
                    { status: 500 }
                )
            }
            return NextResponse.json({ message: "OTP sent to mobile", type: 'mobile', mobile: student.mobile })
        }

    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
