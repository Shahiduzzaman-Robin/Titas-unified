"use client"

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Plus, Trash2, Edit, Users, MapPin, Clock, CheckCircle, Download, X } from 'lucide-react'

interface Event {
    id: number
    title: string
    date: string
    location: string
    description?: string
    link?: string
    rsvpEnabled: boolean
    capacity: number
    createdAt: string
    _count?: { rsvps: number }
}

interface Rsvp {
    id: number
    fullName: string
    email: string | null
    phone: string | null
    department: string | null
    session: string | null
    response: string
    createdAt: string
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Event | null>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        title: '', date: '', location: '', description: '', link: '', rsvpEnabled: true, capacity: 0
    })

    const fetchEvents = useCallback(async () => {
        setLoading(true)
        const res = await fetch('/api/events?admin=1')
        const data = await res.json()
        setEvents(data.success ? data.data : (Array.isArray(data) ? data : data.events || []))
        setLoading(false)
    }, [])

    const [showRsvps, setShowRsvps] = useState(false)
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
    const [rsvps, setRsvps] = useState<Rsvp[]>([])
    const [loadingRsvps, setLoadingRsvps] = useState(false)

    useEffect(() => { fetchEvents() }, [fetchEvents])

    const openNew = () => {
        setEditing(null)
        setForm({ title: '', date: '', location: '', description: '', link: '', rsvpEnabled: true, capacity: 0 })
        setShowForm(true)
    }

    const openEdit = (e: Event) => {
        setEditing(e)
        setForm({
            title: e.title,
            date: new Date(e.date).toISOString().slice(0, 16),
            location: e.location,
            description: e.description || '',
            link: e.link || '',
            rsvpEnabled: e.rsvpEnabled,
            capacity: e.capacity
        })
        setShowForm(true)
    }

    const save = async () => {
        setSaving(true)
        const method = editing ? 'PUT' : 'POST'
        const url = editing ? `/api/events/${editing.id}` : '/api/events'
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
        setSaving(false)
        setShowForm(false)
        fetchEvents()
    }

    const remove = async (id: number) => {
        if (!confirm('এই ইভেন্টটি মুছে ফেলবেন?')) return
        await fetch(`/api/events/${id}`, { method: 'DELETE' })
        fetchEvents()
    }

    const openRsvps = async (ev: Event) => {
        setCurrentEvent(ev)
        setShowRsvps(true)
        setLoadingRsvps(true)
        
        try {
            const res = await fetch(`/api/events/${ev.id}/rsvps`)
            const data = await res.json()
            if (data.success) {
                setRsvps(data.data)
            }
        } catch (error) {
            console.error('Failed to load RSVPs', error)
        } finally {
            setLoadingRsvps(false)
        }
    }

    const downloadCSV = () => {
        if (!rsvps.length) return
        
        const headers = ['Name,Email,Phone,Department,Session,Response,Date']
        const rows = rsvps.map(r => {
            const escape = (str: string | null) => str ? `"${str.replace(/"/g, '""')}"` : '""'
            return `${escape(r.fullName)},${escape(r.email)},${escape(r.phone)},${escape(r.department)},${escape(r.session)},${escape(r.response)},${escape(new Date(r.createdAt).toLocaleString())}`
        })
        
        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `RSVPs_${currentEvent?.title.replace(/\s+/g, '_')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const isUpcoming = (date: string) => new Date(date) >= new Date()

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="bn-text">ইভেন্ট ম্যানেজমেন্ট</h1>
                <p className="bn-text">আসন্ন ও সম্পন্ন সকল ইভেন্ট পরিচালনা করুন</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn-primary" onClick={openNew}><Plus size={16} /> নতুন ইভেন্ট</button>
            </div>

            {showForm && (
                <div className="admin-card" style={{ marginBottom: '1.5rem', border: '2px solid #8b5cf6' }}>
                    <div className="admin-card-header">
                        <div className="admin-card-title bn-text"><Calendar size={16} /> {editing ? 'ইভেন্ট সম্পাদনা' : 'নতুন ইভেন্ট যোগ করুন'}</div>
                    </div>
                    <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>ইভেন্টের নাম *</label>
                                <input className="admin-search-input" style={{ paddingLeft: '1rem' }} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ইভেন্টের নাম..." />
                            </div>
                            <div>
                                <label className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>তারিখ ও সময় *</label>
                                <input type="datetime-local" className="admin-search-input" style={{ paddingLeft: '1rem' }} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                            <div>
                                <label className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>স্থান *</label>
                                <input className="admin-search-input" style={{ paddingLeft: '1rem' }} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="ইভেন্টের স্থান..." />
                            </div>
                            <div>
                                <label className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>ধারণক্ষমতা (0 = সীমাহীন)</label>
                                <input type="number" className="admin-search-input" style={{ paddingLeft: '1rem' }} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 0 }))} />
                            </div>
                        </div>
                        <div>
                            <label className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>বিবরণ</label>
                            <textarea rows={3} className="admin-search-input" style={{ paddingLeft: '1rem' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="ইভেন্টের বিস্তারিত..." />
                        </div>
                        <div>
                            <label className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>লিংক (ঐচ্ছিক)</label>
                            <input type="url" className="admin-search-input" style={{ paddingLeft: '1rem' }} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input type="checkbox" id="rsvpEnabled" checked={form.rsvpEnabled} onChange={e => setForm(f => ({ ...f, rsvpEnabled: e.target.checked }))} />
                            <label htmlFor="rsvpEnabled" className="bn-text" style={{ fontSize: '0.875rem', fontWeight: 600 }}>RSVP সক্রিয় রাখুন</label>
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
                ) : events.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }} className="bn-text">কোনো ইভেন্ট পাওয়া যায়নি</div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ইভেন্টের নাম</th>
                                    <th>তারিখ</th>
                                    <th>স্থান</th>
                                    <th>RSVP</th>
                                    <th>স্ট্যাটাস</th>
                                    <th>অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(ev => (
                                    <tr key={ev.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{ev.title}</div>
                                            {ev.link && <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}><a href={ev.link} target="_blank" rel="noopener noreferrer">লিংক →</a></div>}
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                                                <Clock size={12} />
                                                {new Date(ev.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {new Date(ev.date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={12} />{ev.location}
                                            </div>
                                        </td>
                                        <td>
                                            {ev.rsvpEnabled ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                                                    <Users size={14} color="#8b5cf6" /> {ev._count?.rsvps || 0}
                                                    {ev.capacity > 0 && <span style={{ color: '#94a3b8' }}>/{ev.capacity}</span>}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>অক্ষম</span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                background: isUpcoming(ev.date) ? '#eff6ff' : '#f8fafc',
                                                color: isUpcoming(ev.date) ? '#3b82f6' : '#94a3b8',
                                                padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600
                                            }}>
                                                {isUpcoming(ev.date) ? 'আসন্ন' : 'সম্পন্ন'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button className="action-btn" onClick={() => openRsvps(ev)} title="RSVP তালিকা"><Users size={14} /></button>
                                                <button className="action-btn" onClick={() => openEdit(ev)} title="সম্পাদনা"><Edit size={14} /></button>
                                                <button className="action-btn reject" onClick={() => remove(ev.id)} title="মুছুন"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* RSVP Viewer Modal */}
            {showRsvps && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h3 className="text-lg font-bold bn-text">RSVP তালিকা - {currentEvent?.title}</h3>
                                <p className="text-sm text-slate-500">মোট রেজিস্ট্রেশন: {rsvps.length}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={downloadCSV} className="btn-outline flex items-center gap-2" disabled={rsvps.length === 0}>
                                    <Download size={16} /> CSV ডাউনলোড
                                </button>
                                <button onClick={() => setShowRsvps(false)} className="text-slate-400 hover:text-slate-700">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {loadingRsvps ? (
                                <div className="text-center py-8 text-slate-500">লোড হচ্ছে...</div>
                            ) : rsvps.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 bn-text">কোনো RSVP পাওয়া যায়নি</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-slate-50 border-b">
                                                <th className="p-3 font-semibold text-sm bn-text">নাম</th>
                                                <th className="p-3 font-semibold text-sm bn-text">যোগাযোগ</th>
                                                <th className="p-3 font-semibold text-sm bn-text">সেশন ও বিভাগ</th>
                                                <th className="p-3 font-semibold text-sm bn-text">সময়</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rsvps.map(r => (
                                                <tr key={r.id} className="border-b hover:bg-slate-50">
                                                    <td className="p-3 font-medium">{r.fullName}</td>
                                                    <td className="p-3 text-sm text-slate-600">
                                                        <div>{r.email || '-'}</div>
                                                        <div>{r.phone || '-'}</div>
                                                    </td>
                                                    <td className="p-3 text-sm text-slate-600">
                                                        <div>{r.session || '-'}</div>
                                                        <div>{r.department || '-'}</div>
                                                    </td>
                                                    <td className="p-3 text-sm text-slate-500">
                                                        {new Date(r.createdAt).toLocaleString('bn-BD')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
