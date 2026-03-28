'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { Clock, CheckCircle2, XCircle, AlertCircle, Eye, ChevronLeft, ChevronRight, History, Calendar, UserCheck, ShieldAlert, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ActivityTimelineProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    edits: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    student: any
}

export default function ActivityTimeline({ edits, student }: ActivityTimelineProps) {
    const t = useTranslations('student.profile.timeline')
    const [selectedEdit, setSelectedEdit] = useState<any>(null)
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 3

    const totalPages = Math.ceil(edits.length / itemsPerPage)
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentEdits = edits.slice(startIndex, endIndex)

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1)
        }
    }

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="w-4 h-4" />
            case 'rejected':
                return <XCircle className="w-4 h-4" />
            case 'pending':
                return <Clock className="w-4 h-4" />
            default:
                return <AlertCircle className="w-4 h-4" />
        }
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'approved': return "bg-green-100 text-green-700 border-green-200"
            case 'rejected': return "bg-red-100 text-red-700 border-red-200"
            case 'pending': return "bg-amber-100 text-amber-700 border-amber-200"
            default: return "bg-slate-100 text-slate-700 border-slate-200"
        }
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date))
    }

    if (edits.length === 0) {
        return (
            <Card className="dashboard-card h-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                            <History className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-black text-slate-900">{t('title')}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('noActivity')}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="dashboard-card flex flex-col h-auto">
            <CardHeader className="border-b border-slate-100/60 pb-6 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                            <History className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-black text-slate-900">{t('title')}</CardTitle>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={goToPreviousPage} 
                                disabled={currentPage === 0}
                                className="h-8 w-8 rounded-md"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-[10px] font-black w-8 text-center text-slate-500">
                                {currentPage + 1}/{totalPages}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={goToNextPage} 
                                disabled={currentPage === totalPages - 1}
                                className="h-8 w-8 rounded-md"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-8 flex-1 flex flex-col">
                <div className="space-y-0 flex-1 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-0 pb-4"
                        >
                            {currentEdits.map((edit) => (
                                <div key={edit.id} className="timeline-item group">
                                    <div className="timeline-dot group-hover:scale-125 transition-transform border-[#6366f1]" />
                                    <div className="bg-white/50 border border-slate-100/80 p-5 rounded-2xl group-hover:bg-white group-hover:shadow-lg group-hover:shadow-indigo-500/5 transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "h-8 px-3 rounded-lg border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider",
                                                    getStatusClass(edit.status)
                                                )}>
                                                    {getStatusIcon(edit.status)}
                                                    {t(`status.${edit.status}`)}
                                                </span>
                                                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(edit.createdAt)}
                                                </span>
                                            </div>
                                            
                                            {!edit.isRegistration && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-8 rounded-lg font-black text-[10px] uppercase tracking-wider gap-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            {t('viewChanges')}
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                                                        <div className="p-8 bg-slate-900 text-white">
                                                            <h2 className="text-2xl font-black mb-1">{t('changesRequested')}</h2>
                                                            <p className="text-slate-400 text-sm font-medium">Submitted on {formatDate(edit.createdAt)}</p>
                                                        </div>
                                                        <div className="p-6 md:p-8 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
                                                            {getChangedFields(edit, student).map((field: any) => (
                                                                <div key={field.key} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{field.label}</p>
                                                                    <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                                                                        <div className="text-right">
                                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current</p>
                                                                            <p className="text-sm font-medium text-slate-500 line-through opacity-70">{field.oldValue ?? 'N/A'}</p>
                                                                        </div>
                                                                        <div className="flex justify-center text-blue-500">
                                                                            <ArrowRight className="w-4 h-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">New Value</p>
                                                                            <p className="text-sm font-bold text-slate-900 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 inline-block">{field.newValue}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            
                                                            {edit.status === 'rejected' && edit.reviewNote && (
                                                                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl">
                                                                    <div className="flex items-center gap-2 text-red-700 font-black text-xs uppercase tracking-wider mb-2">
                                                                        <ShieldAlert className="w-4 h-4" />
                                                                        {t('rejectionReason')}
                                                                    </div>
                                                                    <p className="text-sm font-bold text-red-900 leading-relaxed">{edit.reviewNote}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>

                                        <p className="text-sm font-black text-slate-900">
                                            {edit.isRegistration ? t('registrationRequest') : t('editRequest')}
                                        </p>

                                        {edit.status === 'rejected' && edit.reviewNote && (
                                            <div className="mt-3 p-4 bg-red-50/50 rounded-xl border border-red-100 flex items-start gap-3">
                                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold text-red-900 leading-relaxed">
                                                        <span className="uppercase text-[10px] tracking-widest opacity-60 mr-1">{t('reason')}:</span>
                                                        {edit.reviewNote}
                                                    </p>
                                                    {edit.admin && (
                                                        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mt-1 opacity-70">
                                                            — {t('rejectedBy')} {edit.admin.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {edit.status === 'approved' && (
                                            <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest opacity-80">
                                                <UserCheck className="w-3.5 h-3.5" />
                                                {t('approvedBy')} {edit.admin?.name || 'Admin'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    )
}

function getChangedFields(edit: any, student: any) {
    const fields = []
    const fieldLabels: Record<string, string> = {
        name_en: 'Name (English)',
        name_bn: 'Name (Bengali)',
        mobile: 'Mobile',
        email: 'Email',
        address_en: 'Address (English)',
        address_bn: 'Address (Bengali)',
        upazila: 'Upazila',
        department: 'Department',
        student_session: 'Session',
        hall: 'Hall',
        blood_group: 'Blood Group',
        du_reg_number: 'DU Reg. Number',
        institution_name: 'Institution Name',
        designation: 'Designation',
    }

    const changes = typeof edit.changes === 'string' ? JSON.parse(edit.changes) : edit.changes

    if (changes && typeof changes === 'object') {
        for (const [key, label] of Object.entries(fieldLabels)) {
            if (changes[key] !== null && changes[key] !== undefined) {
                const oldValue = student ? student[key] : null
                fields.push({ key, label, newValue: changes[key], oldValue: oldValue ?? 'N/A' })
            }
        }
    }
    return fields
}
