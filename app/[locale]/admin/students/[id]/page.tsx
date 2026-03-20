
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Printer, Check, X, Trash2 } from "lucide-react"
import Link from "next/link"
import { getTranslations } from 'next-intl/server'
import { getStudentImageUrl } from "@/lib/utils"
import StudentActions from "./actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StudentIDCard from "@/components/admin/StudentIDCard"

export default async function StudentDetailsPage({
    params: { locale, id }
}: {
    params: { locale: string, id: string }
}) {
    const student = await prisma.students.findUnique({
        where: { id: parseInt(id) },
        include: {
            department_rel: true,
            hall_rel: true,
            session_rel: true,
            upazila_rel: true,
            activity_logs: {
                include: {
                    admin: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    })

    if (!student) {
        notFound()
    }

    const t = await getTranslations('admin.students')
    const common = await getTranslations('common')

    return (
        <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}/admin/students`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-wrap items-baseline gap-x-2">
                            {student.name_en}
                            <span className="text-sm sm:text-lg font-normal text-gray-400">({student.name_bn || t('noName')})</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">ID: {student.id}</span>
                            <span className="text-gray-300">•</span>
                            <span>{student.student_session}</span>
                            <span className="text-gray-300">•</span>
                            <span className="truncate">{student.department}</span>
                        </p>
                    </div>
                </div>
                <StudentActions student={student} />
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <div className="w-full overflow-x-auto pb-1 scrollbar-hide no-print">
                    <TabsList className="bg-white border w-full sm:w-auto h-auto p-1 flex sm:inline-flex justify-start">
                        <TabsTrigger value="overview" className="flex-1 sm:flex-none py-2 px-4 whitespace-nowrap">{common('settings.profile')}</TabsTrigger>
                        <TabsTrigger value="idcard" className="flex-1 sm:flex-none py-2 px-4 whitespace-nowrap">{common('idCard.title')}</TabsTrigger>
                        <TabsTrigger value="timeline" className="flex-1 sm:flex-none py-2 px-4 whitespace-nowrap">{t('timeline.title')}</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Image & Basic Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <div className="w-48 h-48 rounded-lg overflow-hidden border-4 border-gray-100 mb-4">
                                        <img
                                            src={getStudentImageUrl(student.image_path)}
                                            alt="Student"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <Badge className="mb-2" variant={
                                        student.approval === 1 ? "default" :
                                            student.approval === 2 ? "destructive" : "secondary"
                                    }>
                                        {student.approval === 1 ? t('approved') :
                                            student.approval === 2 ? t('rejected') : t('pending')}
                                    </Badge>
                                    <p className="text-sm text-gray-500 font-mono">{student.prefix}-{student.id}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('contactInfo')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500">{t('mobile')}</label>
                                        <p className="font-medium">{student.mobile}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">{t('email')}</label>
                                        <p className="font-medium">{student.email || "N/A"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            {(student.job_position || student.job_designation) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('jobInfo')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('institutionName')}</label>
                                            <p className="text-lg font-medium">{student.job_position || "N/A"}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('designation')}</label>
                                            <p className="text-lg font-medium">{student.job_designation || "N/A"}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column: Detailed Info */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('academicInfo')}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('session')}</label>
                                        <p className="text-lg font-medium">
                                            {student.student_session}
                                            {student.session_rel?.name_bn && <span className="text-sm text-gray-500 ml-2 font-bengali">({student.session_rel.name_bn})</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('department')}</label>
                                        <p className="text-lg font-medium">
                                            {student.department}
                                            {student.department_rel?.name_bn && <span className="text-sm text-gray-500 ml-2 font-bengali">({student.department_rel.name_bn})</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('hall')}</label>
                                        <p className="text-lg font-medium">
                                            {student.hall}
                                            {student.hall_rel?.name_bn && <span className="text-sm text-gray-500 ml-2 font-bengali">({student.hall_rel.name_bn})</span>}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('personalInfo')}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('nameEn')}</label>
                                        <p className="font-medium">{student.name_en}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('nameBn')}</label>
                                        <p className="font-medium font-bengali">{student.name_bn || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('duRegNumber')}</label>
                                        <p className="font-medium text-lg">{student.du_reg_number || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('upazila')}</label>
                                        <p className="font-medium">
                                            {student.upazila}
                                            {student.upazila_rel?.name_bn && <span className="text-sm text-gray-500 ml-2 font-bengali">({student.upazila_rel.name_bn})</span>}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('addressEn')}</label>
                                        <p className="font-medium">{student.address_en}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('addressBn')}</label>
                                        <p className="font-medium font-bengali">{student.address_bn || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('bloodGroup')}</label>
                                        <p className="font-medium">{student.blood_group}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('gender')}</label>
                                        <p className="font-medium capitalize">{t(student.gender)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {student.approval === 2 && student.deny_reason && (
                                <Card className="border-red-200 bg-red-50">
                                    <CardHeader>
                                        <CardTitle className="text-red-900">Rejection Reason</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-red-800">{student.deny_reason}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="idcard" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{common('idCard.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto pb-6">
                            <div className="min-w-fit mx-auto">
                                <StudentIDCard student={student} locale={locale} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="timeline" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('timeline.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {student.activity_logs.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">
                                        {t('timeline.noActivity')}
                                    </div>
                                ) : (
                                    student.activity_logs.map((log: any, index: number) => (
                                        <div key={log.id} className="relative flex items-start gap-6 group">
                                            {/* Circle Marker */}
                                            <div className="absolute left-5 -translate-x-1/2 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 ring-4 ring-indigo-50 shadow-sm transition-all group-hover:scale-110" />
                                            
                                            <div className="flex-1 ml-10">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {t(`timeline.actions.${log.action}`)}
                                                    </h4>
                                                    <time className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                        {new Date(log.createdAt).toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-GB', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </time>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed mb-2 italic">
                                                    "{log.description}"
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center gap-1.5 py-1 px-2.5 bg-gray-50 rounded-full border border-gray-100">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        <span className="text-[11px] font-medium text-gray-500">
                                                            Admin: <span className="text-gray-900">{log.admin?.name || 'System Admin'}</span>
                                                        </span>
                                                    </div>
                                                    {log.ipAddress && (
                                                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50/50 px-1.5 py-0.5 rounded">
                                                            IP: {log.ipAddress}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                
                                {/* Initial Registration Event (Fallback if not in logs) */}
                                {student.activity_logs.every((l: any) => l.action !== 'registration') && (
                                    <div className="relative flex items-start gap-6 group">
                                        <div className="absolute left-5 -translate-x-1/2 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300 ring-4 ring-slate-50 shadow-sm" />
                                        <div className="flex-1 ml-10">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">
                                                    {t('timeline.actions.registration')}
                                                </h4>
                                                <time className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                    {new Date(student.createdAt).toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-GB', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </time>
                                            </div>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                Student registered in the system.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    )
}
