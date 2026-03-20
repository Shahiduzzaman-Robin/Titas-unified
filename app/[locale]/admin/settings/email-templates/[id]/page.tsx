"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Save, Copy, Info, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface EmailTemplate {
    id: number
    key: string
    name: string
    subject: string
    content: string
    variables: string[]
}

const MOCK_DATA = {
    name: "John Doe",
    studentName: "John Doe",
    nameEn: "John Doe",
    nameBn: "জন ড",
    email: "john.doe@example.com",
    mobile: "01712345678",
    titasId: "TITAS-9999",
    department: "Computer Science and Engineering",
    session: "2018-19",
    bloodGroup: "O+",
    hall: "Shahidullah Hall",
    duRegNumber: "2018524XXX",
    institution: "University of Dhaka",
    designation: "Student",
    siteName: "TITAS",
    siteUrl: "https://titasdu.com",
    loginLink: "https://titasdu.com/en/login",
    resetLink: "https://titasdu.com/en/student/reset-password?token=mock-token",
    year: "2024",
    currentYear: "2024",
    reason: "The submitted documents were not clear enough to verify your identity.",
    password: "securePassword123",
    adminName: "Super Admin"
}

export default function EditEmailTemplatePage({
    params: { locale, id }
}: {
    params: { locale: string, id: string }
}) {
    const [template, setTemplate] = useState<EmailTemplate | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [previewHtml, setPreviewHtml] = useState("")
    const [copiedVar, setCopiedVar] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchTemplate()
    }, [id])

    useEffect(() => {
        if (template) {
            renderPreview(template.content)
        }
    }, [template?.content])

    const fetchTemplate = async () => {
        try {
            const res = await fetch(`/api/admin/email-templates/${id}`)
            if (res.ok) {
                const data = await res.json()
                setTemplate(data)
            } else {
                toast.error("Failed to load template")
            }
        } catch (error) {
            console.error("Failed to fetch template", error)
        } finally {
            setLoading(false)
        }
    }

    const renderPreview = (content: string) => {
        let rendered = content
        Object.entries(MOCK_DATA).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g')
            rendered = rendered.replace(regex, value)
        })
        setPreviewHtml(rendered)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!template) return

        setSaving(true)
        try {
            const res = await fetch(`/api/admin/email-templates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: template.subject,
                    content: template.content
                })
            })

            if (res.ok) {
                toast.success("Template updated successfully")
                router.refresh()
            } else {
                throw new Error('Failed to update')
            }
        } catch (error) {
            toast.error("Failed to update template")
        } finally {
            setSaving(false)
        }
    }

    const copyToClipboard = (text: string) => {
        const varText = `{{${text}}}`
        navigator.clipboard.writeText(varText)
        setCopiedVar(text)
        toast.success(`Copied ${varText}`)
        setTimeout(() => setCopiedVar(null), 2000)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!template) {
        return <div>Template not found</div>
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto px-4 pb-24 sm:pb-32">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/${locale}/admin/settings/email-templates`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 line-clamp-1">{template.name}</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">Manage automated notification content.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href={`/${locale}/admin/settings/email-templates`} className="flex-1 sm:flex-none">
                        <Button variant="outline" type="button" className="w-full text-xs sm:text-sm h-9 sm:h-10">Cancel</Button>
                    </Link>
                    <Button
                        onClick={(e) => handleSave(e as any)}
                        disabled={saving}
                        className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px] shadow-sm text-xs sm:text-sm h-9 sm:h-10"
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" />Save</>
                        )}
                    </Button>
                </div>
            </div>

            <div className="w-full">
                <Tabs defaultValue="editor" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 max-w-sm mx-auto h-9 sm:h-10">
                        <TabsTrigger value="editor" className="text-xs sm:text-sm">Editor</TabsTrigger>
                        <TabsTrigger value="preview" className="text-xs sm:text-sm">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="editor" className="mt-0 outline-none">
                        <Card className="border-slate-200 shadow-sm transition-all duration-300">
                            <CardHeader className="bg-slate-50/50 border-b py-3 sm:py-4">
                                <CardTitle className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject" className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">Email Subject</Label>
                                        <Input
                                            id="subject"
                                            value={template.subject}
                                            onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                                            required
                                            className="font-medium border-slate-200 h-10 sm:h-11 focus-visible:ring-primary text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">HTML Code Template</Label>
                                        <Textarea
                                            id="content"
                                            value={template.content}
                                            onChange={(e) => setTemplate({ ...template, content: e.target.value })}
                                            className="min-h-[450px] sm:min-h-[600px] font-mono text-[12px] sm:text-sm leading-relaxed p-4 sm:p-6 border-slate-200 focus-visible:ring-0 transition-all bg-slate-50/20 custom-scrollbar"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-0 outline-none">
                        <Card className="overflow-hidden border-slate-200 shadow-lg">
                            <CardHeader className="bg-white border-b py-3 px-4 sm:px-6">
                                <div className="space-y-1">
                                    <div className="flex gap-2 text-[11px] sm:text-sm">
                                        <span className="font-bold text-slate-400 w-12 sm:w-16">Sub:</span>
                                        <span className="text-slate-900 font-medium truncate">{template.subject.replace(/{{[a-zA-Z]+}}/g, (match) => {
                                            const key = match.replace(/{{|}}/g, '')
                                            return (MOCK_DATA as any)[key] || match
                                        })}</span>
                                    </div>
                                    <div className="flex gap-2 text-[11px] sm:text-sm">
                                        <span className="font-bold text-slate-400 w-12 sm:w-16">From:</span>
                                        <span className="text-slate-600 italic">TITAS &lt;admin@titasdu.com&gt;</span>
                                    </div>
                                    <div className="flex gap-2 text-[11px] sm:text-sm">
                                        <span className="font-bold text-slate-400 w-12 sm:w-16">Rec:</span>
                                        <span className="text-slate-600 truncate italic">student@university.edu</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 bg-slate-100 min-h-[500px] sm:min-h-[700px] flex justify-center custom-scrollbar overflow-x-hidden">
                                <div className="w-full max-w-[650px] my-4 sm:my-8 bg-white shadow-xl overflow-hidden flex flex-col mx-2 sm:mx-4 border rounded-sm">
                                    <iframe
                                        srcDoc={previewHtml}
                                        title="Email Preview"
                                        className="w-full flex-1 min-h-[500px] sm:min-h-[700px] border-none scale-90 sm:scale-100 origin-top"
                                        sandbox="allow-same-origin"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center bg-primary ring-4 ring-white"
                            size="icon"
                        >
                            <Info className="w-5 h-5 sm:w-6 sm:h-6" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl rounded-xl sm:rounded-2xl">
                        <DialogHeader className="p-3 sm:p-4 bg-slate-900 text-white shrink-0">
                            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                Available Tags
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-white custom-scrollbar">
                            <div>
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    Student
                                    <div className="flex-1 h-[1px] bg-slate-50"></div>
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                                    {['name', 'titasId', 'email', 'mobile', 'department', 'session', 'bloodGroup', 'hall', 'duRegNumber', 'institution', 'designation'].map((variable) => (
                                        <button
                                            key={variable}
                                            onClick={() => copyToClipboard(variable)}
                                            className="p-1 sm:p-1.5 px-2 sm:px-3 bg-slate-50 border border-slate-200 rounded text-[9px] sm:text-[10px] font-mono flex items-center justify-between hover:bg-primary/5 transition-all active:scale-[0.98]"
                                        >
                                            <span className="font-bold text-slate-700 truncate mr-1">{`{{${variable}}}`}</span>
                                            {copiedVar === variable ? (
                                                <Check className="w-3 h-3 text-green-600 shrink-0" />
                                            ) : (
                                                <Copy className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        System
                                        <div className="flex-1 h-[1px] bg-slate-50"></div>
                                    </h4>
                                    <div className="grid grid-cols-1 gap-1">
                                        {['siteName', 'siteUrl', 'loginLink', 'resetLink', 'year'].map((variable) => (
                                            <button
                                                key={variable}
                                                onClick={() => copyToClipboard(variable)}
                                                className="w-full p-1 sm:p-1.5 px-3 bg-slate-50 border border-slate-200 rounded text-[9px] sm:text-[10px] font-mono flex items-center justify-between hover:bg-indigo-50/50 transition-all active:scale-[0.98]"
                                            >
                                                <span className="font-bold text-slate-700">{`{{${variable}}}`}</span>
                                                {copiedVar === variable ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {(template.key.includes('rejected') || template.key.includes('approved') || template.key.includes('registration')) && (
                                        <div>
                                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                Context
                                                <div className="flex-1 h-[1px] bg-slate-50"></div>
                                            </h4>
                                            <div className="space-y-1">
                                                {template.key.includes('rejected') && (
                                                    <button
                                                        onClick={() => copyToClipboard('reason')}
                                                        className="w-full p-1 sm:p-1.5 px-3 bg-amber-50/50 border border-amber-200 rounded text-[9px] sm:text-[10px] font-mono flex items-center justify-between hover:bg-amber-100/50 transition-all active:scale-[0.98]"
                                                    >
                                                        <span className="font-bold text-amber-900">{`{{reason}}`}</span>
                                                        {copiedVar === 'reason' ? <Check className="w-3 h-3 text-amber-600" /> : <Copy className="w-2.5 h-2.5 text-amber-500" />}
                                                    </button>
                                                )}
                                                {template.key.includes('registration') && (
                                                    <button
                                                        onClick={() => copyToClipboard('password')}
                                                        className="w-full p-1 sm:p-1.5 px-3 bg-amber-50/50 border border-amber-200 rounded text-[9px] sm:text-[10px] font-mono flex items-center justify-between hover:bg-amber-100/50 transition-all active:scale-[0.98]"
                                                    >
                                                        <span className="font-bold text-amber-900">{`{{password}}`}</span>
                                                        {copiedVar === 'password' ? <Check className="w-3 h-3 text-amber-600" /> : <Copy className="w-2.5 h-2.5 text-amber-500" />}
                                                    </button>
                                                )}
                                                {(template.key.includes('rejected') || template.key.includes('approved')) && (
                                                    <button
                                                        onClick={() => copyToClipboard('adminName')}
                                                        className="w-full p-1 sm:p-1.5 px-3 bg-amber-50/50 border border-amber-200 rounded text-[9px] sm:text-[10px] font-mono flex items-center justify-between hover:bg-amber-100/50 transition-all active:scale-[0.98]"
                                                    >
                                                        <span className="font-bold text-amber-900">{`{{adminName}}`}</span>
                                                        {copiedVar === 'adminName' ? <Check className="w-3 h-3 text-amber-600" /> : <Copy className="w-2.5 h-2.5 text-amber-500" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-2 bg-blue-50/30 border border-blue-100 rounded">
                                        <p className="text-[9px] text-blue-700 leading-tight font-medium">
                                            💡 Tap to copy.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-2 sm:p-3 bg-slate-50 border-t flex justify-end shrink-0">
                            <DialogTrigger asChild>
                                <Button variant="outline" className="rounded-md h-8 px-4 font-semibold text-xs transition-all">Dismiss</Button>
                            </DialogTrigger>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                @media (max-width: 640px) {
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 0px;
                    }
                }
            `}</style>
        </div>
    )
}
