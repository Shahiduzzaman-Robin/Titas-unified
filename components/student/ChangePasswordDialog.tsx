"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

export default function ChangePasswordDialog() {
    const t = useTranslations('student.changePassword')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError(t('allFieldsRequired'))
            return
        }

        if (newPassword.length < 6) {
            setError(t('passwordTooShort'))
            return
        }

        if (newPassword !== confirmPassword) {
            setError(t('passwordMismatch'))
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/student/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || t('error'))
                return
            }

            // Success
            toast.success(t('success'))
            setOpen(false)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error) {
            console.error('Change password error:', error)
            setError(t('error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <KeyRound className="w-4 h-4 mr-2" />
                    {t('title')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('title')}</DialogTitle>
                        <DialogDescription>
                            {t('description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="current-password">
                                {t('currentPassword')}
                            </Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">
                                {t('newPassword')}
                            </Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500">
                                {t('passwordHint')}
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">
                                {t('confirmPassword')}
                            </Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? t('updating') : t('submit')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
