"use client"

import { useTranslations } from "next-intl"
import { SMSStatusCards } from "@/components/admin/SMSStatusCards"
import { SMSLogsTable } from "@/components/admin/SMSLogsTable"
import { Button } from "@/components/ui/button"
import { Send, Users, Filter, Hash, RefreshCcw, Info, MessageCircle, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SMSPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('admin.sms')
    
    // States
    const [recipientType, setRecipientType] = useState<'all' | 'filter' | 'custom'>('all')
    const [customNumbers, setCustomNumbers] = useState("")
    const [message, setMessage] = useState("")
    const [recipientCount, setRecipientCount] = useState(0)
    const [loadingFilters, setLoadingFilters] = useState(false)
    const [sending, setSending] = useState(false)
    const [lastSmsSent, setLastSmsSent] = useState(Date.now())

    // Filter states
    const [sessions, setSessions] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [selectedSessions, setSelectedSessions] = useState<string[]>([])
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])

    const fetchFilters = async () => {
        setLoadingFilters(true)
        try {
            const res = await fetch('/api/admin/sms/filters')
            if (res.ok) {
                const data = await res.json()
                setSessions(data.sessions || [])
                setDepartments(data.departments || [])
            }
        } catch (error) {
            console.error("Failed to fetch filters")
        } finally {
            setLoadingFilters(false)
        }
    }

    const fetchRecipientCount = async (sessions: string[], depts: string[], type: string) => {
        if (type === 'custom') {
            const count = customNumbers.split(',').filter(n => n.trim().length >= 10).length
            setRecipientCount(count)
            return
        }
        
        try {
            const params = new URLSearchParams()
            if (type === 'filter') {
                if (sessions.length > 0) sessions.forEach(s => params.append('sessions', s))
                if (depts.length > 0) depts.forEach(d => params.append('departments', d))
            }
            const res = await fetch(`/api/students/count?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setRecipientCount(data.count || 0)
            }
        } catch (error) {
            setRecipientCount(0)
        }
    }

    useEffect(() => {
        fetchFilters()
        fetchRecipientCount([], [], 'all')
    }, [])

    useEffect(() => {
        fetchRecipientCount(selectedSessions, selectedDepartments, recipientType)
    }, [recipientType, customNumbers, selectedSessions, selectedDepartments])

    const handleSendBulk = async () => {
        if (!message) {
            toast.error("বার্তা প্রদান করা আবশ্যক")
            return
        }

        const payload: any = { message }
        if (recipientType === 'filter') {
            payload.sessions = selectedSessions
            payload.departments = selectedDepartments
        } else if (recipientType === 'custom') {
            payload.to = customNumbers
        }

        setSending(true)
        try {
            const endpoint = recipientType === 'custom' ? '/api/sms/send' : '/api/sms/bulk'
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (res.ok && data.success) {
                toast.success(data.message || "এসএমএস পাঠানো শুরু হয়েছে")
                setMessage("")
                setLastSmsSent(Date.now())
            } else {
                toast.error(data.message || "এসএমএস পাঠাতে ব্যর্থ হয়েছে")
            }
        } catch (error) {
            toast.error("সংযোগ ত্রুটি")
        } finally {
            setSending(false)
        }
    }

    // Calculation Logic
    const getMessageStats = (msg: string) => {
        const isBangla = /[\u0980-\u09FF]/.test(msg)
        const length = msg.length
        let parts = 0
        if (length > 0) {
            if (isBangla) {
                parts = length <= 70 ? 1 : Math.ceil(length / 67)
            } else {
                parts = length <= 160 ? 1 : Math.ceil(length / 153)
            }
        } else {
            parts = 0
        }
        return { length, parts, isBangla }
    }

    const stats = getMessageStats(message)
    const totalSms = stats.parts * recipientCount
    const totalCost = (totalSms * 0.35).toFixed(2)

    const handleRefresh = () => {
        setLastSmsSent(Date.now())
        fetchFilters()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 bn-text">এসএমএস ম্যানেজমেন্ট</h1>
                    <p className="text-slate-500 bn-text">শিক্ষার্থীদের সাথে দ্রুত যোগাযোগ করুন</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="bn-text gap-2">
                    <RefreshCcw size={14} /> রিফ্রেশ করুন
                </Button>
            </div>

            {/* Split Balance Cards */}
            <SMSStatusCards lastUpdated={lastSmsSent} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border-none shadow-sm pb-4">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 bn-text">
                                <Send className="text-blue-500" size={18} /> নতুন বার্তা পাঠান
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="bn-text text-slate-600">প্রাপক নির্বাচন করুন</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Button 
                                        variant={recipientType === 'all' ? 'default' : 'outline'} 
                                        className={`bn-text gap-2 ${recipientType === 'all' ? 'bg-blue-600' : ''}`}
                                        onClick={() => setRecipientType('all')}
                                    >
                                        <Users size={16} /> সকল শিক্ষার্থী
                                    </Button>
                                    <Button 
                                        variant={recipientType === 'filter' ? 'default' : 'outline'} 
                                        className={`bn-text gap-2 ${recipientType === 'filter' ? 'bg-blue-600' : ''}`}
                                        onClick={() => setRecipientType('filter')}
                                    >
                                        <Filter size={16} /> ফিল্টার করুন
                                    </Button>
                                    <Button 
                                        variant={recipientType === 'custom' ? 'default' : 'outline'} 
                                        className={`bn-text gap-2 ${recipientType === 'custom' ? 'bg-blue-600' : ''}`}
                                        onClick={() => setRecipientType('custom')}
                                    >
                                        <Hash size={16} /> কাস্টম নম্বর
                                    </Button>
                                </div>

                                {recipientType === 'filter' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-xl bg-slate-50">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase">বিভাগসমূহ</Label>
                                            <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-white border rounded-lg">
                                                {departments.map((d: any) => (
                                                    <label key={d} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors">
                                                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                                                            checked={selectedDepartments.includes(d)} 
                                                            onChange={() => {
                                                                const next = selectedDepartments.includes(d) ? selectedDepartments.filter(x => x !== d) : [...selectedDepartments, d]
                                                                setSelectedDepartments(next)
                                                            }} 
                                                        />
                                                        <span className="text-slate-700">{d}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase">সেশনসমূহ</Label>
                                            <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-white border rounded-lg">
                                                {sessions.map((s: any) => (
                                                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors">
                                                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            checked={selectedSessions.includes(s)} 
                                                            onChange={() => {
                                                                const next = selectedSessions.includes(s) ? selectedSessions.filter(x => x !== s) : [...selectedSessions, s]
                                                                setSelectedSessions(next)
                                                            }} 
                                                        />
                                                        <span className="text-slate-700">{s}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {recipientType === 'custom' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label className="bn-text text-xs text-slate-500">মোবাইল নম্বর (কমা দিয়ে আলাদা করুন)</Label>
                                        <Textarea 
                                            value={customNumbers} 
                                            onChange={(e) => setCustomNumbers(e.target.value)} 
                                            placeholder="017xxxxxxxx, 018xxxxxxxx" 
                                            className="min-h-[100px] rounded-xl border-slate-200"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="bn-text text-slate-600">বার্তার বিষয়বস্তু</Label>
                                <Textarea 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)} 
                                    placeholder="আপনার বার্তা এখানে লিখুন..." 
                                    rows={6}
                                    className="rounded-xl border-slate-200 resize-none focus:ring-blue-500"
                                />
                                <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                                    <div className="flex gap-4">
                                        <span>অক্ষর সংখ্যা: {message.length}</span>
                                        <span className="text-blue-600 font-semibold">{stats.isBangla ? 'Unicode (বাংলা)' : 'GSM (English)'}</span>
                                    </div>
                                    <div className="bn-text">
                                        মোট এসএমএস: {stats.parts} ({stats.isBangla ? '৭০' : '১৬০'} অক্ষর ১টি)
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <div className="px-6 pt-0">
                            <Button 
                                onClick={handleSendBulk} 
                                disabled={sending || !message || recipientCount === 0} 
                                className="w-full bg-slate-600 hover:bg-slate-700 h-12 rounded-xl bn-text text-base gap-2 shadow-lg shadow-slate-200"
                            >
                                <Send size={18} /> {sending ? "পাঠানো হচ্ছে..." : `বার্তা পাঠান (Send Message)`}
                            </Button>
                            {recipientCount > 0 && message && (
                                <p className="text-center mt-3 text-xs text-slate-400 bn-text underline decoration-dotted underline-offset-4">
                                     মোট {recipientCount} জন প্রাপককে {stats.parts * recipientCount} টি সেশনের মাধ্যমে এসএমএস পাঠানো হবে (আনুমানিক খরচ: ৳{totalCost})
                                </p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Preview & Notes */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden h-fit">
                        <CardHeader className="pb-4 border-b bg-slate-50/50">
                            <CardTitle className="text-lg flex items-center gap-2 bn-text">
                                <Info className="text-slate-400" size={18} /> প্রিভিউ (Preview)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 bg-slate-50/30 flex justify-center items-center">
                            {/* Mobile Mockup */}
                            <div className="relative w-full max-w-[280px] bg-slate-800 rounded-[3rem] p-4 border-[6px] border-slate-700 shadow-2xl">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-700 rounded-b-2xl z-10" />
                                <div className="bg-white rounded-[2rem] h-[400px] overflow-hidden flex flex-col pt-8">
                                    <div className="px-4 flex items-center gap-2 border-b pb-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Users size={14} className="text-slate-400" /></div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">TITAS Message</div>
                                    </div>
                                    <div className="flex-1 px-3 space-y-4">
                                        <div className={`max-w-[85%] p-3 rounded-2xl rounded-tl-none bg-slate-100 text-[13px] leading-relaxed text-slate-700 animate-in fade-in scale-in-95 duration-300 break-words whitespace-pre-wrap ${!message ? 'italic text-slate-300' : ''}`}>
                                            {message || 'বার্তার প্রিভিউ এখানে দেখা যাবে...'}
                                            <div className="text-[9px] text-slate-400 mt-2">২ মিনিট আগে</div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t bg-slate-50/80 flex gap-2">
                                        <div className="h-6 flex-1 bg-white rounded-full border border-slate-200" />
                                        <div className="w-6 h-6 rounded-full bg-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-amber-50/50">
                        <CardContent className="p-6">
                            <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2 bn-text">
                                <AlertCircle size={16} /> স্মরণীয় বিষয়:
                            </h4>
                            <ul className="space-y-2 text-sm text-amber-800 bn-text">
                                <li className="flex gap-2">
                                    <span className="text-amber-500 mt-1">•</span> 
                                    প্রতিটি এসএমএস (১৬০ ক্যারেক্টার) এর জন্য ০.৩৫ পয়সা চার্জ হতে পারে।
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-500 mt-1">•</span> 
                                    বাংলা মেসেজের ক্ষেত্রে অক্ষর সীমা ৭০ হতে পারে (ইউনিকোড)।
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-500 mt-1">•</span> 
                                    বেশি বড় মেসেজ না পাঠানোই শ্রেয়।
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Logs Table */}
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl bn-text flex items-center gap-2">
                        <MessageCircle className="text-blue-500" size={20} /> সাম্প্রতিক কার্যকলাপ
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <SMSLogsTable />
                </CardContent>
            </Card>
        </div>
    )
}
