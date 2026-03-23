import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { mobile, email, otp } = body

        if ((!mobile && !email) || !otp) {
            return NextResponse.json({ message: "Mobile or Email and OTP required" }, { status: 400 })
        }

        const whereClause: any = {
            otp,
            expiresAt: { gt: new Date() }
        }
        if (mobile) whereClause.mobile = mobile
        if (email) whereClause.email = email

        const otpRecord = await prisma.otp_verifications.findFirst({
            where: whereClause,
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
