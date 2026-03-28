import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Edit, MapPin, Calendar, CreditCard, Award, Bell, ShieldCheck, UserCheck, AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SignOutButton } from "@/components/SignOutButton"
import { getStudentImageUrl, cn } from "@/lib/utils"
import { getLocale, getTranslations } from 'next-intl/server'
import ProfileClient from "./ProfileClient"
import ChangePasswordDialog from "@/components/student/ChangePasswordDialog"
import { PublicNav } from "@/components/PublicNav"
import ProfileCompletionMeter from "@/components/student/ProfileCompletionMeter"
import ActivityTimeline from "@/components/student/ActivityTimeline"
import SecurityActivity from "@/components/student/SecurityActivity"
import "@/styles/StudentDashboard.css"

export default async function StudentProfilePage() {
    const session = await getServerSession(authOptions)
    const t = await getTranslations('student.profile')
    const common = await getTranslations('common')
    const locale = await getLocale()

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
            approver: true,
        }
    })

    if (!student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900">Student Not Found</h2>
                    <p className="text-slate-500 mt-2">We couldn't locate your profile in our records.</p>
                </div>
            </div>
        )
    }

    // Fetch all edit history for activity timeline
    const editHistory = await prisma.student_edits.findMany({
        where: {
            studentId: student.id
        },
        include: {
            admin: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    // Combine edits with initial registration
    const allActivities = [...editHistory]

    // Only add registration to timeline if it's not pending (0)
    if (student.approval !== 0) {
        allActivities.push({
            id: student.id,
            status: student.approval === 1 ? 'approved' : 'rejected',
            createdAt: student.createdAt,
            reviewedAt: student.updatedAt,
            reviewNote: student.deny_reason,
            admin: (student as any).approver,
            isRegistration: true
        } as any)
    }

    // Re-sort to ensure correct timeline order
    allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Check for pending edits (for the warning banner)
    const pendingEdit = editHistory.find(edit => edit.status === 'pending')

    return (
        <div className="dashboard-container">
            <PublicNav session={session} />
            
            <div className="max-w-6xl mx-auto px-4 pt-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold premium-gradient-text tracking-tight mb-2">
                            Welcome Back, {student.name_en.split(' ')[0]}!
                        </h1>
                        <div className="flex flex-wrap gap-3">
                            <span className={cn(
                                "stat-badge",
                                student.approval === 1 ? "stat-badge-success" : student.approval === 0 ? "stat-badge-warning" : "stat-badge-primary"
                            )}>
                                {student.approval === 1 ? (
                                    <>
                                        <ShieldCheck className="w-4 h-4" />
                                        Verified Member
                                    </>
                                ) : (
                                    <>
                                        <Bell className="w-4 h-4" />
                                        Membership Pending
                                    </>
                                )}
                            </span>
                            <span className="stat-badge stat-badge-primary">
                                <Award className="w-4 h-4" />
                                Batch {student.session_rel?.name || student.student_session}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link href="/student/profile/edit">
                            <Button className="rounded-xl h-11 px-6 shadow-indigo-100 shadow-lg hover:shadow-indigo-200 transition-all font-semibold" variant="outline">
                                <Edit className="w-4 h-4 mr-2" />
                                {t('editProfile')}
                            </Button>
                        </Link>
                        <SignOutButton />
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column - Sidebar Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="dashboard-card pt-8">
                            <CardContent className="flex flex-col items-center text-center">
                                <div className="profile-avatar-container mb-6 group cursor-pointer relative">
                                    <div className="profile-avatar-inner relative w-40 h-40">
                                        <Image
                                            src={getStudentImageUrl(student.image_path)}
                                            alt={student.name_en || "Profile"}
                                            fill
                                            className="object-cover rounded-full"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Edit className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900">{student.name_en}</h2>
                                    <p className="text-slate-500 font-medium text-lg">{student.name_bn}</p>
                                </div>

                                <div className="mt-8 w-full space-y-3">
                                    <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('titasId')}</p>
                                            <p className="font-bold text-slate-900">TITAS-{student.id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('accountRegistered')}</p>
                                            <p className="font-bold text-slate-900">
                                                {new Date(student.createdAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50">
                                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('bloodGroup')}</p>
                                            <p className="font-bold text-red-600">
                                                {student.blood_group || "Unknown"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 w-full px-2">
                                     <ChangePasswordDialog />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="hidden lg:block">
                            <ProfileCompletionMeter student={student} />
                        </div>
                    </div>

                    {/* Right Column - Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {pendingEdit && (
                            <div className="bg-amber-50/80 backdrop-blur-md border border-amber-200 text-amber-900 p-6 rounded-3xl flex items-start gap-4 shadow-xl shadow-amber-900/5">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                                    <Bell className="w-6 h-6 text-amber-600 animate-bounce" />
                                </div>
                                <div>
                                    <h4 className="font-black text-lg">Under Review</h4>
                                    <p className="opacity-90 leading-relaxed font-medium">
                                        {t('pendingChanges')}. An admin will review and verify your updates soon.
                                    </p>
                                </div>
                            </div>
                        )}

                        <ProfileClient student={student} locale={locale} />
                        
                        <Link 
                            href={`/${locale}/student/security`}
                            className="bg-white w-full rounded-[2rem] border-0 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-6 md:p-8 flex items-center justify-between hover:shadow-[0_10px_40px_-5px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-7 h-7 group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Account Security & Activity</h3>
                                    <p className="text-slate-500 font-medium mt-1 text-sm">View up to 100 recent login, logout, and password change events.</p>
                                </div>
                            </div>
                            <div className="shrink-0 bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 p-3 sm:p-4 rounded-xl transition-colors flex ml-4">
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                        </Link>
                        
                        <div className="lg:hidden">
                            <ProfileCompletionMeter student={student} />
                        </div>
                        
                        <ActivityTimeline edits={allActivities} student={student} />
                    </div>
                </div>
            </div>
            
            <footer className="mt-20 border-t border-slate-200/60 py-10 text-center">
                <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">
                    &copy; {new Date().getFullYear()} Titas Students Union • Secure Member Portal
                </p>
            </footer>
        </div>
    )
}
