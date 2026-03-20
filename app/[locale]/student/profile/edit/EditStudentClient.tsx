"use client"

import { StudentForm } from "@/components/registration/StudentForm"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from 'next-intl'

export function EditStudentClient({ student }: { student: any }) {
    const t = useTranslations('student.edit')
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (formData: any, imageFile: File | null) => {
        setSubmitting(true)
        try {
            // 1. Upload Image (if changed/new)
            if (imageFile) {
                const uploadFormData = new FormData()
                uploadFormData.append("file", imageFile)

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                })

                if (!uploadRes.ok) throw new Error("Image upload failed")
                const { imagePath } = await uploadRes.json()
                formData.image_path = imagePath
            }

            // 2. Submit Changes
            const res = await fetch('/api/student/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(t('success'))
                router.push("/student/profile")
                router.refresh()
            } else {
                toast.error(data.message || t('error'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('error'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-center">{t('title')}</h1>
            <StudentForm
                initialData={student}
                mode="edit"
                onSubmit={handleSubmit}
                isSubmitting={submitting}
            />
        </div>
    )
}
