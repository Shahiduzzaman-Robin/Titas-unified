import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { PublicNav } from "@/components/PublicNav"
import SecurityActivity from "@/components/student/SecurityActivity"
import { getLocale, getTranslations } from "next-intl/server"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function SecurityActivityPage() {
    const session = await getServerSession(authOptions)
    const locale = await getLocale()

    if (!session || session.user.role !== 'student') {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PublicNav session={session} />
            
            <div className="max-w-6xl mx-auto px-4 pt-12 pb-24">
                <div className="mb-8">
                    <Link 
                        href={`/${locale}/student/profile`} 
                        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Profile
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Account Security & Activity
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Review your recent login, logout, and security events. Capturing up to the last 100 recorded items.
                    </p>
                </div>
                
                {/* Re-using the same solid component, but now it acts as the primary content of the page */}
                <div className="w-full">
                    <SecurityActivity />
                </div>
            </div>
            
            <footer className="mt-8 border-t border-slate-200/60 py-10 text-center">
                <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">
                    &copy; {new Date().getFullYear()} Titas Students Union • Secure Member Portal
                </p>
            </footer>
        </div>
    )
}
