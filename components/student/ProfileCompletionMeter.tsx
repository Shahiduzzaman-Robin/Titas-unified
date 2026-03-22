"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { CheckCircle2, Circle, Target, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProfileCompletionMeterProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    student: any
}

export default function ProfileCompletionMeter({ student }: ProfileCompletionMeterProps) {
    const t = useTranslations('student.profile.completion')

    const fields = [
        { name: t('basicInfo'), completed: !!(student.name_en && student.name_bn) },
        { name: t('photo'), completed: !!student.image_path },
        { name: t('contact'), completed: !!(student.mobile && student.email) },
        { name: t('address'), completed: !!(student.address_en && student.upazila) },
        { name: t('academic'), completed: !!(student.department && student.student_session && student.hall) },
        { name: t('duReg'), completed: !!student.du_reg_number },
        { name: t('bloodGroup'), completed: !!student.blood_group },
    ]

    const completedCount = fields.filter(f => f.completed).length
    const totalCount = fields.length
    const percentage = Math.round((completedCount / totalCount) * 100)

    return (
        <Card className="dashboard-card h-full">
            <CardHeader className="border-b border-slate-100/60 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#00827F]">
                        <Target className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900">{t('title')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('progress')}</p>
                            <span className="text-3xl font-black text-slate-900">{percentage}%</span>
                        </div>
                        <p className="text-[11px] font-bold text-[#00827F] bg-[#E0F7F6] px-2 py-1 rounded-lg">
                            {completedCount} / {totalCount} {t('fieldsCompleted')}
                        </p>
                    </div>
                    <div className="completion-bar-container">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="completion-bar-fill"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                    {fields.map((field, index) => (
                        <div 
                            key={index} 
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                                field.completed 
                                    ? "bg-green-50/30 border-green-100/50 text-green-700" 
                                    : "bg-slate-50/50 border-slate-100 text-slate-400"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                                field.completed ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-400"
                            )}>
                                {field.completed ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <Circle className="w-3 h-3 stroke-[3]" />
                                )}
                            </div>
                            <span className="text-xs font-bold leading-none">
                                {field.name}
                            </span>
                        </div>
                    ))}
                </div>

                {percentage < 100 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-[#E0F7F6] border border-[#B2E6E3] rounded-2xl flex gap-3 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-150 transition-transform">
                            <Sparkles className="w-12 h-12 text-[#00827F]" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#00827F] shadow-sm shrink-0">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-bold text-[#00827F] leading-relaxed z-10">
                            {t('encouragement')}
                        </p>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
