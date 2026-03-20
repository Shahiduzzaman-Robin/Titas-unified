"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, FileText, User, GraduationCap, Building2, Droplets, Phone, Mail, MapPin, Globe, Fingerprint, Calendar } from "lucide-react"
import StudentIDCard from "@/components/admin/StudentIDCard"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"

interface ProfileClientProps {
    student: any
    locale: string
}

export default function ProfileClient({ student, locale }: ProfileClientProps) {
    const [showIdCard, setShowIdCard] = useState(false)
    const t = useTranslations('student.profile')
    const common = useTranslations('common')

    return (
        <Card className="dashboard-card lg:col-span-8">
            <CardHeader className="border-b border-slate-100/60 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            {showIdCard ? <CreditCard className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <CardTitle className="text-xl font-black text-slate-900">
                            {showIdCard ? common('idCard.title') : t('detailsTitle')}
                        </CardTitle>
                    </div>
                    <Button
                        variant={showIdCard ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowIdCard(!showIdCard)}
                        className="gap-2 h-10 px-4 rounded-xl font-bold transition-all"
                    >
                        {showIdCard ? (
                            <>
                                <FileText className="w-4 h-4" />
                                {t('viewDetails')}
                            </>
                        ) : (
                            <>
                                <Fingerprint className="w-4 h-4" />
                                {t('viewDigitalId')}
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-8">
                <AnimatePresence mode="wait">
                    {showIdCard ? (
                        <motion.div 
                            key="idcard"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex justify-center py-4"
                        >
                            <StudentIDCard student={student} locale={locale} />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="details"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="space-y-8"
                        >
                            {/* Academic Information */}
                            <section>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    Academic Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem icon={<Fingerprint />} label={t('duReg')} value={student.du_reg_number} />
                                    <DetailItem icon={<Building2 />} label={t('department')} value={student.department_rel?.name_en || student.department} subValue={student.department_rel?.name_bn} />
                                    <DetailItem icon={<Globe />} label={t('hall')} value={student.hall_rel?.name_en || student.hall} subValue={student.hall_rel?.name_bn} />
                                    <DetailItem icon={<Calendar />} label={t('session')} value={student.session_rel?.name || student.student_session} />
                                </div>
                            </section>

                            {/* Contact & Personal */}
                            <section>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Contact & Location
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem icon={<Phone />} label={t('mobile')} value={student.mobile} />
                                    <DetailItem icon={<Mail />} label={t('email')} value={student.email} />
                                    <DetailItem icon={<MapPin />} label={t('upazila')} value={student.upazila_rel?.name_en || student.upazila} subValue={student.upazila_rel?.name_bn} />
                                    <DetailItem icon={<Droplets className="text-red-500" />} label={t('bloodGroup')} value={student.blood_group} />
                                </div>
                                <div className="mt-4">
                                    <DetailItem 
                                        icon={<MapPin />} 
                                        label={t('presentAddress')} 
                                        value={student.address_en} 
                                        subValue={student.address_bn}
                                        fullWidth
                                    />
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}

function DetailItem({ icon, label, value, subValue, fullWidth = false }: { icon: React.ReactNode, label: string, value?: string | null, subValue?: string | null, fullWidth?: boolean }) {
    return (
        <div className={cn("detail-item group", fullWidth && "md:col-span-2")}>
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="font-bold text-slate-900 leading-tight">{value || "Not Provided"}</p>
                    {subValue && <p className="text-sm text-slate-500 font-medium mt-0.5">{subValue}</p>}
                </div>
            </div>
        </div>
    )
}

import { cn } from "@/lib/utils"
