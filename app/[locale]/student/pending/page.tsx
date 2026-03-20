
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Clock, CheckCircle } from "lucide-react"
import { SignOutButton } from "@/components/SignOutButton"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { getTranslations } from 'next-intl/server'

import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default async function PendingPage({ params: { locale } }: { params: { locale: string } }) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect(`/${locale}/login`)
    }

    if (session.user.role === 'student' && session.user.approval === 1) {
        redirect(`/${locale}/student/profile`)
    }

    const t = await getTranslations('student.pending')

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>
            <Card className="max-w-md w-full shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-yellow-100 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        {t('title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-gray-600">
                        {t('description')}
                        <br />
                        {t('verificationNote')}
                    </p>

                    <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 text-left">
                        <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <strong>{t('nextStepTitle')}</strong>
                            <p className="mt-1">{t('nextStepDesc')}</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <SignOutButton className="w-full" variant="outline">
                            {t('signOut')}
                        </SignOutButton>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
