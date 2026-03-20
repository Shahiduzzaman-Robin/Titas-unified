"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface EmailTemplate {
    id: number
    key: string
    name: string
    subject: string
    updatedAt: string
}

export default function EmailTemplatesPage({ params: { locale } }: { params: { locale: string } }) {
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/email-templates')
            if (res.ok) {
                const data = await res.json()
                setTemplates(data)
            }
        } catch (error) {
            console.error("Failed to fetch templates", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Email Templates</h1>
                <p className="text-sm text-slate-500">Manage your automated system notifications.</p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-all duration-300 border-slate-200 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-slate-50/50 rounded-t-xl px-4 sm:px-6">
                            <CardTitle className="text-base sm:text-lg font-bold text-slate-700 truncate mr-2">
                                {template.name}
                            </CardTitle>
                            <Link href={`/${locale}/admin/settings/email-templates/${template.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Subject Line</div>
                                    <div className="text-sm font-medium text-slate-900 truncate bg-slate-50 p-2 rounded-md border border-slate-100">{template.subject}</div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <div className="text-[10px] text-slate-400">
                                        Last Refreshed: {new Date(template.updatedAt).toLocaleDateString()}
                                    </div>
                                    <Link href={`/${locale}/admin/settings/email-templates/${template.id}`}>
                                        <Button variant="default" className="h-8 px-4 text-xs font-semibold shadow-sm">Configure</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
