import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { token, password, mobile, otp } = body

        if (!password) {
            return NextResponse.json(
                { message: "Password is required" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Scenario 1: Email Token
        if (token) {
            const resetRecord = await prisma.password_resets.findUnique({ where: { token } })

            if (!resetRecord || resetRecord.expiresAt < new Date()) {
                if (resetRecord) await prisma.password_resets.delete({ where: { id: resetRecord.id } })
                return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
            }

            const student = await prisma.students.findFirst({ where: { email: resetRecord.email } })
            if (!student) return NextResponse.json({ message: "User not found" }, { status: 404 })

            await prisma.students.update({
                where: { id: student.id },
                data: { password: hashedPassword }
            })

            await prisma.password_resets.deleteMany({ where: { email: resetRecord.email } })
            return NextResponse.json({ message: "Password updated successfully" })
        }
        // Scenario 2: Mobile OTP
        else if (mobile && otp) {
            // Verify OTP
            // Find valid OTP for this mobile
            const otpRecord = await prisma.otp_verifications.findFirst({
                where: {
                    mobile,
                    otp,
                    expiresAt: { gt: new Date() } // Not expired
                },
                orderBy: { createdAt: 'desc' }
            })

            if (!otpRecord) {
                return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
            }

            const student = await prisma.students.findFirst({ where: { mobile } })
            if (!student) return NextResponse.json({ message: "User not found" }, { status: 404 })

            await prisma.students.update({
                where: { id: student.id },
                data: { password: hashedPassword }
            })

            // Delete used OTPs
            await prisma.otp_verifications.deleteMany({ where: { mobile } })
            return NextResponse.json({ message: "Password updated successfully" })
        } else {
            return NextResponse.json({ message: "Missing token or OTP" }, { status: 400 })
        }

    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
