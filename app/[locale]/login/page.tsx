'use client'

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { useTranslations } from 'next-intl'
import Link from "next/link"
import { PublicNav } from "@/components/PublicNav"
import Footer from "@/components/home/Footer"
import "@/styles/Auth.css"

export default function LoginPage() {
    const t = useTranslations('public.login')
    const router = useRouter()
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    // Redirect based on role
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            if (session.user.role === 'student') {
                router.push("/student/profile")
            } else {
                router.push("/admin/dashboard")
            }
        }
    }, [status, session, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMessage("")

        try {
            const result = await signIn("credentials", {
                username: formData.username,
                password: formData.password,
                redirect: false,
            })

            console.log("Login Result:", result);

            if (result?.error) {
                const message = t('invalidCredentials') || "Invalid username or password"
                setErrorMessage(message)
                toast.error(message)
            } else {
                toast.success(t('success') || "Login successful")
                // Hard redirect to route handler which will use session to direct them to /admin/dashboard or /student/profile
                // Or simply redirect them to home to allow layout wrapper to bounce them appropriately
                window.location.href = "/bn"
            }
        } catch (error) {
            console.error("Login Exception:", error);
            const message = t('error') || "An unexpected error occurred"
            setErrorMessage(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-slate-600 font-medium animate-pulse">Verifying Session...</p>
                </div>
            </div>
        )
    }

    if (status === "authenticated") return null

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <PublicNav />
            
            <main className="flex-1 auth-page-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[450px]"
                >
                    <div className="auth-card">
                        <div className="auth-header">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/30"
                            >
                                <Lock className="w-8 h-8 text-white" />
                            </motion.div>
                            <h1 className="flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5 opacity-80" />
                                {t('title')}
                                <Sparkles className="w-5 h-5 opacity-80" />
                            </h1>
                            <p>{t('subtitle')}</p>
                        </div>

                        <div className="p-8 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-slate-700 font-semibold ml-1">
                                        {t('emailOrMobile')}
                                    </Label>
                                    <div className="auth-input-group">
                                        <Input
                                            id="username"
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="email@example.com or 01XXXXXXXXX"
                                            className="auth-input"
                                            required
                                        />
                                        <Mail className="auth-input-icon h-5 w-5" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="password" className="text-slate-700 font-semibold">
                                            {t('password')}
                                        </Label>
                                        <Link
                                            href="/student/forgot-password"
                                            className="auth-footer-link"
                                        >
                                            {t('forgotPassword')}
                                        </Link>
                                    </div>
                                    <div className="auth-input-group">
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="auth-input"
                                            required
                                        />
                                        <Lock className="auth-input-icon h-5 w-5" />
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm text-center font-medium">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full auth-button group"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : (
                                        <>
                                            {t('login')}
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-slate-400 font-medium tracking-widest">
                                            New Student?
                                        </span>
                                    </div>
                                </div>

                                <Link href="/register" className="block">
                                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold">
                                        {t('registerLink')}
                                    </Button>
                                </Link>
                            </form>
                        </div>
                    </div>
                    
                    {/* Copyright text removed as requested */}
                </motion.div>
            </main>
            <Footer />
        </div>
    )
}
