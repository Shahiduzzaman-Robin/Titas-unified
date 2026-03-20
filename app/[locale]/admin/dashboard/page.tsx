"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
    Users, CheckCircle, Clock, UserPlus, MessageSquare, Edit, Activity, Calendar,
    XCircle, Image, TrendingUp, TrendingDown, BarChart2, ArrowRight, AlertCircle,
    FileText, Eye, MessageCircle, CalendarCheck, Mail, MailCheck,
    Bell, Shield, BookOpen, Megaphone, Layout
} from 'lucide-react'

interface Stats {
    total: number; approved: number; pending: number; rejected: number
    todayCount: number; monthlyCount: number; lastMonthCount: number; approvalRate: number
    males: number; females: number
    bloodGroups: Array<{ _id: string; count: number }>
    upazilas: Array<{ _id: string; count: number }>
    halls: Array<{ _id: string; count: number }>
    departments: Array<{ _id: string; count: number }>
    trend: Array<{ label: string; count: number }>
    blog: { total: number; published: number; draft: number; totalViews: number; totalComments: number }
    events: { total: number; upcoming: number; past: number }
    gallery: { total: number }
    notices: { total: number; active: number; urgent: number }
    messages: { total: number; unread: number; replied: number }
    profileEdits: { total: number; pending: number }
    audit: { recentActivity: any[]; last24h: number }
}

