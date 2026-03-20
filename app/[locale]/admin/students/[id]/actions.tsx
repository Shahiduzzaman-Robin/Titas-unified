
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Printer, Check, X, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export default function StudentActions({ student }: { student: any }) {
    const router = useRouter()
    const t = useTranslations('admin.students')
    const common = useTranslations('common')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [sendRejectionSMS, setSendRejectionSMS] = useState(true)

    const handlePrinting = () => {
        window.print()
    }

    const handleStatusUpdate = async (status: number) => {
        // For Rejection (status 2), open dialog first
        if (status === 2 && !rejectDialogOpen) {
            setRejectDialogOpen(true)
            return
        }

        try {
            const body: any = { approval: status }
            if (status === 2) {
                body.deny_reason = rejectReason
                body.send_sms = sendRejectionSMS
            }

            const res = await fetch(`/api/students?id=${student.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                toast.success(status === 1 ? t('approveSuccess') : t('rejectSuccess'))
                setRejectDialogOpen(false)
                router.refresh()
            } else {
                toast.error(status === 1 ? t('approveFailed') : t('rejectFailed'))
            }
        } catch (error) {
            toast.error(t('error'))
        }
    }

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        setDeleteDialogOpen(false)

        try {
            const res = await fetch(`/api/students?id=${student.id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast.success(t('deleteSuccess'))
                router.push('/admin/students')
            } else {
                toast.error(t('deleteFailed'))
            }
        } catch (error) {
            toast.error(t('error'))
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-2 no-print w-full sm:w-auto">
            {student.approval === 0 && (
                <>
                    <Button
                        className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none h-11 sm:h-auto"
                        onClick={() => handleStatusUpdate(1)}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        {t('approve')}
                    </Button>
                    <Button
                        variant="destructive"
                        className="flex-1 sm:flex-none h-11 sm:h-auto"
                        onClick={() => handleStatusUpdate(2)}
                    >
                        <X className="w-4 h-4 mr-2" />
                        {t('reject')}
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                className="flex-1 sm:flex-none h-11 sm:h-auto bg-white"
                onClick={() => router.push(`/admin/students/${student.id}/edit`)}
            >
                <Pencil className="w-4 h-4 mr-2" />
                {common('edit')}
            </Button>

            <Button
                variant="destructive"
                className="h-11 sm:h-auto w-11 sm:w-auto p-0 flex items-center justify-center shrink-0"
                onClick={handleDeleteClick}
                title={common('delete')}
            >
                <Trash2 className="w-4 h-4" />
            </Button>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteConfirm')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{common('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {common('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('rejectStudent')}</DialogTitle>
                        <DialogDescription>
                            {t('rejectStudentDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">{t('rejectReason') || "Reason"}</label>
                            <Input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={t('rejectReasonPlaceholder')}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="sendSms"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={sendRejectionSMS}
                                onChange={(e) => setSendRejectionSMS(e.target.checked)}
                            />
                            <label
                                htmlFor="sendSms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {t('sendRejectionSMS')}
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            {common('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleStatusUpdate(2)}
                            disabled={!rejectReason}
                        >
                            {t('confirmReject')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
