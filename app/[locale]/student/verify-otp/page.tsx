"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, ArrowLeft, Loader2, Sparkles, ShieldCheck } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from "next/navigation"
import { PublicNav } from "@/components/PublicNav"
import Link from "next/link"
import "@/styles/Auth.css"

export default function VerifyOtpPage() {
    const t = useTranslations('student.verifyOtp')
    const router = useRouter()
    const searchParams = useSearchParams()
    const mobile = searchParams.get('mobile')

    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!mobile) {
            toast.error("Mobile number missing")
            setLoading(false)
            return
        }

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, otp: otp.toUpperCase() }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                toast.success(t('success'))
                router.push(`/student/reset-password?mobile=${encodeURIComponent(mobile)}&otp=${encodeURIComponent(otp.toUpperCase())}`)
            } else {
                toast.error(data.message || t('error'))
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (!mobile) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <PublicNav />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Request</h2>
                        <p className="text-slate-500 mb-6">Mobile number parameter is missing.</p>
                        <Link href="/login">
                            <Button className="w-full">Back to Login</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

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
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </motion.div>
                            <h1 className="flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5 opacity-80" />
                                {t('title')}
                                <Sparkles className="w-5 h-5 opacity-80" />
                            </h1>
                            <p className="max-w-[280px] mx-auto opacity-90">{t('description')} to <span className="font-bold underline tracking-wider">{mobile}</span></p>
                        </div>

                        <div className="p-8 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-slate-700 font-semibold ml-1">
                                        {t('otpLabel')}
                                    </Label>
                                    <div className="auth-input-group">
                                        <Input
                                            id="otp"
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.toUpperCase())}
                                            placeholder="XXXX"
                                            className="auth-input tracking-[1rem] text-center font-bold text-xl uppercase pr-0"
                                            maxLength={4}
                                            required
                                            autoFocus
                                        />
                                        <MessageSquare className="auth-input-icon h-5 w-5" />
                                    </div>
                                    <p className="text-xs text-center text-slate-400 mt-2">
                                        Didn't receive code? <button type="button" className="text-primary hover:underline font-semibold" onClick={() => toast.info("Resend feature coming soon!")}>Resend</button>
                                    </p>
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

                                <div className="text-center pt-2">
                                    <Link
                                        href="/login"
                                        className="auth-footer-link inline-flex items-center"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