const StatCard = ({ label, value, sub, icon, valueColor, accentColor, onClick, trend }: any) => (
    <div className="stat-card" style={{ cursor: onClick ? 'pointer' : 'default', borderLeftColor: accentColor || '#e2e8f0' }} onClick={onClick}>
        <div>
            <div className="stat-card-label bn-text">{label}</div>
            <div className="stat-card-value" style={{ color: valueColor || '#1a1a2e' }}>{value}</div>
            <div className="stat-card-sub bn-text">{sub}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div className="stat-card-icon" style={{ background: (accentColor || '#1a1a2e') + '18' }}>{icon}</div>
            {trend !== undefined && trend !== null && (
                <div style={{ fontSize: '0.7rem', color: trend >= 0 ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(trend)}% vs last month
                </div>
            )}
        </div>
    </div>
)

const HBar = ({ label, count, max, color }: any) => (
    <div className="hbar-row">
        <div className="hbar-label">{label}</div>
        <div className="hbar-track">
            <div className="hbar-fill" style={{ width: `${Math.max(2, Math.round((count / max) * 100))}%`, background: color }} />
        </div>
        <div className="hbar-count">{count}</div>
    </div>
)

export default function AdminDashboardPage({ params: { locale } }: { params: { locale: string } }) {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(data => { setStats(data); setLoading(false) })
            .catch(() => { setError('ডেটা লোড করতে সমস্যা হয়েছে।'); setLoading(false) })
    }, [])

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }} className="bn-text">লোডিং...</div>
    )

    if (!stats) return (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '10px' }} className="bn-text">
            {error || 'স্ট্যাটাস লোড করতে ব্যর্থ।'}
        </div>
    )

    const maxUpazila = stats.upazilas[0]?.count || 1
    const maxHall = stats.halls[0]?.count || 1
    const maxDept = stats.departments[0]?.count || 1
    const maxTrend = Math.max(...(stats.trend || []).map(t => t.count), 1)
    const totalGender = (stats.males || 0) + (stats.females || 0)
    const femalePercent = totalGender ? Math.round((stats.females / totalGender) * 100) : 0
    const malePercent = 100 - femalePercent
    const momTrend = stats.lastMonthCount > 0
        ? Math.round(((stats.monthlyCount - stats.lastMonthCount) / stats.lastMonthCount) * 100)
        : null

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="bn-text">ড্যাশবোর্ড</h1>
                <p className="bn-text">সামগ্রিক পরিসংখ্যান এবং প্ল্যাটফর্ম ওভারভিউ</p>
            </div>

            {/* Student Stats */}
            <div className="stat-cards-grid stat-cards-grid--6" style={{ marginBottom: '1.5rem' }}>
                <StatCard label="অনুমোদিত" value={stats.approved}
                    sub={`${stats.approvalRate}% অনুমোদনের হার`}
                    icon={<CheckCircle size={20} color="#16a34a" />} valueColor="#15803d" accentColor="#16a34a"
                    onClick={() => router.push(`/${locale}/admin/students?status=1`)} />
                <StatCard label="অপেক্ষমাণ" value={stats.pending}
                    sub="অনুমোদনের অপেক্ষায় →"
                    icon={<Clock size={20} color="#d97706" />} valueColor="#b45309" accentColor="#d97706"
                    onClick={() => router.push(`/${locale}/admin/students?status=0`)} />
                <StatCard label="প্রত্যাখ্যাত" value={stats.rejected}
                    sub="অনুমোদন বাতিলকৃত"
                    icon={<XCircle size={20} color="#ef4444" />} valueColor="#dc2626" accentColor="#ef4444"
                    onClick={() => router.push(`/${locale}/admin/students?status=2`)} />
                <StatCard label="আজকের নিবন্ধন" value={stats.todayCount}
                    sub="নতুন শিক্ষার্থী"
                    icon={<UserPlus size={20} color="#3b82f6" />} accentColor="#3b82f6" />
                <StatCard label="এই মাসে নিবন্ধন" value={stats.monthlyCount}
                    sub={`গত মাসে: ${stats.lastMonthCount}`}
                    icon={<BarChart2 size={20} color="#8b5cf6" />} accentColor="#8b5cf6"
                    trend={momTrend} />
                <StatCard label="অডিট লগস" value={stats.audit?.last24h || 0}
                    sub="সাম্প্রতিক কার্যকলাপ →"
                    icon={<Activity size={20} color="#0ea5e9" />} accentColor="#0ea5e9"
                    onClick={() => router.push(`/${locale}/admin/audit-logs`)} />
            </div>

            {/* Platform Overview */}
            <h2 className="bn-text dashboard-section-title"><Layout size={18} /> প্ল্যাটফর্ম ওভারভিউ</h2>

            <div className="platform-overview-grid">
                <div className="platform-card" onClick={() => router.push(`/${locale}/admin/blog`)}>
                    <div className="platform-card-icon" style={{ background: '#eff6ff' }}><FileText size={22} color="#3b82f6" /></div>
                    <div className="platform-card-body">
                        <div className="platform-card-title bn-text">ব্লগ</div>
                        <div className="platform-card-value">{stats.blog?.total || 0}</div>
                        <div className="platform-card-details">
                            <span>{stats.blog?.published || 0} প্রকাশিত</span>
                            <span>{stats.blog?.draft || 0} খসড়া</span>
                        </div>
                    </div>
                    <div className="platform-card-extras">
                        <div className="platform-card-extra"><Eye size={12} /> {stats.blog?.totalViews || 0} ভিউ</div>
                        <div className="platform-card-extra"><MessageCircle size={12} /> {stats.blog?.totalComments || 0} মন্তব্য</div>
                    </div>
                </div>

                <div className="platform-card" onClick={() => router.push(`/${locale}/admin/events`)}>
                    <div className="platform-card-icon" style={{ background: '#f5f3ff' }}><Calendar size={22} color="#8b5cf6" /></div>
                    <div className="platform-card-body">
                        <div className="platform-card-title bn-text">ইভেন্ট</div>
                        <div className="platform-card-value">{stats.events?.total || 0}</div>
                        <div className="platform-card-details">
                            <span>{stats.events?.upcoming || 0} আসন্ন</span>
                            <span>{stats.events?.past || 0} সম্পন্ন</span>
                        </div>
                    </div>
                </div>

                <div className="platform-card" onClick={() => router.push(`/${locale}/admin/gallery`)}>
                    <div className="platform-card-icon" style={{ background: '#f0fdf4' }}><Image size={22} color="#16a34a" /></div>
                    <div className="platform-card-body">
                        <div className="platform-card-title bn-text">গ্যালারি</div>
                        <div className="platform-card-value">{stats.gallery?.total || 0}</div>
                    </div>
                </div>

                <div className="platform-card" onClick={() => router.push(`/${locale}/admin/notices`)}>
                    <div className="platform-card-icon" style={{ background: '#fffbeb' }}><Megaphone size={22} color="#d97706" /></div>
                    <div className="platform-card-body">
                        <div className="platform-card-title bn-text">নোটিশ বোর্ড</div>
                        <div className="platform-card-value">{stats.notices?.total || 0}</div>
                        <div className="platform-card-details">
                            <span>{stats.notices?.active || 0} সক্রিয়</span>
                            {(stats.notices?.urgent || 0) > 0 && <span style={{ color: '#b45309' }}>{stats.notices.urgent} জরুরী</span>}
                        </div>
                    </div>
                </div>

                <div className="platform-card" onClick={() => router.push(`/${locale}/admin/messages`)}>
                    <div className="platform-card-icon" style={{ background: '#fff1f2' }}><MessageSquare size={22} color="#f43f5e" /></div>
                    <div className="platform-card-body">
                        <div className="platform-card-title bn-text">বার্তাসমূহ</div>
                        <div className="platform-card-value">{stats.messages?.total || 0}</div>
                        <div className="platform-card-details">
                            <span>{stats.messages?.unread || 0} অপঠিত</span>
                            <span>{stats.messages?.replied || 0} উত্তরকৃত</span>
                        </div>
                    </div>
                </div>

                <div className="platform-card" onClick={() => router.push(`/${locale}/admin/edits`)}>
                    <div className="platform-card-icon" style={{ background: '#f0fdfa' }}><Edit size={22} color="#0d9488" /></div>
                    <div className="platform-card-body">
                        <div className="platform-card-title bn-text">প্রোফাইল সম্পাদনা</div>
                        <div className="platform-card-value">{stats.profileEdits?.total || 0}</div>
                        <div className="platform-card-details">
                            <span>{stats.profileEdits?.pending || 0} অপেক্ষমাণ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity & System Status */}
            <div className="demo-grid">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div className="admin-card-title bn-text"><Activity size={16} /> সাম্প্রতিক কার্যকলাপ</div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>গত ২৪ ঘণ্টায় {stats.audit?.last24h || 0} টি কাজ</span>
                    </div>
                    <div className="recent-activity-list">
                        {(stats.audit?.recentActivity || []).length === 0 && (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }} className="bn-text">কোন সাম্প্রতিক কার্যকলাপ নেই</div>
                        )}
                        {(stats.audit?.recentActivity || []).map((log: any, i: number) => (
                            <div key={i} className="recent-activity-item">
                                <div className="recent-activity-dot" />
                                <div className="recent-activity-content">
                                    <div className="recent-activity-desc">{log.description || `${log.action}`}</div>
                                    <div className="recent-activity-meta">
                                        <span>{log.adminUsername || log.admin?.name}</span>
                                        <span>{new Date(log.createdAt).toLocaleString('bn-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="dashboard-inline-action">
                        <button className="quick-action-btn quick-action-inline bn-text" onClick={() => router.push(`/${locale}/admin/audit-logs`)}>
                            সকল লগ দেখুন <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header"><div className="admin-card-title bn-text"><Shield size={16} /> সিস্টেম স্ট্যাটাস</div></div>
                    <div className="system-status-list">
                        {[
                            { label: 'মোট শিক্ষার্থী', value: stats.total, icon: <Users size={14} /> },
                            { label: 'মোট ব্লগ পোস্ট', value: stats.blog?.total || 0, icon: <FileText size={14} /> },
                            { label: 'আসন্ন ইভেন্ট', value: stats.events?.upcoming || 0, icon: <Calendar size={14} /> },
                            { label: 'গ্যালারি ছবি', value: stats.gallery?.total || 0, icon: <Image size={14} /> },
                            { label: 'সক্রিয় নোটিশ', value: stats.notices?.active || 0, icon: <Megaphone size={14} /> },
                            { label: 'অপঠিত বার্তা', value: stats.messages?.unread || 0, icon: <MessageSquare size={14} /> },
                        ].map((item, i) => (
                            <div key={i} className="system-status-item">
                                <div className="system-status-label bn-text">{item.icon} {item.label}</div>
                                <div className="system-status-value">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Demographics */}
            <h2 className="bn-text dashboard-section-title"><BarChart2 size={18} /> শিক্ষার্থী ডেমোগ্রাফিক ও বিশ্লেষণ</h2>

            <div className="demo-grid">
                <div className="admin-card">
                    <div className="admin-card-header"><div className="admin-card-title bn-text"><Users size={16} /> লিঙ্গ অনুপাত</div></div>
                    <div className="gender-stats">
                        <div><div className="gender-stat-value" style={{ color: '#db2777' }}>{stats.females || 0}</div><div className="gender-stat-label">Female</div></div>
                        <div><div className="gender-stat-value" style={{ color: '#2563eb' }}>{stats.males || 0}</div><div className="gender-stat-label">Male</div></div>
                    </div>
                    <div className="gender-bar-container">
                        <div className="gender-bar-row"><span style={{ width: 60 }}>Female</span><div className="gender-bar" style={{ width: `${femalePercent}%`, background: '#ec4899' }} /><span>{femalePercent}%</span></div>
                        <div className="gender-bar-row"><span style={{ width: 60 }}>Male</span><div className="gender-bar" style={{ width: `${malePercent}%`, background: '#3b82f6' }} /><span>{malePercent}%</span></div>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header"><div className="admin-card-title bn-text">❤️ রক্তের গ্রুপ বিতরণ</div></div>
                    <div className="blood-grid">
                        {(stats.bloodGroups || []).map(bg => (
                            <div key={bg._id} className="blood-item">
                                <div className="bg-type">{bg._id}</div>
                                <div className="bg-count">{bg.count} Students</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="demo-grid">
                <div className="admin-card">
                    <div className="admin-card-header"><div className="admin-card-title bn-text">📍 শীর্ষ উপজেলা</div></div>
                    {(stats.upazilas || []).map(u => <HBar key={u._id} label={u._id} count={u.count} max={maxUpazila} color="#6366f1" />)}
                </div>
                <div className="admin-card">
                    <div className="admin-card-header"><div className="admin-card-title bn-text">🏠 হল বিতরণ</div></div>
                    {(stats.halls || []).map(h => <HBar key={h._id} label={h._id} count={h.count} max={maxHall} color="#0891b2" />)}
                </div>
            </div>

            <div className="demo-grid">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div className="admin-card-title bn-text">📈 নিবন্ধনের ট্রেন্ড</div>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>↑ গত ৭ দিন</span>
                    </div>
                    {(stats.trend || []).map((d, i) => (
                        <div key={i} className="hbar-row" style={{ marginBottom: '0.5rem' }}>
                            <div style={{ width: 80, fontSize: '0.82rem', color: '#475569' }}>{d.label}</div>
                            <div className="hbar-track">
                                <div className="hbar-fill" style={{ width: `${Math.max(d.count > 0 ? 4 : 0, Math.round((d.count / maxTrend) * 100))}%`, background: '#1a1a2e' }} />
                            </div>
                            <div className="hbar-count">{d.count}</div>
                        </div>
                    ))}
                </div>
                <div className="admin-card">
                    <div className="admin-card-header"><div className="admin-card-title bn-text">🎓 ডিপার্টমেন্ট বিতরণ</div></div>
                    {(stats.departments || []).map(d => <HBar key={d._id} label={d._id} count={d.count} max={maxDept} color="#8b5cf6" />)}
                </div>
            </div>
        </div>
    )
}
