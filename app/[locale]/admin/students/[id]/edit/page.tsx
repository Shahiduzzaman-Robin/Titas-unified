import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EditStudentClient } from "./client_page"
import { getTranslations } from 'next-intl/server'

export default async function EditStudentPage({
    params: { locale, id }
}: {
    params: { locale: string, id: string }
}) {
    const student = await prisma.students.findUnique({
        where: { id: parseInt(id) }
    })

    if (!student) {
        notFound()
    }

    const t = await getTranslations('admin.students')

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Student: {student.name_en}</h1>
            </div>

            <EditStudentClient student={student} />
        </div>
    )
}
