"use client"

import { useState, useEffect } from "react"
import { 
  Mail, Bell, CalendarClock, ShieldCheck, Loader2, Save, Send, 
  AlertTriangle, History, Settings, CheckCircle2, XCircle, RefreshCw
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

interface NotificationSettings {
  registrationStatus: boolean
  profileEdit: boolean
  noticePublished: boolean
  eventReminders: boolean
  passwordReset: boolean
  loginAlerts: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  registrationStatus: true,
  profileEdit: true,
  noticePublished: true,
  eventReminders: true,
  passwordReset: true,
  loginAlerts: true,
}

const NOTIFICATION_CONTROLS = [
  { key: 'registrationStatus', icon: CheckCircle2, title: 'Registration Status', description: 'Emails sent when student accounts are approved or rejected.' },
  { key: 'profileEdit', icon: RefreshCw, title: 'Profile Edit Review', description: 'Notifications for profile modification approval/rejection.' },
  { key: 'noticePublished', icon: Bell, title: 'Notice Published', description: 'Bulk emails sent to all students when a new notice is posted.' },
  { key: 'eventReminders', icon: CalendarClock, title: 'Event Notifications', description: 'Announcements and reminders for upcoming campus events.' },
  { key: 'passwordReset', icon: ShieldCheck, title: 'Password Reset', description: 'Security emails containing OTP or reset links.' },
  { key: 'loginAlerts', icon: AlertTriangle, title: 'Login Alerts', description: 'Immediate notification of new logins on student accounts.' },
]

export default function AdminNotificationsPage() {
  const t = useTranslations("admin")
  const { locale } = useParams()
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings')
  
  // Settings State
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [isEmailConfigured, setIsEmailConfigured] = useState(false)
  
  // Test Email State
  const [testEmails, setTestEmails] = useState<Record<string, string>>({})
  const [testingKey, setTestingKey] = useState<string | null>(null)
  const [testSuccess, setTestSuccess] = useState<Record<string, boolean>>({})
  
  // Event Reminder State
  const [daysAhead, setDaysAhead] = useState(1)
  const [sendingReminder, setSendingReminder] = useState(false)

  // Logs State
  const [logs, setLogs] = useState<any[]>([])
  const [logTotal, setLogTotal] = useState(0)
  const [logPage, setLogPage] = useState(1)
  const [loadingLogs, setLoadingLogs] = useState(false)

  useEffect(() => {
    fetchSettings()
    if (activeTab === 'logs') fetchLogs()
  }, [activeTab, logPage])

  const fetchSettings = async () => {
    setLoadingSettings(true)
    try {
      const res = await fetch('/api/admin/notification-settings')
      const data = await res.json()
      if (data.settings) setSettings(data.settings)
      setIsEmailConfigured(data.isConfigured || false)
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
    setLoadingSettings(false)
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/admin/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      if (res.ok) alert("সেটিংস সফলভাবে সংরক্ষিত হয়েছে")
      else alert("সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে")
    } catch (error) {
      alert("সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে")
    }
    setSavingSettings(false)
  }

  const handleTestEmail = async (key: string) => {
    const email = testEmails[key]
    if (!email) {
      alert("অনুগ্রহ করে একটি ইমেইল ঠিকানা লিখুন")
      return
    }

    setTestingKey(key)
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: key, recipientEmail: email })
      })
      if (res.ok) {
        setTestSuccess(prev => ({ ...prev, [key]: true }))
        setTimeout(() => {
          setTestSuccess(prev => ({ ...prev, [key]: false }))
        }, 5000)
      } else {
        alert("ইমেইল পাঠাতে ব্যর্থ হয়েছে")
      }
      fetchLogs() // Refresh logs after test
    } catch (error) {
      alert("একটি ত্রুটি ঘটেছে")
    }
    setTestingKey(null)
  }

  const fetchLogs = async () => {
    setLoadingLogs(true)
    try {
      const res = await fetch(`/api/admin/email-logs?page=${logPage}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setLogTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    }
    setLoadingLogs(false)
  }

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key as keyof NotificationSettings]: !prev[key as keyof NotificationSettings]
    }))
  }

  const handleSendManualReminders = async () => {
    setSendingReminder(true)
    try {
        // This endpoint will be handled by the events/reminders logic if needed, 
        // for now we'll just mock it or point to the bulk trigger we added earlier
        const res = await fetch('/api/events/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ daysAhead })
        })
        if (res.ok) alert("রিমাইন্ডার পাঠানোর প্রক্রিয়া শুরু হয়েছে")
        else alert("রিমাইন্ডার পাঠানো ব্যর্থ হয়েছে")
    } catch (error) {
        alert("নেটওয়ার্ক ত্রুটি")
    }
    setSendingReminder(false)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ইমেইল সিস্টেম</h1>
          <p className="text-slate-500 mt-1">ইমেইল সেটিংস এবং ম্যানুয়াল ট্রিগার পরিচালনা করুন</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings size={18} /> সেটিংস ও কনফিগারেশন
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <History size={18} /> ইমেইল লগ
          </button>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 border ${isEmailConfigured ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
            <div className="flex items-center gap-3">
              {isEmailConfigured ? <CheckCircle2 className="text-emerald-500" /> : <AlertTriangle className="text-amber-500" />}
              <div>
                <span className="font-semibold">{isEmailConfigured ? 'Email System Active' : 'SMTP Configuration Status'}</span>
                <p className="text-xs opacity-80">{isEmailConfigured ? 'The system is ready to deliver notifications.' : 'System is currently in development mode or SMTP is unconfigured.'}</p>
              </div>
            </div>
            <button onClick={fetchSettings} className="bg-white/50 hover:bg-white p-2 rounded-full transition-colors">
              <RefreshCw size={16} className={loadingSettings ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {savingSettings ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} সেটিংস সংরক্ষণ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {NOTIFICATION_CONTROLS.map((control) => {
              const Icon = control.icon
              const isEnabled = settings[control.key as keyof NotificationSettings]
              return (
                <div key={control.key} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                        <Icon className="text-slate-400 group-hover:text-blue-500" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{control.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">{control.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSetting(control.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-50">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input 
                                type="email" 
                                placeholder="টেস্ট ইমেইল ঠিকানা..." 
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 transition-all"
                                value={testEmails[control.key] || ''}
                                onChange={(e) => setTestEmails({ ...testEmails, [control.key]: e.target.value })}
                            />
                        </div>
                        <button 
                            onClick={() => handleTestEmail(control.key)}
                            disabled={testingKey === control.key}
                            className={`px-4 py-2 border rounded-xl transition-all flex items-center justify-center disabled:opacity-50 ${
                                testSuccess[control.key] 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100'
                            }`}
                            title="টেস্ট পাঠান"
                        >
                            {testingKey === control.key ? <Loader2 className="animate-spin" size={16} /> : testSuccess[control.key] ? <CheckCircle2 size={16} /> : <Send size={16} />}
                        </button>
                    </div>
                    {testSuccess[control.key] && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-300">
                            <CheckCircle2 size={10} /> টেস্ট ইমেইল পাঠানো হয়েছে
                        </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex gap-6 items-center">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <CalendarClock size={36} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">ম্যানুয়াল ইভেন্ট রিমাইন্ডার</h2>
                  <p className="text-blue-100 max-w-md">আগামী ইভেন্টগুলোর জন্য শিক্ষার্থীদের কাছে ম্যানুয়ালি ইমেইল রিমাইন্ডার পাঠান।</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <span className="font-semibold whitespace-nowrap">পরবর্তী</span>
                <input 
                  type="number" 
                  value={daysAhead}
                  onChange={(e) => setDaysAhead(parseInt(e.target.value))}
                  className="w-20 bg-white/20 border-none rounded-lg px-3 py-1 font-bold text-center focus:ring-0 text-white"
                />
                <span className="font-semibold whitespace-nowrap">দিনের ইভেন্ট</span>
                <button 
                  onClick={handleSendManualReminders}
                  disabled={sendingReminder}
                  className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {sendingReminder ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} এখনই পাঠান
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={20} className="text-blue-600" /> ইমেইল লগ</h3>
            <button onClick={fetchLogs} className="text-slate-400 hover:text-blue-600 transition-colors">
              <RefreshCw size={18} className={loadingLogs ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">সময়</th>
                  <th className="px-6 py-4">প্রাপক</th>
                  <th className="px-6 py-4">ক্যাটাগরি</th>
                  <th className="px-6 py-4">অবস্থা</th>
                  <th className="px-6 py-4">বিষয়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length > 0 ? (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(log.sentAt).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{log.recipientEmail}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase transition-colors uppercase">
                          {log.category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          log.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {log.status === 'sent' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {log.status === 'sent' ? 'পাঠানো হয়েছে' : 'ব্যর্থ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-xs">{log.subject}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">কোন ইমেইল লগ পাওয়া যায়নি</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {logTotal > 10 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500">মোট {logTotal} টি এন্ট্রি</span>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => setLogPage(p => Math.max(1, p - 1))}
                        disabled={logPage === 1}
                        className="px-3 py-1 bg-white border border-slate-200 rounded text-xs disabled:opacity-50"
                    >
                        পূর্ববর্তী
                    </button>
                    <button 
                        onClick={() => setLogPage(p => p + 1)}
                        disabled={logs.length < 10}
                        className="px-3 py-1 bg-white border border-slate-200 rounded text-xs disabled:opacity-50"
                    >
                        পরবর্তী
                    </button>
                </div>
              </div>
          )}
        </div>
      )}
    </div>
  )
}
