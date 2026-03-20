import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { EditStudentClient } from "./EditStudentClient"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default async function EditProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'student') {
        redirect("/login")
    }

    const student = await prisma.students.findUnique({
        where: { id: parseInt(session.user.id) },
        include: {
            session_rel: true,
            department_rel: true,
            hall_rel: true,
            upazila_rel: true,
        }
    })

    if (!student) {
        return <div>Student not found</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800">Titas Student Portal</h1>
                    <LanguageSwitcher />
                </div>

                <EditStudentClient student={student} />
            </div>
        </div>
    )
}
