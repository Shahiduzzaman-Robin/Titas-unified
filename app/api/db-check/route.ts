import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const adminCount = await prisma.admins.count();
        const admins = await prisma.admins.findMany({ select: { email: true, name: true, isSystemAdmin: true } });
        const studentCount = await prisma.students.count();

        // Optional check for Database URL
        const dbUrlStart = process.env.DATABASE_URL?.substring(0, 30) || "MISSING";

        return NextResponse.json({
            status: "success",
            message: "Database connection is completely healthy!",
            debug: {
                totalAdmins: adminCount,
                admins: admins,
                totalStudents: studentCount,
                databasePrefix: dbUrlStart + "..."
            }
        });
    } catch (error: any) {
        console.error("Vercel DB Check Error:", error);
        return NextResponse.json({
            status: "error",
            message: "DATABASE CONNECTION FAILED ON VERCEL. Prisma is throwing an error.",
            errorDetails: error.message || error.toString()
        }, { status: 500 });
    }
}
