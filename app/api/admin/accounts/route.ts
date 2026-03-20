import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sendRegistrationEmail } from "@/lib/email";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Exclude system/static admin if you want, or just show all
        const admins = await prisma.admins.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(admins);
    } catch (error) {
        console.error("Error fetching admins:", error);
        return NextResponse.json({ message: "Failed to fetch admins" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Only System Admin can create new admins
        if (!session.user.isSystemAdmin) {
            return NextResponse.json({ message: "Only System Admins can create new admins" }, { status: 403 });
        }

        const body = await req.json();
        const { name, email } = body;

        if (!name || !email) {
            return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
        }

        const existingAdmin = await prisma.admins.findUnique({ where: { email } });
        if (existingAdmin) {
            return NextResponse.json({ message: "Admin with this email already exists" }, { status: 400 });
        }

        // Generate random password (8 chars)
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.admins.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Get current admin for logging
        const currentAdmin = await prisma.admins.findUnique({
            where: { email: session.user.email }
        });

        if (currentAdmin) {
            await prisma.admin_activity_logs.create({
                data: {
                    adminId: currentAdmin.id,
                    action: 'create_admin',
                    description: `Created new admin: ${name} (${email})`,
                    metadata: { newAdminId: newAdmin.id, newAdminEmail: email } as any
                }
            });
        }

        // Send email with credentials
        try {
            await sendRegistrationEmail(email, name, password);
        } catch (emailError) {
            console.error("Failed to send admin credentials email:", emailError);
            // Optionally we could return success but with a warning, 
            // but for now just logging is better than failing the whole thing 
            // if the admin was already created.
        }

        return NextResponse.json({ message: "Admin created successfully and credentials sent to email" });
    } catch (error) {
        console.error("Error creating admin:", error);
        return NextResponse.json({ message: "Failed to create admin" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Only System Admin can delete admins
        if (!session.user.isSystemAdmin) {
            return NextResponse.json({ message: "Only System Admins can delete admins" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        const adminToDelete = await prisma.admins.findUnique({ where: { id: parseInt(id) } });

        if (!adminToDelete) {
            return NextResponse.json({ message: "Admin not found" }, { status: 404 });
        }

        if (adminToDelete.email === session.user.email) {
            return NextResponse.json({ message: "You cannot delete yourself" }, { status: 400 });
        }

        await prisma.admins.delete({ where: { id: parseInt(id) } });

        // Get current admin for logging
        const currentAdmin = await prisma.admins.findUnique({
            where: { email: session.user.email }
        });

        if (currentAdmin) {
            await prisma.admin_activity_logs.create({
                data: {
                    adminId: currentAdmin.id,
                    action: 'delete_admin',
                    description: `Deleted admin: ${adminToDelete.name} (${adminToDelete.email})`,
                    metadata: { deletedAdminId: adminToDelete.id, deletedAdminEmail: adminToDelete.email } as any
                }
            });
        }

        return NextResponse.json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Error deleting admin:", error);
        return NextResponse.json({ message: "Failed to delete admin" }, { status: 500 });
    }
}
