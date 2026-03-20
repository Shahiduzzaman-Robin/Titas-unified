"use client"

import { useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, ArrowLeft, Loader2, Sparkles, KeyRound, CheckCircle2, ShieldAlert } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from "next/navigation"
import { PublicNav } from "@/components/PublicNav"
import Link from "next/link"
import "@/styles/Auth.css"

function ResetPasswordForm() {
    const t = useTranslations('student.resetPassword')
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const mobile = searchParams.get('mobile')
    const otp = searchParams.get('otp')

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error(t('mismatch'))
            return
        }

        if (!token && (!mobile || !otp)) {
            toast.error("Invalid verification credentials")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    mobile,
                    otp,
                    password: formData.password
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                toast.success(t('success'))
                setTimeout(() => router.push("/login"), 3000)
            } else {
                toast.error(data.message || "Failed to reset password")
            }
        } catch (error) {
            toast.error("Failed to send request")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
            >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-slate-900 font-bold text-xl">{t('success')}</h2>
                    <p className="text-slate-500">Your password has been updated. Redirecting to login...</p>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                        className="h-full bg-primary"
                    />
                </div>
            </motion.div>
        )
    }

    if (!token && (!mobile || !otp)) {
        return (
            <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-lg font-bold text-slate-900">Invalid Link</h2>
                    <p className="text-slate-500 text-sm">This reset link is invalid or has expired.</p>
                </div>
                <Link href="/student/forgot-password" title="Try Again">
                    <Button variant="outline" className="w-full mt-4">Try Again</Button>
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <div className="auth-input-group">
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="auth-input"
                        required
                        autoFocus
                    />
                    <Lock className="auth-input-icon h-5 w-5" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmLabel')}</Label>
                <div className="auth-input-group">
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="auth-input"
                        required
                    />
                    <Lock className="auth-input-icon h-5 w-5" />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full auth-button"
                disabled={loading}
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                    t('submit')
                )}
            </Button>
        </form>
    )
}

export default function ResetPasswordPage() {
    const t = useTranslations('student.resetPassword')

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
                                <KeyRound className="w-8 h-8 text-white" />
                            </motion.div>
                            <h1 className="flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5 opacity-80" />
                                {t('title')}
                                <Sparkles className="w-5 h-5 opacity-80" />
                            </h1>
                            <p>{t('description')}</p>
                        </div>

                        <div className="p-8 md:p-10">
                            <Suspense fallback={
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                    <p className="text-slate-400 text-sm font-medium">Preparing reset form...</p>
                                </div>
                            }>
                                <ResetPasswordForm />
                            </Suspense>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
