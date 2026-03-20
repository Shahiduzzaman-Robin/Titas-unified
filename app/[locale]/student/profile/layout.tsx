
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export default async function StudentProfileLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode
    params: { locale: string }
}) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'student') {
        redirect(`/${locale}/login`)
    }

    if (session.user.approval === 0) {
        redirect(`/${locale}/student/pending`)
    }

    return <>{children}</>
}
