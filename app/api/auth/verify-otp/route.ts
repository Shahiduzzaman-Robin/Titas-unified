import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { mobile, otp } = body

        if (!mobile || !otp) {
            return NextResponse.json({ message: "Mobile and OTP required" }, { status: 400 })
        }

        const otpRecord = await prisma.otp_verifications.findFirst({
            where: {
                mobile,
                otp,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        })

        if (otpRecord) {
            return NextResponse.json({ success: true, message: "Valid OTP" })
        } else {
            return NextResponse.json({ success: false, message: "Invalid or expired OTP" }, { status: 400 })
        }

    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
