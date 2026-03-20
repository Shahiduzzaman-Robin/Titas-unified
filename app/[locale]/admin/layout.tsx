import { getServerSession } from "next-auth"
import crypto from "crypto"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { AdminNav } from "@/components/AdminNav"
import { PublicNav } from "@/components/PublicNav"
import "@/styles/Admin.css"
import "@/styles/AdminDashboard.css"

export default async function AdminLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode,
    params: { locale: string }
}) {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'admin') {
        redirect(`/${locale}/login`)
    }

    const email = session.user?.email || ''
    const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=mp`

    return (
        <div className="admin-root">
            <PublicNav session={session} />
            <AdminNav
                userEmail={email}
                userName={session.user?.name || 'Admin'}
                userImage={gravatarUrl}
            />
            <div className="admin-main">
                {children}
            </div>
        </div>
    )
}
