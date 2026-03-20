"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Check, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getStudentImageUrl } from "@/lib/utils"
import { useTranslations } from 'next-intl'
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReviewEditClient({ edit, student, locale }: { edit: any, student: any, locale: string }) {
    const t = useTranslations('admin.review')
    const router = useRouter()
    const [processing, setProcessing] = useState(false)
    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changes = edit.changes as Record<string, any>

    const handleApprove = async () => {
        setProcessing(true)
        try {
            const res = await fetch("/api/admin/edits/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ editId: edit.id })
            })

            if (res.ok) {
                toast.success(t('approveSuccess'))
                router.push(`/${locale}/admin/edits`)
                router.refresh()
            } else {
                toast.error(t('approveError'))
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error("Error: " + error.message)
        } finally {
            setProcessing(false)
            setApproveDialogOpen(false)
        }
    }

    const handleReject = async () => {
        setProcessing(true)
        try {
            const res = await fetch("/api/admin/edits/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ editId: edit.id, reason: rejectReason })
            })

            if (res.ok) {
                toast.success(t('rejectSuccess'))
                router.push(`/${locale}/admin/edits`)
                router.refresh()
            } else {
                toast.error("Failed to reject changes")
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error("Error: " + error.message)
        } finally {
            setProcessing(false)
            setRejectDialogOpen(false)
        }
    }

    // Helper to format value for display
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderValue = (key: string, value: any) => {
        if (key === 'image_path') {
            return (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border">
                    <Image src={getStudentImageUrl(value)} alt="Preview" fill className="object-cover" />
                </div>
            )
        }
        return <span className="font-medium">{value}</span>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/${locale}/admin/edits`}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('studentInfo')}</CardTitle>
                        <CardDescription>{t('targetProfile')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                                <Image src={getStudentImageUrl(student.image_path)} alt="Profile" fill className="object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold">{student.name_en}</h3>
                                <p className="text-sm text-gray-500">TITAS-{student.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('actions')}</CardTitle>
                        <CardDescription>{t('startDate')}: {new Date(edit.createdAt).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button
                            className="bg-green-600 hover:bg-green-700 w-full"
                            onClick={() => setApproveDialogOpen(true)}
                            disabled={processing}
                        >
                            <Check className="w-4 h-4 mr-2" /> {t('approve')}
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => setRejectDialogOpen(true)}
                            disabled={processing}
                        >
                            <X className="w-4 h-4 mr-2" /> {t('reject')}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('changeDiff')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(changes).map(([key, newValue]) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const oldValue = (student as any)[key]

                            // Skip if value is same (though normally wouldn't be sent)
                            if (oldValue === newValue) return null

                            return (
                                <div key={key} className="p-4 border rounded-lg bg-gray-50 grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">{key}</p>
                                        <div className="text-gray-600 mt-1 line-through opacity-70">
                                            {renderValue(key, oldValue)}
                                        </div>
                                    </div>

                                    <div className="flex justify-center text-blue-500">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <p className="text-xs text-blue-600 uppercase font-semibold text-right md:text-left">{t('newValue')}</p>
                                        <div className="text-gray-900 font-bold mt-1 bg-green-50 p-2 rounded inline-block border-green-200 border">
                                            {renderValue(key, newValue)}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Approve Confirmation Dialog */}
            <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmApproveTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('confirmApproveDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                            {t('confirmApproveAction')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Reason Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('confirmRejectTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('confirmRejectDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="reason">{t('rejectReasonLabel')}</Label>
                        <Textarea
                            id="reason"
                            placeholder={t('rejectReasonPlaceholder')}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>{t('cancel')}</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processing}>
                            {processing ? t('rejecting') : t('confirmRejectAction')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
