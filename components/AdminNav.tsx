"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Settings, LogOut, User, ChevronDown } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import '@/styles/AdminNavbar.css'

export function AdminNav({ userEmail, userName, userImage }: { userEmail: string, userName: string, userImage?: string }) {
    const pathname = usePathname()
    const locale = useLocale()
    const { data: session } = useSession()
    const [pendingCount, setPendingCount] = useState(0)
    const [unreadMessages, setUnreadMessages] = useState(0)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)

    const displayEmail = session?.user?.email || userEmail
    const displayName = (session?.user?.name || userName || 'TITAS').toUpperCase()
    const isSystemAdmin = (session?.user as any)?.isSystemAdmin

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [editsRes, messagesRes] = await Promise.allSettled([
                    fetch('/api/admin/edits/count'),
                    fetch('/api/contact/unread')
                ])
                if (editsRes.status === 'fulfilled' && editsRes.value.ok) {
                    const data = await editsRes.value.json()
                    setPendingCount(data.count || 0)
                }
                if (messagesRes.status === 'fulfilled' && messagesRes.value.ok) {
                    const data = await messagesRes.value.json()
                    setUnreadMessages(data.count || 0)
                }
            } catch (e) {}
        }
        fetchCounts()
        const interval = setInterval(fetchCounts, 60000)
        return () => clearInterval(interval)
    }, [pathname])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
            console.error('Logout log failed', e)
        }
        await signOut({ callbackUrl: `/${locale}/login` })
    }

    const navLinks = [
        { href: `/${locale}/admin/dashboard`, label: 'ড্যাশবোর্ড', id: 'dashboard' },
        { href: `/${locale}/admin/students`, label: 'শিক্ষার্থী', id: 'students' },
        {
            href: `/${locale}/admin/edits`,
            label: 'অপেক্ষমাণ সম্পাদনা',
            id: 'edits',
            badge: pendingCount > 0 ? pendingCount : null as number | null
        },
        { href: `/${locale}/admin/blog`, label: 'ব্লগ ম্যানেজমেন্ট', id: 'blog' },
        {
            href: `/${locale}/admin/messages`,
            label: 'বার্তাসমূহ',
            id: 'messages',
            badge: unreadMessages > 0 ? unreadMessages : null as number | null
        },
        { href: `/${locale}/admin/notices`, label: 'নোটিশ বোর্ড', id: 'notices' },
        { href: `/${locale}/admin/gallery`, label: 'গ্যালারি', id: 'gallery' },
        { href: `/${locale}/admin/events`, label: 'ইভেন্ট', id: 'events' },
        { href: `/${locale}/admin/sms`, label: 'এসএমএস', id: 'sms' },
        { href: `/${locale}/admin/notifications`, label: 'ইমেইল', id: 'notifications' },
        { href: `/${locale}/admin/audit-logs`, label: 'অডিট লগস', id: 'audit-logs' },
    ]

    const isActive = (href: string) => {
        // Strip locale prefix for comparison
        const hrefWithoutLocale = href.replace(`/${locale}`, '')
        const pathWithoutLocale = pathname?.replace(`/${locale}`, '') || ''
        return pathWithoutLocale.startsWith(hrefWithoutLocale)
    }

    return (
        <nav className="admin-navbar">
            <div className="admin-nav-logo">
                <div>
                    <h1 className="bn-text">তিতাস - অ্যাডমিন প্যানেল</h1>
                    <p>ADMINISTRATOR</p>
                </div>
            </div>

            <div className="admin-nav-links">
                {navLinks.map(link => (
                    <Link
                        key={link.id}
                        href={link.href}
                        className={`admin-nav-link bn-text ${isActive(link.href) ? 'active' : ''}`}
                        style={{ position: 'relative' }}
                    >
                        {link.label}
                        {link.badge && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-10px',
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                zIndex: 10
                            }}>
                                {link.badge}
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            <div className="admin-nav-right">
                <Link
                    href={`/${locale}/admin/settings`}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="সেটিংস"
                >
                    <Settings size={18} />
                </Link>

                <div
                    className="admin-nav-user"
                    ref={userMenuRef}
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                    <div className="admin-avatar">
                        {userImage ? (
                            <img src={userImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={18} color="#64748b" />
                        )}
                    </div>
                    <div className="admin-user-info">
                        <div className="name">{displayName}</div>
                        <div className="email">{displayEmail}</div>
                    </div>
                    <ChevronDown size={14} color="#64748b" />

                    {userMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            minWidth: '180px',
                            zIndex: 100,
                            padding: '0.5rem',
                        }}>
                            <Link
                                href={`/${locale}/admin/settings`}
                                className="bn-text"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 0.8rem', color: '#1e293b', textDecoration: 'none',
                                    borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500
                                }}
                            >
                                <Settings size={15} /> সেটিংস
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bn-text"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 0.8rem', color: '#dc2626', background: 'none',
                                    border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
                                    borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500
                                }}
                            >
                                <LogOut size={15} /> লগআউট
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
