"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Loader2, Sparkles, KeyRound, CheckCircle2 } from "lucide-react"
import { useTranslations } from 'next-intl'
import { PublicNav } from "@/components/PublicNav"
import Link from "next/link"
import "@/styles/Auth.css"

export default function ForgotPasswordPage() {
    const t = useTranslations('student.forgotPassword')
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [sentTo, setSentTo] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: email }), // Using email state for identifier
            })

            const data = await res.json()

            if (res.ok) {
                if (data.type === 'mobile') {
                    // Redirect to OTP Verification
                    window.location.href = `/student/verify-otp?mobile=${encodeURIComponent(email)}`
                } else {
                    setSubmitted(true)
                    toast.success("Reset link sent!")
                    // Assuming data.email contains the email sent to
                    if (data.email) {
                        setSentTo(data.email)
                    }
                }
            } else {
                toast.error(data.message || "An error occurred. Please try again.")
            }
        } catch (error) {
            toast.error("Failed to send request")
        } finally {
            setLoading(false)
        }
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
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div 
                                        key="success"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="text-center space-y-6"
                                    >
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-slate-900 font-bold text-lg">{t('success')}</p>
                                            {sentTo && (
                                                <p className="text-slate-500 text-sm">
                                                    We've sent instructions to <br/>
                                                    <span className="font-semibold text-slate-900">{sentTo}</span>
                                                </p>
                                            )}
                                        </div>
                                        <Link href="/login" className="block">
                                            <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 transition-all font-semibold">
                                                {t('back')}
                                            </Button>
                                        </Link>
                                    </motion.div>
                                ) : (
                                    <motion.form 
                                        key="form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleSubmit} 
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-slate-700 font-semibold ml-1">
                                                {t('emailLabel')}
                                            </Label>
                                            <div className="auth-input-group">
                                                <Input
                                                    id="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="01XXXXXXXXX or email@example.com"
                                                    className="auth-input"
                                                    required
                                                />
                                                <Mail className="auth-input-icon h-5 w-5" />
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

                                        <div className="text-center pt-2">
                                            <Link
                                                href="/login"
                                                className="auth-footer-link inline-flex items-center"
                                            >
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                {t('back')}
                                            </Link>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center mt-8 text-slate-500 text-sm font-medium"
                    >
                        Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
                    </motion.p>
                </motion.div>
            </main>
        </div>
    )
}
