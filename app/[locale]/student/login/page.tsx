"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Mail, User } from "lucide-react"
import { useTranslations } from 'next-intl'
import { PublicNav } from "@/components/PublicNav"
import Link from "next/link"

export default function StudentLoginPage() {
    const t = useTranslations('student.login')
    const router = useRouter()
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    // Redirect if already authenticated
    useEffect(() => {
        if (status === "authenticated") {
            // If student, go to profile. If admin, go to dashboard.
            if (session?.user?.role === 'admin') {
                router.push("/admin/dashboard")
            } else {
                router.push("/student/profile")
            }
        }
    }, [status, router, session])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                username: formData.username,
                password: formData.password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Invalid credentials")
            } else {
                toast.success("Logged in successfully")
                router.push("/student/profile")
                router.refresh()
            }
        } catch (error) {
            toast.error("An error occurred during login")
        } finally {
            setLoading(false)
        }
    }

    if (status === "loading" || status === "authenticated") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <>
            <PublicNav />
            <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center px-4">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="shadow-lg border-gray-200">
                        <CardHeader className="text-center space-y-2">
                            <CardTitle className="text-2xl font-bold text-gray-900">{t('title')}</CardTitle>
                            <CardDescription className="text-gray-600">
                                {t('subtitle')}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Email or Mobile</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="username"
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="01XXXXXXXXX or email@example.com"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Link
                                            href="/student/forgot-password"
                                            className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
                                        >
                                            {t('forgotPassword')}
                                        </Link>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </Button>

                                <div className="text-center mt-4">
                                    <Link
                                        href="/register"
                                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                                    >
                                        {t('registerLink')}
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    )
}
