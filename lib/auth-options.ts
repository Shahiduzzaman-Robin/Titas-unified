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
            async authorize(credentials, req) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                const username = credentials.username
                const password = credentials.password

                // Extract IP and User Agent from the request
                const ip = req?.headers?.['x-forwarded-for']?.toString().split(',')[0] 
                         || req?.headers?.['x-real-ip']?.toString() 
                         || 'Unknown'
                const ua = req?.headers?.['user-agent']?.toString() || 'Unknown'

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
                        // @ts-ignore - legacy_password may exist in DB but not in generated types
                        if (student.legacy_password) {
                            // @ts-ignore
                            const isLegacyValid = await verifyLegacyPassword(password, student.legacy_password)
                            if (isLegacyValid) {
                                // UPGRADE! Re-hash to current format and remove legacy hash
                                console.log(`🚀 Upgrading legacy password for ${student.email || student.mobile}`)
                                const newHash = await hashPassword(password)
                                
                                await prisma.$executeRawUnsafe(
                                    `UPDATE students SET password = ?, legacy_password = NULL WHERE id = ?`,
                                    newHash,
                                    student.id
                                )

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
        signIn: "/login",
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
            if (user.role === 'student') {
                let ip = 'Unknown'
                let ua = 'Unknown'
                try {
                    const { headers } = await import('next/headers')
                    const headerList = await headers()
                    ip = headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || 'Unknown'
                    ua = headerList.get('user-agent') || 'Unknown'
                } catch (e) { }

                try {
                    const { logStudentActivity } = await import('@/lib/student-activity')
                    logStudentActivity(
                        parseInt(user.id),
                        'login',
                        `Student logged in: ${user.name || user.email}`,
                        ip,
                        ua
                    ).catch(e => console.error('Login log delivery error:', e))
                } catch (e) {
                    console.error('Import student-activity error in events.signIn:', e)
                }
            }
        }
        // SignOut event removed. Logout logging is explicitly handled by /api/auth/logout
    },
    secret: process.env.NEXTAUTH_SECRET,
}
