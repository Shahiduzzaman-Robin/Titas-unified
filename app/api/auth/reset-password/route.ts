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

        // Unified OTP for both email and mobile
        if ((mobile && otp) || (body.email && otp)) {
            // Find valid OTP for this mobile or email
            const whereClause: any = {
                otp,
                expiresAt: { gt: new Date() }
            };
            if (mobile) whereClause.mobile = mobile;
            if (body.email) whereClause.email = body.email;

            const otpRecord = await prisma.otp_verifications.findFirst({
                where: whereClause,
                orderBy: { createdAt: 'desc' }
            });

            if (!otpRecord) {
                return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
            }

            // Find student by mobile or email
            let student = null;
            if (mobile) {
                student = await prisma.students.findFirst({ where: { mobile } });
            } else if (body.email) {
                student = await prisma.students.findFirst({ where: { email: body.email } });
            }
            if (!student) return NextResponse.json({ message: "User not found" }, { status: 404 });

            await prisma.students.update({
                where: { id: student.id },
                data: { password: hashedPassword }
            });

            // Delete used OTPs
            if (mobile) {
                await prisma.otp_verifications.deleteMany({ where: { mobile } });
            } else if (body.email) {
                await prisma.otp_verifications.deleteMany({ where: { email: body.email } });
            }
            return NextResponse.json({ message: "Password updated successfully" });
        } else {
            return NextResponse.json({ message: "Missing OTP or identifier" }, { status: 400 });
        }

    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
