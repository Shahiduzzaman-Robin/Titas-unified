"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Search, Eye, Check, X, Download, Trash2, Loader2, Filter, Settings, Columns, CheckCircle2, Globe, AlertCircle, ArrowRight, Users, LayoutGrid, FileSpreadsheet } from "lucide-react"
import { useTranslations } from 'next-intl'
import Link from "next/link"
import { useLocale } from 'next-intl'
import { cn, getStudentImageUrl } from "@/lib/utils"
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function StudentsPage() {
    const t = useTranslations('admin.students')
    const common = useTranslations('common')
    const locale = useLocale()
    const searchParams = useSearchParams()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "")
    const [isExporting, setIsExporting] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    // Pagination State
    const [page, setPage] = useState(parseInt(searchParams.get('page') || "1"))
    const [hasMore, setHasMore] = useState(true)
    const observer = useRef<IntersectionObserver | null>(null)
    const router = useRouter()
    const pathname = usePathname()

    // Rejection Dialog State
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
    const [rejectReason, setRejectReason] = useState("")

    const clearFilters = () => {
        setSearchTerm("")
        setSessionFilter("all")
        setDeptFilter("all")
        setHallFilter("all")
        setUpazilaFilter("all")
        setStatusFilter("all")
        setPage(1)
        router.push(pathname)
        setShowFilters(false)
    }
    const [sendRejectionSMS, setSendRejectionSMS] = useState(true)

    // Export Selection State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [selectedExportFields, setSelectedExportFields] = useState<string[]>([
        'titasId', 'name', 'session', 'department', 'mobile', 'status'
    ])
    const [selectedExportSessions, setSelectedExportSessions] = useState<string[]>([])
    const [selectedExportDepts, setSelectedExportDepts] = useState<string[]>([])
    const [selectedExportUpazilas, setSelectedExportUpazilas] = useState<string[]>([])
    const [selectedExportStatus, setSelectedExportStatus] = useState<string[]>([])
    const [exportLanguage, setExportLanguage] = useState<'en' | 'bn' | 'both'>('en')
    const [activeExportTab, setActiveExportTab] = useState('format')
    const [exportDeptSearch, setExportDeptSearch] = useState("")
    const [exportUpazilaSearch, setExportUpazilaSearch] = useState("")
    const [exportColumnSearch, setExportColumnSearch] = useState("")
    
    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [bulkLoading, setBulkLoading] = useState(false)
    const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false)

    const exportFields = [
        { id: 'titasId', label: 'Titas ID' },
        { id: 'name', label: 'Name' },
        { id: 'session', label: 'Session' },
        { id: 'department', label: 'Department' },
        { id: 'hall', label: 'Hall' },
        { id: 'upazila', label: 'Upazila' },
        { id: 'mobile', label: 'Mobile' },
        { id: 'email', label: 'Email' },
        { id: 'blood_group', label: 'Blood Group' },
        { id: 'gender', label: 'Gender' },
        { id: 'du_reg_number', label: 'DU Reg Number' },
        { id: 'address', label: 'Address' },
        { id: 'status', label: 'Status' },
        { id: 'photo', label: 'Photo' },
    ]

    // Filter States
    const [sessionFilter, setSessionFilter] = useState(searchParams.get('session') || "all")
    const [deptFilter, setDeptFilter] = useState(searchParams.get('department') || "all")
    const [hallFilter, setHallFilter] = useState(searchParams.get('hall') || "all")
    const [upazilaFilter, setUpazilaFilter] = useState(searchParams.get('upazila') || "all")

    // Normalize status filter (map 'pending' -> '0', etc.)
    const getInitialStatus = () => {
        const s = searchParams.get('status')
        if (s === 'pending') return '0'
        if (s === 'approved') return '1'
        if (s === 'rejected') return '2'
        return s || 'all'
    }
    const [statusFilter, setStatusFilter] = useState(getInitialStatus())


    // Options Data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [options, setOptions] = useState<{
        sessions: any[],
        departments: any[],
        halls: any[],
        upazilas: any[]
    }>({
        sessions: [],
        departments: [],
        halls: [],
        upazilas: []
    })

    const lastStudentElementRef = useCallback((node: HTMLTableRowElement | null) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1)
            }
        })

        if (node) observer.current.observe(node)
    }, [loading, hasMore])

    const fetchStudents = async (currentPage: number, isReloading = false) => {
        // Save current scroll position before loading
        const scrollY = window.scrollY

        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', currentPage.toString())
            params.append('limit', '20')

            if (searchTerm) params.append('search', searchTerm)
            if (sessionFilter !== "all") params.append('session', sessionFilter)
            if (deptFilter !== "all") params.append('department', deptFilter)
            if (upazilaFilter !== "all") params.append('upazila', upazilaFilter)
            if (statusFilter !== "all") {
                params.append('status', statusFilter)
            } else {
                // For admin list, when "all" is selected, we explicitly want to see all statuses
                // including pending (0), approved (1), and rejected (2).
                // If we don't append anything, the API defaults to approval: 1 for safety.
                ['0', '1', '2'].forEach(s => params.append('status', s))
            }

            console.log('Fetching students with params:', {
                page: currentPage,
                searchTerm,
                sessionFilter,
                deptFilter,
                statusFilter,
                url: `/api/students?${params.toString()}`
            })

            const res = await fetch(`/api/students?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                const newStudents = data.students || []

                setHasMore(newStudents.length >= 20)

                if (isReloading || currentPage === 1) {
                    setStudents(newStudents)
                } else {
                    setStudents(prev => [...prev, ...newStudents])
                    // Restore scroll position after appending data
                    requestAnimationFrame(() => {
                        window.scrollTo(0, scrollY)
                    })
                }
            }
        } catch (error) {
            toast.error(t('loadError'))
        } finally {
            setLoading(false)
        }
    }

    const fetchOptions = async () => {
        try {
            const [sessionsRes, departmentsRes, hallsRes, upazilasRes] = await Promise.all([
                fetch('/api/options/sessions'),
                fetch('/api/options/departments'),
                fetch('/api/options/halls'),
                fetch('/api/options/upazilas')
            ])

            if (sessionsRes.ok && departmentsRes.ok && hallsRes.ok && upazilasRes.ok) {
                setOptions({
                    sessions: await sessionsRes.json(),
                    departments: await departmentsRes.json(),
                    halls: await hallsRes.json(),
                    upazilas: await upazilasRes.json()
                })
            }
        } catch (error) {
            console.error("Failed to fetch options")
        }
    }

    useEffect(() => {
        fetchOptions()
    }, [])

    // Debounce search and handle filters
    useEffect(() => {
        setPage(1)
        setHasMore(true)
        const timer = setTimeout(() => {
            fetchStudents(1, true)
        }, 500)

        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, sessionFilter, deptFilter, upazilaFilter, statusFilter])

    // Handle infinite scroll page changes
    useEffect(() => {
        if (page > 1) {
            fetchStudents(page)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    // Client-side filtering for properties NOT supported by API yet (e.g. Hall)
    const filteredStudents = useMemo(() => {
        if (hallFilter !== "all") {
            return students.filter(s => s.hall === hallFilter)
        }
        return students
    }, [students, hallFilter])

    // Bulk Selection Handlers
    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredStudents.map(s => s.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleBulkStatusUpdate = async (status: number, reason?: string) => {
        if (selectedIds.length === 0) return

        setBulkLoading(true)
        try {
            const res = await fetch('/api/students/bulk-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: selectedIds,
                    status,
                    reason,
                    sendSms: true
                })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(t('bulkUpdateSuccess', { count: selectedIds.length }))
                setSelectedIds([])
                setBulkRejectDialogOpen(false)
                setRejectReason("")
                fetchStudents(1, true) // Refresh list
            } else {
                toast.error(data.error || t('bulkUpdateError'))
            }
        } catch (error) {
            toast.error(t('bulkUpdateError'))
        } finally {
            setBulkLoading(false)
        }
    }

    const handleBulkRejectClick = () => {
        if (selectedIds.length === 0) return
        setRejectReason("")
        setBulkRejectDialogOpen(true)
    }

    const handleBulkRejectConfirm = async () => {
        if (!rejectReason.trim()) {
            toast.error(t('rejectReasonRequired'))
            return
        }
        await handleBulkStatusUpdate(2, rejectReason)
    }

    const handleRejectClick = (studentId: number) => {
        setSelectedStudentId(studentId)
        setRejectDialogOpen(true)
    }

    const handleRejectConfirm = async () => {
        if (!selectedStudentId || !rejectReason.trim()) {
            toast.error(t('rejectReasonRequired'))
            return
        }

        await handleStatusUpdate(selectedStudentId, 2, rejectReason, sendRejectionSMS)
        setRejectDialogOpen(false)
        setRejectReason("")
        setSelectedStudentId(null)
    }

    const handleStatusUpdate = async (id: number, status: number, denyReason?: string, sendSms?: boolean) => {
        try {
            const body: any = {
                approval: status,
                deny_reason: denyReason || null
            }
            if (status === 2 && sendSms !== undefined) {
                body.send_sms = sendSms
            }

            const res = await fetch(`/api/students?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                toast.success(t('statusUpdateSuccess'))
                // Update local state instead of refetching to avoid scroll jump
                setStudents(prev => prev.map(s => s.id === id ? { ...s, approval: status } : s))
            } else {
                toast.error(t('statusUpdateFailed'))
            }
        } catch (error) {
            toast.error(t('error'))
        }
    }

    const exportToExcel = async () => {
        setIsExporting(true)
        try {
            const params = new URLSearchParams()
            
            // Apply Status Filter (IDs 0, 1, 2)
            if (selectedExportStatus.length > 0) {
                selectedExportStatus.forEach(s => params.append('status', s))
            }

            // Apply Field Selection
            if (selectedExportFields.length > 0) {
                params.append('fields', selectedExportFields.join(','))
            }

            // Apply Filters (Sessions, Depts, Upazilas)
            if (selectedExportSessions.length > 0) {
                selectedExportSessions.forEach(s => params.append('session', s))
            }
            if (selectedExportDepts.length > 0) {
                selectedExportDepts.forEach(d => params.append('department', d))
            }
            if (selectedExportUpazilas.length > 0) {
                selectedExportUpazilas.forEach(u => params.append('upazila', u))
            }

            // Call the server-side export API
            const res = await fetch(`/api/admin/students/export/approved?${params.toString()}`)
            if (!res.ok) {
                const err = await res.json().catch(() => ({ msg: 'Export failed' }))
                throw new Error(err.msg || 'Export failed')
            }

            // Download file
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `titas-students-${new Date().toISOString().slice(0, 10)}.xlsx`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)

            toast.success('Export successful!')
            setIsExportModalOpen(false)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to export students')
        } finally {
            setIsExporting(false)
        }
    }


    // Helper to get localized option name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getLocalizedOptionName = (item: any) => {
        if (!item) return ""
        if (locale === 'bn' && item.name_bn) {
            return item.name_bn
        }
        return item.name
    }

    // Helper to resolve stored value (English) to Localized Name for Table Display
    const resolveOptionName = (type: 'sessions' | 'departments' | 'halls' | 'upazilas', value: string) => {
        if (!value) return ""
        const found = options[type].find((opt: any) => opt.name?.toLowerCase().trim() === value.toLowerCase().trim())
        return found ? getLocalizedOptionName(found) : value
    }

    const getStudentName = (s: any) => {
        if (locale === 'bn') {
            return s.name_bn || s.name_en || ""
        }
        return s.name_en || s.name_bn || ""
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1 w-full">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-indigo-950 bg-clip-text text-transparent">
                        {t('title')}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>
                
                <div className="flex items-stretch gap-2.5 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            className="pl-11 h-12 bg-white border-slate-200/80 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all rounded-xl shadow-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <Button 
                        variant="outline" 
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex md:hidden items-center justify-center w-12 h-12 rounded-xl transition-all border-slate-200/80",
                            showFilters ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white text-slate-600"
                        )}
                    >
                        <Filter className={cn("h-5 w-5", showFilters && "stroke-[2.5]")} />
                    </Button>

                    <Button 
                        variant="default"
                        onClick={() => {
                            setActiveExportTab('format');
                            setIsExportModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2.5 px-6 h-12 rounded-xl shadow-xl shadow-indigo-600/20 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border-none"
                    >
                        <Download className="h-5 w-5" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </div>
            </div>

            <Card className={cn(
                "border-slate-200/70 shadow-sm overflow-hidden rounded-2xl transition-all duration-300",
                !showFilters ? "hidden md:block" : "block"
            )}>
                <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-600">{t('filters')}</CardTitle>
                    </div>
                    {(sessionFilter !== 'all' || upazilaFilter !== 'all' || hallFilter !== 'all' || deptFilter !== 'all' || statusFilter !== 'all') && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFilters}
                            className="h-8 text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Clear All
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-5 md:p-6 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">

                        <Select value={sessionFilter} onValueChange={setSessionFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filterSession')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('allSessions')}</SelectItem>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {[...options.sessions]
                                    .sort((a, b) => {
                                        const nameA = getLocalizedOptionName(a) || ""
                                        const nameB = getLocalizedOptionName(b) || ""
                                        return nameA.localeCompare(nameB, locale === 'bn' ? 'bn' : 'en')
                                    })
                                    .map((s: any) => (
                                        <SelectItem key={s.id} value={s.name}>{getLocalizedOptionName(s)}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>

                        <Select value={deptFilter} onValueChange={setDeptFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filterDept')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('allDepts')}</SelectItem>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {[...options.departments]
                                    .sort((a, b) => {
                                        const nameA = getLocalizedOptionName(a) || ""
                                        const nameB = getLocalizedOptionName(b) || ""
                                        return nameA.localeCompare(nameB, locale === 'bn' ? 'bn' : 'en')
                                    })
                                    .map((d: any) => (
                                        <SelectItem key={d.id} value={d.name}>{getLocalizedOptionName(d)}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>

                        <Select value={hallFilter} onValueChange={setHallFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filterHall')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('allHalls')}</SelectItem>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {[...options.halls]
                                    .sort((a, b) => {
                                        const nameA = getLocalizedOptionName(a) || ""
                                        const nameB = getLocalizedOptionName(b) || ""
                                        return nameA.localeCompare(nameB, locale === 'bn' ? 'bn' : 'en')
                                    })
                                    .map((h: any) => (
                                        <SelectItem key={h.id} value={h.name}>{getLocalizedOptionName(h)}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>

                        <Select value={upazilaFilter} onValueChange={setUpazilaFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filterUpazila') || "Filter Upazila"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('allUpazilas') || "All Upazilas"}</SelectItem>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {[...options.upazilas]
                                    .sort((a, b) => {
                                        const nameA = getLocalizedOptionName(a) || ""
                                        const nameB = getLocalizedOptionName(b) || ""
                                        return nameA.localeCompare(nameB, locale === 'bn' ? 'bn' : 'en')
                                    })
                                    .map((u: any) => (
                                        <SelectItem key={u.id} value={u.name}>{getLocalizedOptionName(u)}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filterStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('allStatus')}</SelectItem>
                                <SelectItem value="0">{t('pending')}</SelectItem>
                                <SelectItem value="1">{t('approved')}</SelectItem>
                                <SelectItem value="2">{t('rejected')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Students List - Responsive View */}
            <div className="md:hidden space-y-4">
                {loading && students.length === 0 ? (
                    <>
                        {[...Array(5)].map((_, i) => (
                            <Card key={`initial-card-skeleton-${i}`} className="overflow-hidden border-gray-100">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <Skeleton className="h-6 w-16" />
                                        <Skeleton className="h-8 w-16" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </>
                ) : filteredStudents.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-10 text-center text-gray-400">
                            {t('noStudents') || "No students found"}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {filteredStudents.map((student, index) => (
                            <Card
                                key={`mobile-card-${student.id}`}
                                ref={index === filteredStudents.length - 1 ? lastStudentElementRef : null}
                                className="overflow-hidden border-gray-100 hover:border-indigo-100 transition-colors shadow-sm"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {student.image_path ? (
                                                <img
                                                    src={getStudentImageUrl(student.image_path)}
                                                    alt={getStudentName(student)}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm text-gray-400 text-[10px] font-bold">
                                                    NO IMG
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-gray-900 leading-tight text-lg">{getStudentName(student)}</h3>
                                                <p className="text-sm text-indigo-600 font-bold font-mono mt-1">
                                                    {student.prefix}-{String(student.id).padStart(4, '0')}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={
                                            student.approval === 1 ? "default" :
                                                student.approval === 2 ? "destructive" : "secondary"
                                        } className="text-xs px-2.5 py-0.5">
                                            {student.approval === 1 ? t('approved') :
                                                student.approval === 2 ? t('rejected') : t('pending')}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm py-3 border-t border-b border-gray-100 my-3">
                                        <div>
                                            <p className="text-gray-400 uppercase tracking-wider font-bold text-[10px] mb-1">{t('colMobile')}</p>
                                            <p className="text-gray-900 font-bold">{student.mobile}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 uppercase tracking-wider font-bold text-[10px] mb-1">{t('colSession')}</p>
                                            <p className="text-gray-900 font-semibold">{resolveOptionName('sessions', student.student_session)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-400 uppercase tracking-wider font-bold text-[10px] mb-1">{t('colDept')}</p>
                                            <p className="text-gray-900 font-semibold">{resolveOptionName('departments', student.department)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-600 font-bold whitespace-nowrap">
                                                {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB') : '-'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {student.createdAt ? new Date(student.createdAt).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    hour12: true
                                                }) : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {student.approval === 0 && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-10 w-10 p-0 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border-green-200 rounded-xl"
                                                        onClick={() => handleStatusUpdate(student.id, 1)}
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-10 w-10 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl border border-transparent hover:border-red-100"
                                                        onClick={() => handleRejectClick(student.id)}
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            )}
                                            <Link href={`/${locale}/admin/students/${student.id}`}>
                                                <Button size="sm" variant="outline" className="h-10 px-4 text-xs font-bold gap-2 border-indigo-100 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm">
                                                    <Eye className="h-4 w-4" />
                                                    {t('view')}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {loading && hasMore && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
                    <Card className="bg-indigo-900 border-indigo-700 shadow-2xl overflow-hidden min-w-[320px] sm:min-w-[450px]">
                        <CardContent className="px-6 py-3 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 px-2 py-0.5 rounded text-white text-xs font-bold ring-1 ring-white/30 truncate">
                                    {selectedIds.length}
                                </div>
                                <span className="text-white text-sm font-semibold whitespace-nowrap">{t('selected')}</span>
                            </div>
                            <div className="h-6 w-px bg-white/20 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <Button 
                                    size="sm" 
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 h-9 font-bold px-4 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                    onClick={() => handleBulkStatusUpdate(1)}
                                    disabled={bulkLoading}
                                >
                                    {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                    <span className="hidden sm:inline">{t('approveSelected')}</span>
                                    <span className="sm:hidden">{t('approve')}</span>
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    className="h-9 font-bold px-4 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                                    onClick={handleBulkRejectClick}
                                    disabled={bulkLoading}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">{t('rejectSelected')}</span>
                                    <span className="sm:hidden">{t('reject')}</span>
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-white hover:bg-white/10 h-9 font-medium px-4 transition-all"
                                    onClick={() => setSelectedIds([])}
                                    disabled={bulkLoading}
                                >
                                    {common('cancel')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="hidden md:block">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </TableHead>
                                <TableHead className="w-20">ID</TableHead>
                                <TableHead>{t('colImage')}</TableHead>
                                <TableHead>{t('colName')}</TableHead>
                                <TableHead>{t('colSession')}</TableHead>
                                <TableHead>{t('colDept')}</TableHead>
                                <TableHead>{t('colHall')}</TableHead>
                                <TableHead>{t('colSubmittedAt')}</TableHead>
                                <TableHead>{t('colStatus')}</TableHead>
                                <TableHead className="text-right">{t('colActions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && students.length === 0 ? (
                                // Show skeleton rows during initial load
                                <>
                                    {[...Array(10)].map((_, i) => (
                                        <TableRow key={`initial-skeleton-${i}`}>
                                            <TableCell>
                                                <Skeleton className="h-4 w-16" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="w-10 h-10 rounded-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24 mt-1" />
                                            </TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-8 w-8 ml-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-10">
                                        No students found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {filteredStudents.map((student, index) => (
                                        <TableRow
                                            key={student.id}
                                            ref={index === filteredStudents.length - 1 ? lastStudentElementRef : null}
                                            className={selectedIds.includes(student.id) ? "bg-primary/5" : ""}
                                        >
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    checked={selectedIds.includes(student.id)}
                                                    onChange={() => toggleSelect(student.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-gray-600">
                                                {student.prefix}-{String(student.id).padStart(4, '0')}
                                            </TableCell>
                                            <TableCell>
                                                {student.image_path ? (
                                                    <img
                                                        src={getStudentImageUrl(student.image_path)}
                                                        alt={getStudentName(student)}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-500 text-xs">No Img</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div>{getStudentName(student)}</div>
                                                <div className="text-xs text-gray-500">{student.mobile}</div>
                                            </TableCell>
                                            <TableCell>{resolveOptionName('sessions', student.student_session)}</TableCell>
                                            <TableCell>{resolveOptionName('departments', student.department)}</TableCell>
                                            <TableCell>{resolveOptionName('halls', student.hall)}</TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-gray-500">
                                                {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB', {
                                                    timeZone: 'Asia/Dhaka',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : '-'}
                                                <br />
                                                <span className="text-xs text-gray-400">
                                                    {student.createdAt ? new Date(student.createdAt).toLocaleTimeString('en-US', {
                                                        timeZone: 'Asia/Dhaka',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        hour12: true
                                                    }) : ''}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    student.approval === 1 ? "default" :
                                                        student.approval === 2 ? "destructive" : "secondary"
                                                }>
                                                    {student.approval === 1 ? t('approved') :
                                                        student.approval === 2 ? t('rejected') : t('pending')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {student.approval === 0 && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleStatusUpdate(student.id, 1)}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => handleRejectClick(student.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Link href={`/${locale}/admin/students/${student.id}`}>
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {loading && hasMore && (
                                        <>
                                            {[...Array(3)].map((_, i) => (
                                                <TableRow key={`skeleton-${i}`}>
                                                    <TableCell>
                                                        <Skeleton className="w-10 h-10 rounded-full" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-24 mt-1" />
                                                    </TableCell>
                                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                                    <TableCell className="text-right">
                                                        <Skeleton className="h-8 w-8 ml-auto" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={bulkRejectDialogOpen} onOpenChange={setBulkRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('bulkRejectTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('bulkRejectDescription', { count: selectedIds.length })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder={t('rejectReasonPlaceholder')}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkRejectDialogOpen(false)} disabled={bulkLoading}>
                            {common('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleBulkRejectConfirm} disabled={bulkLoading}>
                            {bulkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {t('confirmReject')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('rejectStudent')}</DialogTitle>
                        <DialogDescription>
                            {t('rejectStudentDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder={t('rejectReasonPlaceholder')}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                        />
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="sendSmsList"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={sendRejectionSMS}
                                onChange={(e) => setSendRejectionSMS(e.target.checked)}
                            />
                            <label
                                htmlFor="sendSmsList"
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
                        <Button variant="destructive" onClick={handleRejectConfirm}>
                            {t('confirmReject')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-[1.5rem]">
                    <DialogHeader className="p-8 pb-6 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 bg-slate-900 rounded-2xl shadow-lg">
                                    <Download className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">{t('export.modalTitle')}</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-bold text-base mt-2">
                                        Configure your student data report for export.
                                    </DialogDescription>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-white rounded-full border border-slate-200 shadow-sm">
                                <Users className="w-5 h-5 text-slate-600" />
                                <span className="text-sm font-black text-slate-700 tracking-tight">629 Students Available</span>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-12 custom-scrollbar">
                        {/* Status & Language Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             {/* Application Status */}
                             <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-7 bg-slate-900 rounded-full" />
                                    <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">{t('export.statusTitle')}</h4>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { id: '1', label: t('approved'), color: 'bg-slate-500' },
                                        { id: '0', label: t('pending'), color: 'bg-slate-300' },
                                        { id: '2', label: t('rejected'), color: 'bg-slate-200' }
                                    ].map((s) => {
                                        const isSelected = selectedExportStatus.includes(s.id);
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => {
                                                    if (isSelected) setSelectedExportStatus(prev => prev.filter(v => v !== s.id))
                                                    else setSelectedExportStatus(prev => [...prev, s.id])
                                                }}
                                                className={`
                                                    group flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all active:scale-95
                                                    ${isSelected 
                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}
                                                `}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white' : s.color}`} />
                                                <span className="text-base font-black">{s.label}</span>
                                                {isSelected && <Check className="w-5 h-5 stroke-[4]" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Export Columns Header */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-7 bg-slate-900 rounded-full" />
                                        <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">Language</h4>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 p-2 bg-slate-100 border border-slate-200 rounded-[1.25rem]">
                                    {[
                                        { id: 'en', label: 'English' },
                                        { id: 'bn', label: 'Bengali' },
                                        { id: 'both', label: 'Bilingual' }
                                    ].map((lang) => (
                                        <button
                                            key={lang.id}
                                            onClick={() => setExportLanguage(lang.id as any)}
                                            className={`
                                                flex-1 py-3.5 rounded-xl text-sm font-black transition-all
                                                ${exportLanguage === lang.id 
                                                    ? 'bg-white text-slate-900 shadow-lg ring-1 ring-slate-200' 
                                                    : 'text-slate-500 hover:text-slate-900'}
                                            `}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             {/* Sessions Multi-select */}
                             <div className="space-y-5">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-slate-300 rounded-full" />
                                        <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">{t('export.sessions')}</h4>
                                    </div>
                                    <button onClick={() => setSelectedExportSessions(selectedExportSessions.length === options.sessions.length ? [] : options.sessions.map((s: any) => s.name))} className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors">
                                        {selectedExportSessions.length === options.sessions.length ? 'Clear' : 'Select All'}
                                    </button>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-2.5 grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                                    {options.sessions.map((s: any) => {
                                        const isSelected = selectedExportSessions.includes(s.name);
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => {
                                                    if (isSelected) setSelectedExportSessions(prev => prev.filter(v => v !== s.name))
                                                    else setSelectedExportSessions(prev => [...prev, s.name])
                                                }}
                                                className={`
                                                    flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
                                                    ${isSelected ? 'bg-white text-slate-900 shadow border border-slate-200' : 'text-slate-500 hover:bg-white hover:border-slate-100'}
                                                `}
                                            >
                                                <div className={`w-4 h-4 border-2 rounded-md flex items-center justify-center transition-all ${isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {isSelected && <Check className="w-3 h-3 stroke-[4]" />}
                                                </div>
                                                {s.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Upazilas Multi-select */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-slate-300 rounded-full" />
                                        <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">{t('export.upazilas')}</h4>
                                    </div>
                                    <button onClick={() => setSelectedExportUpazilas(selectedExportUpazilas.length === options.upazilas.length ? [] : options.upazilas.map((u: any) => u.name))} className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors">
                                        {selectedExportUpazilas.length === options.upazilas.length ? 'Clear' : 'Select All'}
                                    </button>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-2.5 grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                                    {options.upazilas.map((u: any) => {
                                        const isSelected = selectedExportUpazilas.includes(u.name);
                                        return (
                                            <button
                                                key={u.id}
                                                onClick={() => {
                                                    if (isSelected) setSelectedExportUpazilas(prev => prev.filter(v => v !== u.name))
                                                    else setSelectedExportUpazilas(prev => [...prev, u.name])
                                                }}
                                                className={`
                                                    flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
                                                    ${isSelected ? 'bg-white text-slate-900 shadow border border-slate-200' : 'text-slate-500 hover:bg-white hover:border-slate-100'}
                                                `}
                                            >
                                                <div className={`w-4 h-4 border-2 rounded-md flex items-center justify-center transition-all ${isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {isSelected && <Check className="w-3 h-3 stroke-[4]" />}
                                                </div>
                                                {u.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Columns Selection */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-slate-100 px-8 py-6 rounded-[2rem] border border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
                                        <LayoutGrid className="w-6 h-6 text-slate-900" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-slate-900 leading-none">Export Columns Selection</h4>
                                        <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-wider">Selected {selectedExportFields.length} / {exportFields.length} Fields</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSelectedExportFields(selectedExportFields.length === exportFields.length ? [] : exportFields.map(f => f.id))}
                                    className="bg-white border-slate-300 text-slate-900 hover:bg-slate-900 hover:text-white h-11 rounded-xl font-black px-6 transition-all"
                                >
                                    {selectedExportFields.length === exportFields.length ? 'Reset All' : 'Select All'}
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                {exportFields.map((field) => {
                                    const isSelected = selectedExportFields.includes(field.id);
                                    return (
                                        <div
                                            key={field.id}
                                            onClick={() => {
                                                if (isSelected) setSelectedExportFields(prev => prev.filter(id => id !== field.id))
                                                else setSelectedExportFields(prev => [...prev, field.id])
                                            }}
                                            className={`
                                                group relative flex flex-col p-5 rounded-2xl border-2 transition-all cursor-pointer select-none
                                                ${isSelected 
                                                    ? 'bg-slate-900 border-slate-900 shadow-md transform -translate-y-0.5' 
                                                    : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg'}
                                            `}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white/50' : 'bg-slate-200'}`} />
                                                {isSelected && <div className="p-1 bg-white rounded-full text-slate-900 shadow-sm"><Check className="w-3 h-3 stroke-[4]" /></div>}
                                            </div>
                                            <span className={`text-xs font-black leading-tight uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-600'}`}>{t(`export.fields.${field.id}`)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 border-t bg-slate-50 flex items-center justify-between gap-8">
                        <div className="hidden sm:block space-y-2">
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Format: Microsoft Excel (.xlsx)</p>
                            <p className="text-xs text-slate-500 font-bold">Includes professional styling and automatic auto-branding.</p>
                        </div>
                        <div className="flex items-center gap-5 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                className="h-16 px-10 font-bold text-slate-500 hover:text-slate-900 rounded-3xl"
                                onClick={() => setIsExportModalOpen(false)}
                            >
                                {common('cancel')}
                            </Button>
                            <Button
                                onClick={exportToExcel}
                                disabled={isExporting || (selectedExportFields.length === 0 && selectedExportStatus.length === 0)}
                                className={`
                                    flex-1 sm:flex-none h-16 px-14 font-black text-lg rounded-[2.5rem] shadow-2xl transition-all active:scale-95 border-none
                                    ${isExporting || (selectedExportFields.length === 0 && selectedExportStatus.length === 0)
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-900 hover:bg-black text-white shadow-slate-300'}
                                `}
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet className="mr-3 h-7 w-7" />
                                        Generate Report
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    )
}
