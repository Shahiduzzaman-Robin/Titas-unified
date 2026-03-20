
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home, LogIn, Mail, Smartphone } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { PublicNav } from "@/components/PublicNav"

export default function RegisterSuccessPage() {
    const t = useTranslations('public.register_success')

    return (
        <main className="min-h-screen bg-slate-50 bn-text">
            <PublicNav />
            <div className="flex items-center justify-center py-20 px-4">
                <Card className="max-w-xl w-full shadow-xl text-center">
                    <CardHeader className="flex flex-col items-center pb-2">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-gray-900">{t('title')}</CardTitle>
                        <p className="text-gray-500 mt-2 text-lg">{t('subtitle')}</p>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-4 text-gray-600">
                            <p className="text-lg font-medium text-gray-900">{t('description')}</p>

                            {/* Password/Email Info */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left text-sm space-y-2">
                                <div className="flex items-start gap-2">
                                    <Mail className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-amber-800 font-medium">{t('emailNote')}</p>
                                </div>
                                <p className="text-amber-700 ml-6">{t('forgotPasswordNote')}</p>
                            </div>

                            <p>{t('reviewNote')}</p>

                            <div className="bg-blue-50 text-blue-700 p-3 rounded-md mx-auto max-w-sm flex items-center justify-center gap-2 text-sm">
                                <Smartphone className="h-4 w-4" />
                                <span>{t('smsNote')}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href="/">
                                <Button variant="outline" className="w-full sm:w-auto gap-2">
                                    <Home className="h-4 w-4" />
                                    {t('backHome')}
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button className="w-full sm:w-auto gap-2">
                                    <LogIn className="h-4 w-4" />
                                    {t('login')}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
