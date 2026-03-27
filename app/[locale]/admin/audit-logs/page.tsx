"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
    Activity, Filter, RefreshCw, Search, Calendar, 
    User, HardDrive, Info, ChevronDown, ChevronUp,
    CheckCircle, XCircle, Trash2, Edit3, PlusCircle, 
    Send, Download, LogIn, LogOut, Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface AuditLog {
    id: number
    action: string
    description?: string
    metadata?: any
    ipAddress?: string
    userAgent?: string
    createdAt: string
    admin?: { name: string; email: string }
    student?: { name_en?: string; name_bn?: string }
}

const ACTION_CONFIG: Record<string, { color: string; icon: any; label_bn: string }> = {
    approve: { color: '#16a34a', icon: CheckCircle, label_bn: 'অনুমোদন' },
    reject: { color: '#dc2626', icon: XCircle, label_bn: 'প্রত্যাখ্যান' },
    delete: { color: '#ef4444', icon: Trash2, label_bn: 'মুছুন' },
    create: { color: '#3b82f6', icon: PlusCircle, label_bn: 'তৈরি' },
    update: { color: '#d97706', icon: Edit3, label_bn: 'আপডেট' },
    login: { color: '#8b5cf6', icon: LogIn, label_bn: 'লগইন' },
    logout: { color: '#64748b', icon: LogOut, label_bn: 'লগআউট' },
    send: { color: '#0ea5e9', icon: Send, label_bn: 'প্রেরণ' },
    export: { color: '#10b981', icon: Download, label_bn: 'এক্সপোর্ট' },
    default: { color: '#1e293b', icon: Info, label_bn: 'অন্যান্য' }
}

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
    
    // Filters
    const [search, setSearch] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    
    const limit = 100

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ 
                page: page.toString(), 
                limit: limit.toString() 
            })
            if (search) params.set('search', search)
            if (actionFilter) params.set('action', actionFilter)
            if (startDate) params.set('startDate', startDate)
            if (endDate) params.set('endDate', endDate)

            const res = await fetch(`/api/admin/activity?${params}`)
            if (res.ok) {
                const data = await res.json()
                setLogs(data.logs || [])
                setTotal(data.total || 0)
            } else {
                toast.error('লগ লোড করতে সমস্যা হয়েছে')
            }
        } catch (error) {
            console.error('Fetch logs error:', error)
            toast.error('সিস্টেম ত্রুটি')
        } finally {
            setLoading(false)
        }
    }, [page, search, actionFilter, startDate, endDate])

    useEffect(() => { fetchLogs() }, [fetchLogs])

    const getActionConfig = (action: string) => {
        const key = Object.keys(ACTION_CONFIG).find(k => action.toLowerCase().includes(k))
        return key ? ACTION_CONFIG[key] : ACTION_CONFIG.default
    }

    const toggleRow = (id: number) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(id)) newExpanded.delete(id)
        else newExpanded.add(id)
        setExpandedRows(newExpanded)
    }

    const pages = Math.ceil(total / limit)

    return (
        <div className="space-y-6">
            <div className="admin-page-header">
                <h1 className="bn-text">অডিট লগস (Audit Logs)</h1>
                <p className="bn-text">সিস্টেমে সম্পাদিত সকল প্রশাসনিক কার্যকলাপের বিস্তারিত ইতিহাস</p>
            </div>

            {/* Advanced Filters */}
            <div className="admin-card">
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <div className="admin-search-wrapper">
                                <Search className="search-icon" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="অ্যাডমিন, স্টুডেন্ট বা বর্ণনা দিয়ে খুঁজুন..." 
                                    className="admin-search-input bn-text"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                        <div>
                            <select 
                                className="admin-search-input bn-text" 
                                style={{ paddingLeft: '1rem' }}
                                value={actionFilter}
                                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">সব অ্যাকশন</option>
                                <option value="approve">অনুমোদন (Approve)</option>
                                <option value="reject">প্রত্যাখ্যান (Reject)</option>
                                <option value="delete">মুছুন (Delete)</option>
                                <option value="create">তৈরি (Create)</option>
                                <option value="update">আপডেট (Update)</option>
                                <option value="login">লগইন (Login)</option>
                                <option value="logout">লগআউট (Logout)</option>
                                <option value="send">প্রেরণ (Send)</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="date" 
                                className="admin-search-input bn-text" 
                                style={{ paddingLeft: '0.75rem' }}
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            />
                            <input 
                                type="date" 
                                className="admin-search-input bn-text" 
                                style={{ paddingLeft: '0.75rem' }}
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-slate-500">
                        <div className="flex items-center gap-4">
                            <span className="bn-text">মোট রেকর্ড: <span className="font-bold text-slate-900">{total}</span></span>
                            {(search || actionFilter || startDate || endDate) && (
                                <button 
                                    onClick={() => { setSearch(''); setActionFilter(''); setStartDate(''); setEndDate(''); setPage(1); }}
                                    className="text-rose-500 font-bold flex items-center gap-1 hover:underline"
                                >
                                    ফিল্টার মুছুন
                                </button>
                            )}
                        </div>
                        <button onClick={fetchLogs} className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> রিফ্রেশ
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table / Cards */}
            <div className="admin-card overflow-hidden bg-white">
                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-16 text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-slate-200 mx-auto" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-16 text-center">
                            <Info className="h-8 w-8 text-slate-100 mx-auto mb-2" />
                            <span className="bn-text text-slate-400">কোনো রেকর্ড পাওয়া যায়নি</span>
                        </div>
                    ) : (
                        logs.map(log => {
                            const config = getActionConfig(log.action)
                            const Icon = config.icon
                            const isExpanded = expandedRows.has(log.id)
                            return (
                                <div key={log.id} className="p-4 active:bg-slate-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div 
                                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: config.color + '15', color: config.color }}
                                        >
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.color }}>{log.action}</span>
                                                    <span className="bn-text font-bold text-slate-900 leading-tight">{config.label_bn}</span>
                                                </div>
                                                <button 
                                                    onClick={() => toggleRow(log.id)}
                                                    className="p-1 text-slate-300"
                                                >
                                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 bn-text mt-1.5 line-clamp-2 leading-relaxed">{log.description || '—'}</p>
                                            
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <User size={12} className="text-slate-300 flex-shrink-0" />
                                                    <span className="truncate">{log.admin?.name || 'System'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <Calendar size={12} className="text-slate-300" />
                                                    {new Date(log.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-slate-50/50 rounded-xl">
                                                    <div className="text-[9px] uppercase text-slate-400 font-bold mb-1">IP Address</div>
                                                    <div className="font-mono text-[10px] text-slate-600">{log.ipAddress || '—'}</div>
                                                </div>
                                                <div className="p-3 bg-slate-50/50 rounded-xl">
                                                    <div className="text-[9px] uppercase text-slate-400 font-bold mb-1">Time</div>
                                                    <div className="text-[10px] text-slate-600">
                                                        {new Date(log.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            {log.student && (
                                                <div className="p-3 bg-blue-50/30 border border-blue-100/50 rounded-xl">
                                                    <div className="text-[9px] uppercase text-blue-400 font-bold mb-1">Target Student</div>
                                                    <div className="bn-text text-sm font-bold text-blue-900">{log.student.name_bn || log.student.name_en}</div>
                                                </div>
                                            )}
                                            {log.metadata && (
                                                <div>
                                                    <div className="text-[9px] uppercase text-slate-400 font-bold mb-1 ml-1">Metadata</div>
                                                    <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner">
                                                        <pre className="text-[10px] text-emerald-400 font-mono leading-relaxed">
                                                            {JSON.stringify(log.metadata, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>অ্যাকশন</th>
                                <th>বর্ণনা</th>
                                <th>অ্যাডমিন</th>
                                <th>টার্গেট স্টুডেন্ট</th>
                                <th>সময়</th>
                                <th style={{ textAlign: 'right' }}>বিস্তারিত</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-20 bg-slate-50/50">
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
                                            <span className="bn-text text-slate-400">লোড হচ্ছে...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-20 bg-slate-50/50">
                                        <div className="flex flex-col items-center gap-3">
                                            <Info className="h-8 w-8 text-slate-200" />
                                            <span className="bn-text text-slate-400">কোনো রেকর্ড পাওয়া যায়নি</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map(log => {
                                const config = getActionConfig(log.action)
                                const Icon = config.icon
                                const isExpanded = expandedRows.has(log.id)

                                return (
                                    <>
                                        <tr key={log.id} className={isExpanded ? 'bg-slate-50' : ''}>
                                            <td className="text-center">
                                                <div 
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ background: config.color + '15', color: config.color }}
                                                >
                                                    <Icon size={16} />
                                                </div>
                                            </td>
                                            <td>
                                                <span className="font-bold flex flex-col">
                                                    <span className="text-xs uppercase tracking-wider" style={{ color: config.color }}>{log.action}</span>
                                                    <span className="bn-text text-sm">{config.label_bn}</span>
                                                </span>
                                            </td>
                                            <td>
                                                <div className="max-w-xs truncate text-slate-600 bn-text" title={log.description || ''}>
                                                    {log.description || '—'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User size={12} className="text-slate-400" />
                                                    </div>
                                                    <span className="font-medium">{log.admin?.name || 'System'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {log.student ? (
                                                    <div className="bn-text text-sm">
                                                        {log.student.name_bn || log.student.name_en}
                                                    </div>
                                                ) : <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="whitespace-nowrap">
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-medium text-slate-700">
                                                        {new Date(log.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-slate-400">
                                                        {new Date(log.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <button 
                                                    onClick={() => toggleRow(log.id)}
                                                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                                                >
                                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr key={`${log.id}-details`} className="bg-slate-50/50">
                                                <td colSpan={7} className="p-0 border-b-2 border-slate-100">
                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                                                                <Activity size={16} /> সেশন ইনফরমেশন
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">IP Address</div>
                                                                    <div className="font-mono text-xs">{log.ipAddress || 'Not Recorded'}</div>
                                                                </div>
                                                                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Timestamp</div>
                                                                    <div className="text-xs">{new Date(log.createdAt).toISOString()}</div>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                                <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">User Agent</div>
                                                                <div className="text-[10px] font-mono text-slate-500 overflow-wrap-anywhere">{log.userAgent || 'Not Recorded'}</div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                                                                <HardDrive size={16} /> মেটাডেটা (Metadata)
                                                            </div>
                                                            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                                                                <pre className="text-[10px] text-emerald-400 font-mono leading-relaxed">
                                                                    {log.metadata ? JSON.stringify(log.metadata, null, 2) : '// No metadata available'}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="text-sm text-slate-500 bn-text">
                            মোট <span className="font-bold text-slate-900">{total}</span> রেকর্ড এর মধ্যে <span className="font-bold text-slate-900">{(page - 1) * limit + 1} - {Math.min(page * limit, total)}</span> দেখানো হচ্ছে
                        </div>
                        <div className="flex gap-2">
                            <button 
                                className="btn-outline bn-text" 
                                onClick={() => setPage(p => Math.max(1, p - 1))} 
                                disabled={page === 1}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            >
                                আগে
                            </button>
                            <div className="flex items-center px-4 font-bold text-slate-900">{page} / {pages}</div>
                            <button 
                                className="btn-outline bn-text" 
                                onClick={() => setPage(p => Math.min(pages, p + 1))} 
                                disabled={page === pages}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            >
                                পরে
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
