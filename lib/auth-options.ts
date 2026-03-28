import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { verifyPassword, verifyLegacyPassword, hashPassword } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Email or Mobile", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                const username = credentials.username
                const password = credentials.password

                // 1. Check Admin (Hardcoded) - REMOVED per user request
                // if (
                //     username === process.env.ADMIN_EMAIL &&
                //     password === process.env.ADMIN_PASSWORD
                // ) {
                //     return {
                //         id: "admin-static",
                //         email: username,
                //         name: "Admin",
                //         role: "admin"
                //     }
                // }

                // 2. Check Admin (Database)
                try {
                    const admin = await prisma.admins.findUnique({
                        where: { email: username },
                    })

                    if (admin) {
                        const isValid = await verifyPassword(password, admin.password)
                        if (isValid) {
                            return {
                                id: admin.id.toString(),
                                email: admin.email,
                                name: admin.name,
                                role: "admin",
                                isSystemAdmin: admin.isSystemAdmin
                            }
                        }
                    }
                } catch (error) {
                    console.log("Admin check error", error)
                }

                // 3. Check Student (Database)
                try {
                    // Check by email OR mobile
                    const student = await prisma.students.findFirst({
                        where: {
                            AND: [
                                {
                                    OR: [
                                        { email: username },
                                        { mobile: username }
                                    ]
                                },
                                {
                                    NOT: { approval: 2 }
                                }
                            ]
                        }
                    })

                    if (student) {
                        // 1. Check current password (new format)
                        if (student.password) {
                            const isValid = await verifyPassword(password, student.password)
                            if (isValid) {
                                return {
                                    id: student.id.toString(),
                                    email: student.email || student.mobile,
                                    name: student.name_en || student.name_bn || "Student",
                                    role: "student",
                                    image: student.image_path,
                                    approval: student.approval
                                }
                            }
                        }

                        // 2. Check legacy password (shadow migration)
                        if (student.legacy_password) {
                            const isLegacyValid = await verifyLegacyPassword(password, student.legacy_password)
                            if (isLegacyValid) {
                                // UPGRADE! Re-hash to current format and remove legacy hash
                                console.log(`🚀 Upgrading legacy password for ${student.email || student.mobile}`)
                                const newHash = await hashPassword(password)
                                
                                await prisma.students.update({
                                    where: { id: student.id },
                                    data: {
                                        password: newHash,
                                        legacy_password: null
                                    }
                                })

                                return {
                                    id: student.id.toString(),
                                    email: student.email || student.mobile,
                                    name: student.name_en || student.name_bn || "Student",
                                    role: "student",
                                    image: student.image_path,
                                    approval: student.approval
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.log("Student check error", error)
                }

                return null
            }
        })
    ],
    pages: {
        signIn: "/login", // We might want separate login pages or a unified one. For now keeping /login
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.picture = user.image
                token.isSystemAdmin = user.isSystemAdmin
                token.approval = user.approval
            }

            // Handle session update
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name
                if (session.email) token.email = session.email
            }

            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.image = token.picture as string | null
                session.user.isSystemAdmin = token.isSystemAdmin as boolean | undefined
                session.user.approval = token.approval as number | undefined
            }
            return session
        },
    },
    events: {
        async signIn({ user }) {
            if (user.role === 'admin') {
                try {
                    const { logAdminActivity } = await import('@/lib/admin-activity')
                    let ip = undefined
                    let ua = undefined
                    try {
                        const { headers } = await import('next/headers')
                        const headerList = await headers()
                        ip = headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || undefined
                        ua = headerList.get('user-agent') || undefined
                    } catch (hError) { }

                    await logAdminActivity({
                        adminId: parseInt(user.id),
                        action: 'admin_login',
                        description: `Admin logged in: ${user.name || user.email}`,
                        metadata: { email: user.email },
                        ipAddress: ip,
                        userAgent: ua
                    })
                } catch (e) {
                    console.error('Failed to log admin login:', e)
                }
            } else if (user.role === 'student') {
                try {
                    const { logStudentActivity } = await import('@/lib/student-activity')
                    let ip = undefined
                    let ua = undefined
                    try {
                        const { headers } = await import('next/headers')
                        const headerList = await headers()
                        ip = headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || undefined
                        ua = headerList.get('user-agent') || undefined
                    } catch (hError) { }

                    await logStudentActivity(
                        parseInt(user.id),
                        'login',
                        `Student logged in: ${user.name || user.email}`
                    )
                } catch (e) {
                    console.error('Failed to log student login:', e)
                }
            }
        },
        async signOut({ token }) {
            if (token?.role === 'admin') {
                try {
                    const { logAdminActivity } = await import('@/lib/admin-activity')
                    let ip = undefined
                    let ua = undefined
                    try {
                        const { headers } = await import('next/headers')
                        const headerList = await headers()
                        ip = headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || undefined
                        ua = headerList.get('user-agent') || undefined
                    } catch (hError) { }

                    await logAdminActivity({
                        adminId: parseInt(token.id as string),
                        action: 'admin_logout',
                        description: `Admin logged out: ${token.name || token.email}`,
                        metadata: { email: token.email },
                        ipAddress: ip,
                        userAgent: ua
                    })
                } catch (e) {
                    console.error('Failed to log admin logout:', e)
                }
            } else if (token?.role === 'student') {
                try {
                    const { logStudentActivity } = await import('@/lib/student-activity')
                    await logStudentActivity(
                        parseInt(token.id as string),
                        'logout',
                        `Student logged out: ${token.name || token.email}`
                    )
                } catch (e) {
                    console.error('Failed to log student logout:', e)
                }
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}
