"use client"

import { useTranslations } from 'next-intl'
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { Button } from "@/components/ui/button"
import { StudentForm } from "@/components/registration/StudentForm"
import { PublicNav } from "@/components/PublicNav"
import Footer from "@/components/home/Footer"

import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"

export default function Register() {
    const t = useTranslations('public.register')
    const tNav = useTranslations('nav')
    const tPublic = useTranslations('public')
    const router = useRouter()
    const locale = useLocale()

    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (formData: any, imageFile: File | null) => {
        setSubmitting(true)
        try {
            // 1. Upload Image
            const uploadFormData = new FormData()
            if (imageFile) {
                uploadFormData.append("file", imageFile)

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                })

                if (!uploadRes.ok) {
                    throw new Error("Image upload failed")
                }

                const { imagePath } = await uploadRes.json()
                formData.image_path = imagePath
            }

            // 2. Submit Student Data
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(data.message || t('successMessage'))
                router.push(`/${locale}/register/success`)
            } else {
                toast.error(data.error || t('submitError'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('submitError'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 bn-text">
            <PublicNav />
            <div className="py-10 px-4">
                <div className="max-w-4xl mx-auto space-y-6">

                    <StudentForm
                        onSubmit={handleSubmit}
                        isSubmitting={submitting}
                    />
                </div>
            </div>
            <Footer />
        </main>
    )
}
