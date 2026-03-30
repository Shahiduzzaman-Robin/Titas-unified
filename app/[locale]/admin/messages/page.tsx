"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Mail, Trash2, Eye, CheckCircle, RefreshCw, Search } from 'lucide-react'

interface ContactMessage {
    id: number
    name: string
    email: string
    subject: string
    message: string
    status: string
    createdAt: string
}

export default function AdminMessagesPage() {
    const locale = useLocale()
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [selected, setSelected] = useState<ContactMessage | null>(null)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [page, setPage] = useState(1)

    const fetchMessages = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20' })
            if (filter) params.set('status', filter)
            const res = await fetch(`/api/contact?${params}`)
            const data = await res.json()
            setMessages(data.messages || [])
            setTotal(data.total || 0)
        } finally {
            setLoading(false)
        }
    }, [filter, page])

    useEffect(() => { fetchMessages() }, [fetchMessages])

    const updateStatus = async (id: number, status: string) => {
        await fetch(`/api/contact/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
        fetchMessages()
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
    }

    const deleteMsg = async (id: number) => {
        if (!confirm('এই বার্তাটি মুছে ফেলবেন?')) return
        await fetch(`/api/contact/${id}`, { method: 'DELETE' })
        if (selected?.id === id) setSelected(null)
        setSelectedIds(prev => prev.filter(sid => sid !== id))
        fetchMessages()
    }

    const deleteBulkMsg = async () => {
        if (!selectedIds.length) return
        if (!confirm(`${selectedIds.length}টি বার্তা মুছে ফেলতে চান?`)) return
        
        try {
            const res = await fetch('/api/contact', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageIds: selectedIds })
            })
            if (res.ok) {
                setSelectedIds([])
                fetchMessages()
                if (selected && selectedIds.includes(selected.id)) setSelected(null)
            }
        } catch (error) {
            console.error('Failed to delete messages', error)
        }
    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === messages.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(messages.map(m => m.id))
        }
    }

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string, color: string }> = {
            unread: { label: 'অপঠিত', color: '#ef4444' },
            read: { label: 'পঠিত', color: '#94a3b8' },
            replied: { label: 'উত্তরকৃত', color: '#16a34a' },
        }
        const s = map[status] || { label: status, color: '#94a3b8' }
        return (
            <span style={{ background: s.color + '18', color: s.color, padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                {s.label}
            </span>
        )
    }

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="bn-text">বার্তাসমূহ</h1>
                <p className="bn-text">যোগাযোগ ফর্মের মাধ্যমে প্রাপ্ত সকল বার্তা</p>
            </div>

            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['', 'unread', 'read', 'replied'].map(s => (
                            <button key={s} className={`btn-outline ${filter === s ? 'active' : ''}`} onClick={() => { setFilter(s); setPage(1) }}>
                                {s === '' ? 'সব' : s === 'unread' ? 'অপঠিত' : s === 'read' ? 'পঠিত' : 'উত্তরকৃত'}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                        {selectedIds.length > 0 && (
                            <button className="btn-outline reject" onClick={deleteBulkMsg} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                <Trash2 size={14} /> নির্বাচিত মুছুন ({selectedIds.length})
                            </button>
                        )}
                        <button className="btn-outline" onClick={fetchMessages}>
                            <RefreshCw size={14} /> রিফ্রেশ
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-card">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }} className="bn-text">লোডিং...</div>
                    ) : messages.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }} className="bn-text">কোনো বার্তা পাওয়া যায়নি</div>
                    ) : (
                        <div>
                            {/* Mobile View: Cards */}
                            <div className="md:hidden divider divide-y divide-slate-100">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`p-4 transition-colors border-b border-slate-100 ${selected?.id === msg.id ? 'bg-slate-50' : 'bg-white'}`} onClick={() => { setSelected(msg); updateStatus(msg.id, msg.status === 'unread' ? 'read' : msg.status) }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(msg.id)}
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={() => toggleSelect(msg.id)}
                                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <div className="font-bold text-slate-800">{msg.name}</div>
                                            </div>
                                            <div>{statusBadge(msg.status)}</div>
                                        </div>
                                        <div className="text-sm text-slate-600 mb-2 truncate">{msg.subject}</div>
                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <span>{new Date(msg.createdAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB')}</span>
                                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                <button className="p-1.5 bg-slate-50 text-slate-400 rounded-lg" onClick={() => updateStatus(msg.id, 'replied')}>
                                                    <CheckCircle size={14} />
                                                </button>
                                                <button className="p-1.5 bg-red-50 text-red-400 rounded-lg" onClick={() => deleteMsg(msg.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={messages.length > 0 && selectedIds.length === messages.length}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                                />
                                            </th>
                                            <th>প্রেরক</th>
                                            <th>বিষয়</th>
                                            <th>তারিখ</th>
                                            <th>স্ট্যাটাস</th>
                                            <th>অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {messages.map(msg => (
                                            <tr key={msg.id} style={{ cursor: 'pointer', background: selected?.id === msg.id ? '#f8fafc' : '' }}>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedIds.includes(msg.id)}
                                                        onChange={() => toggleSelect(msg.id)}
                                                        onClick={e => e.stopPropagation()}
                                                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                </td>
                                                <td onClick={() => { setSelected(msg); updateStatus(msg.id, msg.status === 'unread' ? 'read' : msg.status) }}>
                                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{msg.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{msg.email}</div>
                                                </td>
                                                <td onClick={() => setSelected(msg)} style={{ fontSize: '0.875rem' }}>{msg.subject}</td>
                                                <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                    {new Date(msg.createdAt).toLocaleDateString('bn-BD')}
                                                </td>
                                                <td>{statusBadge(msg.status)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                        <button className="action-btn" title="রিপ্লাই হিসেবে চিহ্নিত করুন" onClick={() => updateStatus(msg.id, 'replied')}>
                                                            <CheckCircle size={14} />
                                                        </button>
                                                        <button className="action-btn reject" title="মুছুন" onClick={() => deleteMsg(msg.id)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {selected && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <div className="admin-card-title"><Mail size={16} /> বার্তার বিস্তারিত</div>
                            <button className="action-btn" onClick={() => setSelected(null)} style={{ fontSize: '1.25rem', lineHeight: 1 }}>✕</button>
                        </div>
                        <div style={{ padding: '1rem 0' }}>
                            <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div><strong>প্রেরক:</strong> {selected.name}</div>
                                <div><strong>ইমেইল:</strong> <a href={`mailto:${selected.email}`} style={{ color: '#3b82f6' }}>{selected.email}</a></div>
                                <div><strong>বিষয়:</strong> {selected.subject}</div>
                                <div><strong>তারিখ:</strong> {new Date(selected.createdAt).toLocaleString('bn-BD')}</div>
                                <div>{statusBadge(selected.status)}</div>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                {selected.message}
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn-primary" style={{ textDecoration: 'none' }}>
                                    <Mail size={14} /> রিপ্লাই দিন
                                </a>
                                <button className="btn-outline" onClick={() => updateStatus(selected.id, 'replied')}>
                                    <CheckCircle size={14} /> উত্তরকৃত চিহ্নিত
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
