import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const adminCount = await prisma.admins.count();
        const admins = await prisma.admins.findMany({ select: { email: true, name: true, isSystemAdmin: true } });
        const studentCount = await prisma.students.count();

        // Optional check for Database URL
        const dbUrl = process.env.DATABASE_URL;

        const debugObject = {
            totalAdmins: adminCount,
            admins: admins,
            totalStudents: studentCount,
            databasePrefix: dbUrl ? `${dbUrl.substring(0, 30)}...` : 'Not Set',
            cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Missing',
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || 'Missing',
            cloudinarySecretSet: !!process.env.CLOUDINARY_API_SECRET,
            cloudinarySecretLength: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0
        };

        return NextResponse.json({
            status: "success",
            message: "Database connection is completely healthy!",
            debug: debugObject
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
