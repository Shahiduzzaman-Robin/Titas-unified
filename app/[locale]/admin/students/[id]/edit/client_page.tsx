"use client"

import { StudentForm } from "@/components/registration/StudentForm"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function EditStudentClient({ student }: { student: any }) {
    const router = useRouter()
    const t = useTranslations('common')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (formData: any, imageFile: File | null) => {
        setSubmitting(true)
        try {
            // 1. Upload Image (if changed)
            if (imageFile) {
                const uploadFormData = new FormData()
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

            // 2. Update Student Data
            const res = await fetch(`/api/students?id=${student.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(data.message || t('updateSuccess'))
                router.push(`/${student.locale || 'bn'}/admin/students/${student.id}`)
                router.refresh()
            } else {
                toast.error(data.error || t('updateFailed'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('error'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <StudentForm
            initialData={student}
            mode="edit"
            onSubmit={handleSubmit}
            isSubmitting={submitting}
        />
    )
}
