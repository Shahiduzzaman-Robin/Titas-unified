import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ReviewEditClient } from "./ReviewEditClient"

export default async function ReviewPage({
    params: { id, locale }
}: {
    params: { id: string, locale: string }
}) {
    const editId = parseInt(id)

    const edit = await prisma.student_edits.findUnique({
        where: { id: editId },
        include: { student: true }
    })

    if (!edit) {
        notFound()
    }

    // Parse changes if it's a string
    const parsedEdit = {
        ...edit,
        changes: typeof edit.changes === 'string' ? JSON.parse(edit.changes) : edit.changes
    }
    return (
        <ReviewEditClient edit={parsedEdit} student={edit.student} locale={locale} />
    )
}
