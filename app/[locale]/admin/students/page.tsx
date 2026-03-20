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
import { Search, Eye, Check, X, Download, Trash2, Loader2, Filter, Settings, Columns, CheckCircle2, Globe } from "lucide-react"
import { useTranslations } from 'next-intl'
import Link from "next/link"
import ExcelJS from 'exceljs'
import { useLocale } from 'next-intl'
import { getStudentImageUrl } from "@/lib/utils"
import { useSearchParams } from 'next/navigation'

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

    // Pagination State
    const [page, setPage] = useState(parseInt(searchParams.get('page') || "1"))
    const [hasMore, setHasMore] = useState(true)
    const observer = useRef<IntersectionObserver | null>(null)

    // Rejection Dialog State
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
    const [rejectReason, setRejectReason] = useState("")
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
        { id: 'name', label: 'Student Name' },
        { id: 'session', label: 'Session' },
        { id: 'department', label: 'Department' },
        { id: 'hall', label: 'Hall' },
        { id: 'upazila', label: 'Upazila' },
        { id: 'mobile', label: 'Mobile Number' },
        { id: 'email', label: 'Email Address' },
        { id: 'blood_group', label: 'Blood Group' },
        { id: 'gender', label: 'Gender' },
        { id: 'du_reg_number', label: 'DU Reg. Number' },
        { id: 'address', label: 'Address' },
        { id: 'status', label: 'Status' },
        { id: 'photo', label: 'Photo Link' }
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
            params.append('export', 'true')

            // Apply Filters - ONLY use filters selected inside the modal
            if (selectedExportSessions.length > 0) {
                selectedExportSessions.forEach(s => params.append('session', s))
            }

            if (selectedExportDepts.length > 0) {
                selectedExportDepts.forEach(d => params.append('department', d))
            }

            if (selectedExportUpazilas.length > 0) {
                selectedExportUpazilas.forEach(u => params.append('upazila', u))
            }

            if (selectedExportStatus.length > 0) {
                selectedExportStatus.forEach(s => params.append('status', s))
            }

            const res = await fetch(`/api/students?${params.toString()}`)
            if (!res.ok) throw new Error("Export failed")
            const data = await res.json()
            const allStudents = data.students || []

            // Client-side filter for Hall if needed (API doesn't support it yet)
            const finalData = allStudents

            // Sort data: Lower to Higher (ID ascending)
            const sortedData = finalData.sort((a: any, b: any) => a.id - b.id)

            // Create Workbook and Worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Students');

            // Define Dynamic Columns
            const columns: any[] = [{ header: 'SL', key: 'sl', width: 5 }];

            const addLangColumns = (baseId: string, baseHeader: string, enKey: string, bnKey: string, width: number) => {
                if (selectedExportFields.includes(baseId)) {
                    if (exportLanguage === 'both') {
                        columns.push({ header: `${baseHeader} (EN)`, key: enKey, width });
                        columns.push({ header: `${baseHeader} (BN)`, key: bnKey, width });
                    } else if (exportLanguage === 'bn') {
                        columns.push({ header: baseHeader, key: bnKey, width });
                    } else {
                        columns.push({ header: baseHeader, key: enKey, width });
                    }
                }
            }

            if (selectedExportFields.includes('titasId')) columns.push({ header: 'Titas ID', key: 'titasId', width: 15 });

            addLangColumns('name', 'Name', 'name_en', 'name_bn', 30);
            addLangColumns('session', 'Session', 'session_en', 'session_bn', 15);
            addLangColumns('department', 'Department', 'dept_en', 'dept_bn', 25);
            addLangColumns('hall', 'Hall', 'hall_en', 'hall_bn', 20);
            addLangColumns('upazila', 'Upazila', 'upazila_en', 'upazila_bn', 15);
            addLangColumns('address', 'Address', 'address_en', 'address_bn', 30);

            if (selectedExportFields.includes('mobile')) columns.push({ header: 'Phone Number', key: 'phone', width: 15 });
            if (selectedExportFields.includes('email')) columns.push({ header: 'Email', key: 'email', width: 25 });
            if (selectedExportFields.includes('blood_group')) columns.push({ header: 'Blood Group', key: 'blood', width: 12 });
            if (selectedExportFields.includes('gender')) columns.push({ header: 'Gender', key: 'gender', width: 10 });
            if (selectedExportFields.includes('du_reg_number')) columns.push({ header: 'DU Reg.', key: 'duReg', width: 15 });
            if (selectedExportFields.includes('status')) columns.push({ header: 'Status', key: 'status', width: 12 });
            if (selectedExportFields.includes('photo')) columns.push({ header: 'Photo', key: 'photo', width: 15 });

            worksheet.columns = columns;

            // Helper to get raw data for both languages
            const getRawLangData = (type: 'sessions' | 'departments' | 'halls' | 'upazilas', value: string) => {
                if (!value) return { en: "", bn: "" }
                const found = options[type].find((opt: any) => opt.name?.toLowerCase().trim() === value.toLowerCase().trim())
                return {
                    en: found ? found.name : value,
                    bn: found ? (found.name_bn || found.name) : value
                }
            }

            // Add Data
            sortedData.forEach((s: any, index: number) => {
                const rowData: any = {
                    sl: index + 1
                };

                if (selectedExportFields.includes('titasId')) rowData.titasId = `${s.prefix}-${String(s.id).padStart(4, '0')}`;

                if (selectedExportFields.includes('name')) {
                    rowData.name_en = s.name_en || s.name_bn || "";
                    rowData.name_bn = s.name_bn || s.name_en || "";
                }

                if (selectedExportFields.includes('address')) {
                    rowData.address_en = s.address_en || s.address_bn || "";
                    rowData.address_bn = s.address_bn || s.address_en || "";
                }

                if (selectedExportFields.includes('session')) {
                    const data = getRawLangData('sessions', s.student_session);
                    rowData.session_en = data.en;
                    rowData.session_bn = data.bn;
                }

                if (selectedExportFields.includes('department')) {
                    const data = getRawLangData('departments', s.department);
                    rowData.dept_en = data.en;
                    rowData.dept_bn = data.bn;
                }

                if (selectedExportFields.includes('hall')) {
                    const data = getRawLangData('halls', s.hall);
                    rowData.hall_en = data.en;
                    rowData.hall_bn = data.bn;
                }

                if (selectedExportFields.includes('upazila')) {
                    const data = getRawLangData('upazilas', s.upazila);
                    rowData.upazila_en = data.en;
                    rowData.upazila_bn = data.bn;
                }

                if (selectedExportFields.includes('mobile')) rowData.phone = s.mobile || '';
                if (selectedExportFields.includes('email')) rowData.email = s.email || '';
                if (selectedExportFields.includes('blood_group')) rowData.blood = s.blood_group || '';
                if (selectedExportFields.includes('gender')) rowData.gender = s.gender || '';
                if (selectedExportFields.includes('du_reg_number')) rowData.duReg = s.du_reg_number || '';
                if (selectedExportFields.includes('status')) rowData.status = s.approval === 1 ? 'Approved' : s.approval === 2 ? 'Rejected' : 'Pending';

                const row = worksheet.addRow(rowData);

                // Add Hyperlink to Photo if selected
                if (selectedExportFields.includes('photo')) {
                    const imagePath = getStudentImageUrl(s.image_path)
                    const fullImageUrl = imagePath.startsWith('http')
                        ? imagePath
                        : `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`

                    const photoCell = row.getCell(columns.findIndex(c => c.key === 'photo') + 1);
                    photoCell.value = {
                        text: 'View Photo',
                        hyperlink: fullImageUrl,
                        tooltip: 'Click to view photo'
                    };
                    photoCell.font = {
                        color: { argb: 'FF0000FF' },
                        underline: true
                    };
                }
            });

            // Styling Header
            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF008B8B' } // Teal color from image
                };
                cell.font = {
                    bold: true,
                    color: { argb: 'FFFFFFFF' }, // White text
                    size: 11
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });

            // Styling All Data Cells (Borders & Alignment)
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // Skip header
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        };
                        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };
                        // Center SL, ID, Status, Photo columns if they exist
                        const centerKeys = ['sl', 'titasId', 'status', 'photo', 'blood', 'gender'];
                        const colKey = columns[(cell as any).col - 1]?.key;
                        if (centerKeys.includes(colKey)) {
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        }
                    });
                }
            });

            // Auto-fit column widths (basic implementation)
            worksheet.columns.forEach(column => {
                let maxLen = 0;
                column.eachCell!({ includeEmpty: true }, (cell) => {
                    const cellLen = cell.value ? cell.value.toString().length : 0;
                    if (cellLen > maxLen) maxLen = cellLen;
                });
                column.width = Math.min(Math.max(maxLen + 2, 8), 100); // Min 8, Max 100
            });

            // Generate Buffer and Download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            anchor.click();
            window.URL.revokeObjectURL(url);

            toast.success(`Exported ${finalData.length} students`)
            setIsExportModalOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to export students")
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-600 mt-2">{t('subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                        setActiveExportTab('format');
                        setIsExportModalOpen(true);
                    }}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-0 gap-4 pb-4">
                    <CardTitle>{t('filters')}</CardTitle>
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            className="pl-8 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-indigo-300 transition-all w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

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
                <DialogContent className="max-w-3xl max-h-[95vh] flex flex-col p-0 overflow-hidden bg-white/95 backdrop-blur-sm border-gray-200/50 shadow-2xl">
                    <DialogHeader className="p-6 pb-2 border-b bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Download className="w-5 h-5 text-indigo-600" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 leading-none">{t('export.modalTitle')}</DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-500">
                            {t('export.modalDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeExportTab} onValueChange={setActiveExportTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-4 bg-gray-50/30 border-b">
                            <TabsList className="bg-gray-100/80 p-1 rounded-xl mb-4">
                                <TabsTrigger value="format" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2 transition-all">
                                    <Settings className="w-4 h-4" />
                                    <span>{t('export.tabs.format')}</span>
                                </TabsTrigger>
                                <TabsTrigger value="filters" disabled={activeExportTab === 'format'} className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2 transition-all">
                                    <Filter className="w-4 h-4" />
                                    <span>{t('export.tabs.filters')}</span>
                                </TabsTrigger>
                                <TabsTrigger value="columns" disabled={activeExportTab !== 'columns'} className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2 transition-all">
                                    <Columns className="w-4 h-4" />
                                    <span>{t('export.tabs.columns')}</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <TabsContent value="format" className="mt-0 outline-none space-y-8">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 leading-none">{t('export.languageTitle')}</h4>
                                        <p className="text-[11px] text-gray-500 mt-1">{t('export.languageDesc')}</p>
                                    </div>
                                    <div className="p-1 bg-gray-100/80 rounded-xl inline-flex w-full">
                                        {[
                                            { id: 'en', label: t('export.langEn'), icon: Globe },
                                            { id: 'bn', label: t('export.langBn'), icon: Globe },
                                            { id: 'both', label: t('export.langBoth'), icon: Globe }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setExportLanguage(opt.id as any)}
                                                className={`
                                                    flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm transition-all
                                                    ${exportLanguage === opt.id
                                                        ? 'bg-white text-indigo-700 shadow-sm font-semibold border-indigo-100'
                                                        : 'text-gray-500 hover:text-gray-800'}
                                                `}
                                            >
                                                <opt.icon className={`w-3.5 h-3.5 ${exportLanguage === opt.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                <span>{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">{t('export.statusTitle')}</Label>
                                        <span className="text-red-500 text-xs font-bold shrink-0">*</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-50/50 border border-gray-100 rounded-xl">
                                        {[
                                            { id: '0', label: t('pending') },
                                            { id: '1', label: t('approved') },
                                            { id: '2', label: t('rejected') }
                                        ].map((s) => {
                                            const isSelected = selectedExportStatus.includes(s.id);
                                            return (
                                                <div
                                                    key={s.id}
                                                    onClick={() => {
                                                        if (isSelected) setSelectedExportStatus(prev => prev.filter(v => v !== s.id))
                                                        else setSelectedExportStatus(prev => [...prev, s.id])
                                                    }}
                                                    className={`flex items-center px-3 py-2 rounded-lg cursor-pointer border transition-all ${isSelected ? 'bg-white border-indigo-500 text-indigo-700 shadow-sm font-semibold' : 'bg-transparent border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full mr-2 transition-colors ${isSelected ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                                                    <span className="text-[11px]">{s.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-red-500 font-medium mt-1">{t('export.statusNote')}</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="filters" className="mt-0 outline-none">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Sessions Filter */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b pb-1">
                                            <Label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">{t('export.sessions')}</Label>
                                            <Button variant="link" size="sm" className="h-4 p-0 text-[10px] text-indigo-600 hover:text-indigo-800" onClick={() => setSelectedExportSessions(selectedExportSessions.length === options.sessions.length ? [] : options.sessions.map((s: any) => s.name))}>
                                                {selectedExportSessions.length === options.sessions.length ? t('export.clear') : t('export.selectAll')}
                                            </Button>
                                        </div>
                                        <div className="border border-gray-100 rounded-xl max-h-48 overflow-y-auto p-1.5 space-y-1 bg-gray-50/50">
                                            {options.sessions.map((s: any) => {
                                                const isSelected = selectedExportSessions.includes(s.name);
                                                return (
                                                    <div
                                                        key={s.id}
                                                        onClick={() => {
                                                            if (isSelected) setSelectedExportSessions(prev => prev.filter(v => v !== s.name))
                                                            else setSelectedExportSessions(prev => [...prev, s.name])
                                                        }}
                                                        className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600/10 text-indigo-700 font-medium' : 'hover:bg-gray-200/50'}`}
                                                    >
                                                        <div className={`w-3.5 h-3.5 rounded border mr-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'}`}>
                                                            {isSelected && <Check className="w-2.5 h-2.5" />}
                                                        </div>
                                                        <span className="text-xs">{getLocalizedOptionName(s)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Departments Filter */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b pb-1">
                                            <Label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">{t('export.departments')}</Label>
                                            <Button variant="link" size="sm" className="h-4 p-0 text-[10px] text-indigo-600 hover:text-indigo-800" onClick={() => setSelectedExportDepts(selectedExportDepts.length === options.departments.length ? [] : options.departments.map((d: any) => d.name))}>
                                                {selectedExportDepts.length === options.departments.length ? t('export.clear') : t('export.selectAll')}
                                            </Button>
                                        </div>

                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <Input
                                                placeholder={t('export.searchDepts')}
                                                value={exportDeptSearch}
                                                onChange={(e) => setExportDeptSearch(e.target.value)}
                                                className="h-9 pl-9 text-xs bg-gray-50/50 border-gray-100 focus:bg-white focus:border-indigo-300 transition-all rounded-lg"
                                            />
                                            {exportDeptSearch && (
                                                <button
                                                    onClick={() => setExportDeptSearch("")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="border border-gray-100 rounded-xl h-48 overflow-y-auto p-1.5 space-y-1 bg-gray-50/50">
                                            {options.departments
                                                .filter((d: any) => {
                                                    const search = exportDeptSearch.toLowerCase();
                                                    return getLocalizedOptionName(d).toLowerCase().includes(search) || d.name.toLowerCase().includes(search);
                                                })
                                                .map((d: any) => {
                                                    const isSelected = selectedExportDepts.includes(d.name);
                                                    return (
                                                        <div
                                                            key={d.id}
                                                            onClick={() => {
                                                                if (isSelected) setSelectedExportDepts(prev => prev.filter(v => v !== d.name))
                                                                else setSelectedExportDepts(prev => [...prev, d.name])
                                                            }}
                                                            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600/10 text-indigo-700 font-medium' : 'hover:bg-gray-200/50'}`}
                                                        >
                                                            <div className={`w-3.5 h-3.5 rounded border mr-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'}`}>
                                                                {isSelected && <Check className="w-2.5 h-2.5" />}
                                                            </div>
                                                            <span className="text-xs">{getLocalizedOptionName(d)}</span>
                                                        </div>
                                                    );
                                                })}
                                            {options.departments.filter((d: any) => {
                                                const search = exportDeptSearch.toLowerCase();
                                                return getLocalizedOptionName(d).toLowerCase().includes(search) || d.name.toLowerCase().includes(search);
                                            }).length === 0 && (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-8">
                                                        <Search className="w-6 h-6 opacity-20" />
                                                        <p className="text-[10px]">{t('export.noDepts')}</p>
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* Upazilas Filter */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b pb-1">
                                            <Label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">{t('export.upazilas')}</Label>
                                            <Button variant="link" size="sm" className="h-4 p-0 text-[10px] text-indigo-600 hover:text-indigo-800" onClick={() => setSelectedExportUpazilas(selectedExportUpazilas.length === options.upazilas.length ? [] : options.upazilas.map((u: any) => u.name))}>
                                                {selectedExportUpazilas.length === options.upazilas.length ? t('export.clear') : t('export.selectAll')}
                                            </Button>
                                        </div>

                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <Input
                                                placeholder={t('export.searchUpazilas')}
                                                value={exportUpazilaSearch}
                                                onChange={(e) => setExportUpazilaSearch(e.target.value)}
                                                className="h-9 pl-9 text-xs bg-gray-50/50 border-gray-100 focus:bg-white focus:border-indigo-300 transition-all rounded-lg"
                                            />
                                            {exportUpazilaSearch && (
                                                <button
                                                    onClick={() => setExportUpazilaSearch("")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="border border-gray-100 rounded-xl h-48 overflow-y-auto p-1.5 space-y-1 bg-gray-50/50">
                                            {options.upazilas
                                                .filter((u: any) => {
                                                    const search = exportUpazilaSearch.toLowerCase();
                                                    return getLocalizedOptionName(u).toLowerCase().includes(search) || u.name.toLowerCase().includes(search);
                                                })
                                                .map((u: any) => {
                                                    const isSelected = selectedExportUpazilas.includes(u.name);
                                                    return (
                                                        <div
                                                            key={u.id}
                                                            onClick={() => {
                                                                if (isSelected) setSelectedExportUpazilas(prev => prev.filter(v => v !== u.name))
                                                                else setSelectedExportUpazilas(prev => [...prev, u.name])
                                                            }}
                                                            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600/10 text-indigo-700 font-medium' : 'hover:bg-gray-200/50'}`}
                                                        >
                                                            <div className={`w-3.5 h-3.5 rounded border mr-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'}`}>
                                                                {isSelected && <Check className="w-2.5 h-2.5" />}
                                                            </div>
                                                            <span className="text-xs">{getLocalizedOptionName(u)}</span>
                                                        </div>
                                                    );
                                                })}
                                            {options.upazilas.filter((u: any) => {
                                                const search = exportUpazilaSearch.toLowerCase();
                                                return getLocalizedOptionName(u).toLowerCase().includes(search) || u.name.toLowerCase().includes(search);
                                            }).length === 0 && (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-8">
                                                        <Search className="w-6 h-6 opacity-20" />
                                                        <p className="text-[10px]">{t('export.noUpazilas')}</p>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
                                        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                            <Filter className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h5 className="text-xs font-semibold text-blue-900">{t('export.optionalFilters')}</h5>
                                            <p className="text-[11px] text-blue-700 leading-relaxed">
                                                {t('export.optionalFiltersDesc')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="columns" className="mt-0 space-y-4 outline-none">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 leading-none">{t('export.columnsTitle')}</h4>
                                        <p className="text-[11px] text-gray-500 mt-1">{t('export.columnsDesc')}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs font-medium hover:bg-gray-100 transition-colors"
                                        onClick={() => {
                                            if (selectedExportFields.length === exportFields.length) {
                                                setSelectedExportFields([])
                                            } else {
                                                setSelectedExportFields(exportFields.map(f => f.id))
                                            }
                                        }}
                                    >
                                        {selectedExportFields.length === exportFields.length ? t('export.deselectAll') : t('export.selectAll')}
                                    </Button>
                                </div>

                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <Input
                                        placeholder={common('searchPlaceholder')}
                                        value={exportColumnSearch}
                                        onChange={(e) => setExportColumnSearch(e.target.value)}
                                        className="h-9 pl-9 text-xs bg-gray-50/50 border-gray-100 focus:bg-white focus:border-indigo-300 transition-all rounded-lg"
                                    />
                                    {exportColumnSearch && (
                                        <button
                                            onClick={() => setExportColumnSearch("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                                    {exportFields
                                        .filter(field => {
                                            const localizedLabel = t(`export.fields.${field.id}`);
                                            return localizedLabel.toLowerCase().includes(exportColumnSearch.toLowerCase()) || field.id.toLowerCase().includes(exportColumnSearch.toLowerCase());
                                        })
                                        .map((field) => {
                                            const isSelected = selectedExportFields.includes(field.id);
                                            return (
                                                <div
                                                    key={field.id}
                                                    onClick={() => {
                                                        if (isSelected) setSelectedExportFields(prev => prev.filter(id => id !== field.id))
                                                        else setSelectedExportFields(prev => [...prev, field.id])
                                                    }}
                                                    className={`
                                                        group relative flex items-center px-3 py-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-md
                                                        ${isSelected
                                                            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700 font-semibold ring-2 ring-indigo-500/10'
                                                            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'}
                                                    `}
                                                >
                                                    <div className={`
                                                        shrink-0 w-5 h-5 rounded-full border mr-3 flex items-center justify-center transition-colors
                                                        ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 bg-white group-hover:border-gray-400'}
                                                    `}>
                                                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-xs truncate">{t(`export.fields.${field.id}`)}</span>
                                                </div>
                                            );
                                        })}
                                    {exportFields.filter(field => {
                                        const localizedLabel = t(`export.fields.${field.id}`);
                                        return localizedLabel.toLowerCase().includes(exportColumnSearch.toLowerCase()) || field.id.toLowerCase().includes(exportColumnSearch.toLowerCase());
                                    }).length === 0 && (
                                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
                                                <Search className="w-8 h-8 opacity-20" />
                                                <p className="text-xs">{common('noOptions')}</p>
                                            </div>
                                        )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <div className="p-6 border-t bg-gray-50/50">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-6">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('export.step')}</p>
                                    <p className="text-sm font-bold text-gray-900 capitalize">
                                        {activeExportTab === 'format' ? '1 / 3' : activeExportTab === 'filters' ? '2 / 3' : '3 / 3'}
                                    </p>
                                </div>
                                <div className="h-6 w-px bg-gray-200" />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('export.phase')}</p>
                                    <p className="text-sm font-bold text-gray-900 capitalize">{t(`export.tabs.${activeExportTab}`).split('. ')[1]}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {activeExportTab !== 'format' && (
                                    <Button
                                        variant="outline"
                                        className="h-11 px-6 font-medium rounded-xl hover:bg-gray-100 transition-all"
                                        onClick={() => setActiveExportTab(activeExportTab === 'columns' ? 'filters' : 'format')}
                                    >
                                        {t('export.back')}
                                    </Button>
                                )}

                                {activeExportTab !== 'columns' ? (
                                    <Button
                                        className="flex-1 sm:flex-none h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                        onClick={() => setActiveExportTab(activeExportTab === 'format' ? 'filters' : 'columns')}
                                        disabled={activeExportTab === 'format' && selectedExportStatus.length === 0}
                                    >
                                        {t('export.next')}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={exportToExcel}
                                        disabled={isExporting || selectedExportFields.length === 0}
                                        className="flex-1 sm:flex-none h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                                    >
                                        {isExporting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t('export.exporting')}
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-4 w-4" />
                                                {t('export.startExport')}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    )
}
