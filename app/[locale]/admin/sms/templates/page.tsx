"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface Template {
    id: number
    type: string
    template: string
}

export default function SMSTemplatesPage({ params: { locale } }: { params: { locale: string } }) {
    const [approvalTemplate, setApprovalTemplate] = useState("")
    const [rejectionTemplate, setRejectionTemplate] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/sms/templates')
            if (res.ok) {
                const data: Template[] = await res.json()
                const app = data.find(t => t.type === 'approval')
                const rej = data.find(t => t.type === 'rejection')

                if (app) setApprovalTemplate(app.template)
                if (rej) setRejectionTemplate(rej.template)

                // Set defaults if empty
                if (!app && !approvalTemplate) {
                    setApprovalTemplate("Dear {name}, your registration (ID: {id}) for TITAS has been approved. Welcome!")
                }
                if (!rej && !rejectionTemplate) {
                    setRejectionTemplate("Dear {name}, your registration for TITAS was not approved. Reason: {reason}.")
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (type: 'approval' | 'rejection', template: string) => {
        setSaving(true)
        try {
            const res = await fetch('/api/sms/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, template })
            })

            if (res.ok) {
                toast.success(`${type === 'approval' ? 'Approval' : 'Rejection'} template saved`)
            } else {
                toast.error("Failed to save template")
            }
        } catch (error) {
            toast.error("Error saving template")
        } finally {
            setSaving(false)
        }
    }

    const variables = [
        { code: "{name}", desc: "Student Name (English)" },
        { code: "{name_bn}", desc: "Student Name (Bangla)" },
        { code: "{id}", desc: "Titas ID" },
        { code: "{reg}", desc: "DU Registration Number" },
        { code: "{mobile}", desc: "Mobile Number" },
        { code: "{email}", desc: "Email Address" },
        { code: "{session}", desc: "Academic Session" },
        { code: "{department}", desc: "Department Name" },
        { code: "{hall}", desc: "Hall Name" },
        { code: "{upazila}", desc: "Upazila" },
        { code: "{blood_group}", desc: "Blood Group" },
        { code: "{address}", desc: "Address (English)" },
        { code: "{address_bn}", desc: "Address (Bangla)" },
        { code: "{gender}", desc: "Gender" },
        { code: "{job_position}", desc: "Job/Institution Name" },
        { code: "{job_designation}", desc: "Job Designation" },
        { code: "{reason}", desc: "Rejection Reason (Rejection only)" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/${locale}/admin/sms`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">SMS Templates</h1>
                    <p className="text-gray-500">Customize the automatic messages sent to students</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Approval Template */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval Message</CardTitle>
                            <CardDescription>
                                Sent when a student's registration is approved by admin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Template Content</Label>
                                <Textarea
                                    value={approvalTemplate}
                                    onChange={(e) => setApprovalTemplate(e.target.value)}
                                    rows={5}
                                    placeholder="Enter approval SMS content..."
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => handleSave('approval', approvalTemplate)} disabled={saving || loading}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rejection Template */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejection Message</CardTitle>
                            <CardDescription>
                                Sent when a student's registration is rejected.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Template Content</Label>
                                <Textarea
                                    value={rejectionTemplate}
                                    onChange={(e) => setRejectionTemplate(e.target.value)}
                                    rows={5}
                                    placeholder="Enter rejection SMS content..."
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => handleSave('rejection', rejectionTemplate)} disabled={saving || loading}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Available Variables</CardTitle>
                            <CardDescription>
                                Use these placeholders in your templates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr className="border-b">
                                            <th className="px-4 py-2 text-left font-medium">Code</th>
                                            <th className="px-4 py-2 text-left font-medium">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {variables.map((v) => (
                                            <tr key={v.code} className="hover:bg-muted/20">
                                                <td className="px-4 py-2 font-mono text-xs text-blue-600">{v.code}</td>
                                                <td className="px-4 py-2 text-muted-foreground text-xs">{v.desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
