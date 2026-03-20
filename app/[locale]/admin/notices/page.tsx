"use client"

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit, Megaphone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface Notice {
    id: number
    text: string
    link?: string
    priority: string
    isActive: boolean
    createdAt: string
}

export default function AdminNoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Notice | null>(null)
    const [form, setForm] = useState({ text: '', link: '', priority: 'normal', isActive: true })
    const [saving, setSaving] = useState(false)

    const fetchNotices = useCallback(async () => {
        setLoading(true)
        const res = await fetch('/api/notices?all=1')
        const data = await res.json()
        setNotices(data.data || [])
        setLoading(false)
    }, [])

    useEffect(() => { fetchNotices() }, [fetchNotices])

    const openNew = () => {
        setEditing(null)
        setForm({ text: '', link: '', priority: 'normal', isActive: true })
        setShowForm(true)
    }

    const openEdit = (n: Notice) => {
        setEditing(n)
        setForm({ text: n.text, link: n.link || '', priority: n.priority, isActive: n.isActive })
        setShowForm(true)
    }

    const save = async () => {
        setSaving(true)
        const method = editing ? 'PUT' : 'POST'
        const url = editing ? `/api/notices/${editing.id}` : '/api/notices'
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
        setSaving(false)
        setShowForm(false)
        fetchNotices()
    }

    const toggle = async (n: Notice) => {
        await fetch(`/api/notices/${n.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !n.isActive })
        })
        fetchNotices()
    }

    const remove = async (id: number) => {
        if (!confirm('এই নোটিশটি মুছে ফেলবেন?')) return
        await fetch(`/api/notices/${id}`, { method: 'DELETE' })
        fetchNotices()
    }

    const priorityBadge = (p: string) => {
        const map: Record<string, { label: string, color: string, icon: any }> = {
            urgent: { label: 'জরুরী', color: '#dc2626', icon: AlertTriangle },
            high: { label: 'গুরুত্বপূর্ণ', color: '#d97706', icon: AlertTriangle },
            normal: { label: 'সাধারণ', color: '#64748b', icon: Megaphone },
        }
        const s = map[p] || map.normal
        const Icon = s.icon
        return (
            <span style={{ background: s.color + '18', color: s.color, padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Icon size={11} />{s.label}
            </span>
        )
    }

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="bn-text">নোটিশ বোর্ড</h1>
                <p className="bn-text">সমস্ত সক্রিয় ও নিষ্ক্রিয় নোটিশ পরিচালনা করুন</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn-primary" onClick={openNew}><Plus size={16} /> নতুন নোটিশ</button>
            </div>

            {showForm && (
                <div className="admin-card" style={{ marginBottom: '1.5rem', border: '2px solid #3b82f6' }}>
                    <div className="admin-card-header">
                        <div className="admin-card-title bn-text"><Megaphone size={16} /> {editing ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ'}</div>
                    </div>
                    <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>নোটিশের বিষয়বস্তু *</label>
                            <textarea rows={3} className="admin-search-input" style={{ paddingLeft: '1rem' }} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="নোটিশের বিষয়বস্তু লিখুন..." />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>লিংক (ঐচ্ছিক)</label>
                                <input type="url" className="admin-search-input" style={{ paddingLeft: '1rem' }} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." />
                            </div>
                            <div>
                                <label className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>অগ্রাধিকার</label>
                                <select className="admin-search-input" style={{ paddingLeft: '1rem' }} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                    <option value="normal">সাধারণ</option>
                                    <option value="high">গুরুত্বপূর্ণ</option>
                                    <option value="urgent">জরুরী</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                            <label htmlFor="isActive" className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600 }}>সক্রিয় রাখুন</label>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn-primary" onClick={save} disabled={saving}>
                                {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                            </button>
                            <button className="btn-outline" onClick={() => setShowForm(false)}>বাতিল</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-card">
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }} className="bn-text">লোডিং...</div>
                ) : notices.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }} className="bn-text">কোনো নোটিশ পাওয়া যায়নি</div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>নোটিশ</th>
                                    <th>অগ্রাধিকার</th>
                                    <th>স্ট্যাটাস</th>
                                    <th>তারিখ</th>
                                    <th>অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notices.map(n => (
                                    <tr key={n.id}>
                                        <td>
                                            <div style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="bn-text">{n.text}</div>
                                            {n.link && <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}><a href={n.link} target="_blank" rel="noopener noreferrer">{n.link}</a></div>}
                                        </td>
                                        <td>{priorityBadge(n.priority)}</td>
                                        <td>
                                            <span style={{ background: n.isActive ? '#dcfce7' : '#fee2e2', color: n.isActive ? '#16a34a' : '#dc2626', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {n.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(n.createdAt).toLocaleDateString('bn-BD')}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button className="action-btn" onClick={() => toggle(n)} title={n.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}>
                                                    {n.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                                </button>
                                                <button className="action-btn" onClick={() => openEdit(n)} title="সম্পাদনা"><Edit size={14} /></button>
                                                <button className="action-btn reject" onClick={() => remove(n.id)} title="মুছুন"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
