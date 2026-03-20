import nodemailer from 'nodemailer'
import { prisma } from "@/lib/prisma"

const APP_NAME = 'TitasDU'
const ORG_FULL_NAME = 'তিতাস-ঢাকা বিশ্ববিদ্যালয়স্থ ব্রাহ্মণবাড়িয়া জেলা ছাত্রকল্যাণ পরিষদ'
const EMAIL_FONT_STACK = "'Hind Siliguri','Noto Sans Bengali','Inter',Arial,sans-serif"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isEmailConfigured = () =>
    Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

const escapeHtml = (v = '') =>
    String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const getLogoSrc = () => {
    if (process.env.EMAIL_LOGO_URL) return process.env.EMAIL_LOGO_URL.trim()
    const base = (process.env.NEXTAUTH_URL || '').trim().replace(/\/$/, '')
    return base ? `${base}/logo-email.png` : ''
}

// ─── Premium HTML Email Template (matches clone design exactly) ───────────────

export function renderEmailLayout({
    title, intro = '', contentHtml = '', badge = 'TITASDU', footerNote = ''
}: {
    title: string; intro?: string; contentHtml?: string; badge?: string; footerNote?: string
}) {
    const safeTitle = escapeHtml(title)
    const safeIntro = escapeHtml(intro)
    const safeBadge = escapeHtml(badge)
    const safeFooter = escapeHtml(footerNote || 'এই ইমেইলটি একটি স্বয়ংক্রিয় বার্তা। প্রয়োজন হলে TitasDU সাপোর্টে যোগাযোগ করুন।')
    const logoSrc = getLogoSrc()

    return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<style>
  :root { color-scheme: light only !important; }
  body, .email-bg { background: #eef2ff !important; color: #0f172a !important; font-family: ${EMAIL_FONT_STACK} !important; }
  .email-card { background: #ffffff !important; border: 1px solid #e2e8f0 !important; }
  .email-header { background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%) !important; color: #ffffff !important; }
  .email-header * { color: #ffffff !important; }
  .email-title { color: #0f172a !important; }
  .email-intro { color: #334155 !important; }
  .email-content { background: #f8fafc !important; color: #0f172a !important; border: 1px solid #e2e8f0 !important; }
  .email-footer { background: #f8fafc !important; color: #64748b !important; border-top: 1px solid #e2e8f0 !important; }
</style>
</head>
<body style="margin:0;padding:0;font-family:${EMAIL_FONT_STACK};">
  <div class="email-bg" style="margin:0;padding:24px;font-family:${EMAIL_FONT_STACK};color:#0f172a;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-card"
      style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 40px rgba(15,23,42,0.08);">
      <tr>
        <td class="email-header" style="padding:24px 28px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#ffffff;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="vertical-align:middle;width:74px;">
                ${logoSrc ? `<img src="${escapeHtml(logoSrc)}" alt="Titas Logo" width="58" height="58" style="display:block;border-radius:14px;background:#ffffff;padding:6px;" />` : ''}
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:11px;letter-spacing:1.1px;font-weight:700;text-transform:uppercase;opacity:0.88;color:#ffffff !important;">${safeBadge}</div>
                <div style="font-size:19px;line-height:1.35;font-weight:700;margin-top:4px;color:#ffffff !important;">${ORG_FULL_NAME}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 28px 22px;">
          <h1 class="email-title" style="margin:0 0 12px;font-size:24px;line-height:1.3;color:#0f172a;">${safeTitle}</h1>
          ${safeIntro ? `<p class="email-intro" style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.75;">${safeIntro}</p>` : ''}
          <div class="email-content" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;color:#0f172a;font-size:15px;line-height:1.75;">
            ${contentHtml}
          </div>
        </td>
      </tr>
      <tr>
        <td class="email-footer" style="padding:14px 28px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;">
          <p style="margin:0 0 10px;color:#64748b;font-size:12px;line-height:1.7;">${safeFooter}</p>
          <p style="margin:0;color:#64748b;font-size:12px;line-height:1.7;">
            🌐 <a href="${process.env.NEXTAUTH_URL || 'https://titasdu.com'}" style="color:#1d4ed8;text-decoration:none;">titasdu.com</a>
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`
}

// ─── Notification Settings ────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
    registrationStatus: true,
    profileEdit: true,
    noticePublished: true,
    eventReminders: true,
    passwordReset: true,
    loginAlerts: true,
}

export async function getNotificationSettings() {
    try {
        const record = await prisma.notification_settings.findFirst({ orderBy: { id: 'asc' } })
        if (!record) return { ...DEFAULT_SETTINGS }
        return {
            registrationStatus: record.registrationStatus,
            profileEdit: record.profileEdit,
            noticePublished: record.noticePublished,
            eventReminders: record.eventReminders,
            passwordReset: record.passwordReset,
            loginAlerts: record.loginAlerts,
        }
    } catch {
        return { ...DEFAULT_SETTINGS }
    }
}

export async function saveNotificationSettings(settings: Partial<typeof DEFAULT_SETTINGS>, updatedBy = '') {
    const existing = await prisma.notification_settings.findFirst({ orderBy: { id: 'asc' } })
    const data = { ...DEFAULT_SETTINGS, ...settings, updatedBy }
    if (existing) {
        return prisma.notification_settings.update({ where: { id: existing.id }, data })
    }
    return prisma.notification_settings.create({ data })
}

async function isNotificationEnabled(type: keyof typeof DEFAULT_SETTINGS) {
    const settings = await getNotificationSettings()
    return Boolean(settings[type])
}

// ─── Email Logging ────────────────────────────────────────────────────────────

async function logEmail({ category, to, subject, sent, failureReason }: {
    category: string; to: string; subject: string; sent: boolean; failureReason?: string
}) {
    try {
        await prisma.email_logs.create({
            data: {
                category,
                status: sent ? 'sent' : 'failed',
                recipientEmail: to.toLowerCase().trim(),
                subject,
                failureReason: sent ? null : (failureReason || 'unknown'),
            }
        })
    } catch (err) {
        console.error('Failed to log email:', err)
    }
}

// ─── Core Sender ──────────────────────────────────────────────────────────────

const getTransporter = () => {
    if (!isEmailConfigured()) return null
    const config: any = {
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false }
    }
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
        config.service = 'gmail'
    } else {
        config.host = process.env.SMTP_HOST
        config.port = Number(process.env.SMTP_PORT || 587)
        config.secure = Number(process.env.SMTP_PORT) === 465
    }
    return nodemailer.createTransport(config)
}

export async function sendEmail({ to, subject, html, text, category = 'general' }: {
    to: string; subject: string; html?: string; text?: string; category?: string
}) {
    if (!to) return { sent: false, reason: 'missing-recipient' }

    const transporter = getTransporter()
    if (!transporter) {
        console.log('⚠️ SMTP not configured. Would send to:', to, '| Subject:', subject)
        await logEmail({ category, to, subject, sent: false, failureReason: 'smtp-not-configured' })
        return { sent: false, reason: 'smtp-not-configured' }
    }

    try {
        await transporter.sendMail({
            from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
            to, subject, html, text
        })
        await logEmail({ category, to, subject, sent: true })
        return { sent: true }
    } catch (error: any) {
        console.error('Email send failed:', error.message)
        await logEmail({ category, to, subject, sent: false, failureReason: error.message })
        return { sent: false, reason: error.message }
    }
}

// ─── Student Name Helper ──────────────────────────────────────────────────────

const getDisplayName = (student: { name_bn?: string | null; name_en?: string | null }) =>
    student?.name_bn || student?.name_en || 'শিক্ষার্থী'

// ─── Notification Functions ───────────────────────────────────────────────────

/** Sent when admin approves or rejects a student registration */
export async function notifyStudentRegistrationStatus(
    student: { email?: string | null; name_bn?: string | null; name_en?: string | null },
    status: 'approved' | 'rejected' | 1 | 2,
    force = false
) {
    if (!student?.email) return { sent: false }
    if (!force && !(await isNotificationEnabled('registrationStatus'))) return { sent: false, reason: 'disabled' }

    const isApproved = status === 'approved' || status === 1
    const name = getDisplayName(student)

    const html = renderEmailLayout({
        title: isApproved ? 'নিবন্ধন অনুমোদিত হয়েছে' : 'নিবন্ধন স্ট্যাটাস আপডেট',
        intro: `প্রিয় ${name},`,
        badge: 'REGISTRATION UPDATE',
        contentHtml: `<p style="margin:0;">${escapeHtml(
            isApproved
                ? 'আপনার নিবন্ধন অনুমোদিত হয়েছে। এখন আপনি লগইন করে সকল ফিচার ব্যবহার করতে পারবেন।'
                : 'আপনার নিবন্ধন আবেদনটি অনুমোদিত হয়নি। প্রয়োজনে সঠিক তথ্য দিয়ে আবার যোগাযোগ করুন।'
        )}</p>`
    })

    return sendEmail({
        to: student.email,
        subject: isApproved ? 'সদস্যপদ অনুমোদিত হয়েছে - TitasDU' : 'সদস্যপদ আবেদন আপডেট - TitasDU',
        html,
        category: 'registrationStatus'
    })
}

/** Sent when admin approves a profile edit */
export async function sendEditApprovedEmail(email: string, studentName: string, adminName?: string, force = false) {
    if (!force && !(await isNotificationEnabled('profileEdit'))) return { sent: false, reason: 'disabled' }

    const html = renderEmailLayout({
        title: 'প্রোফাইল আপডেট অনুমোদিত',
        intro: `প্রিয় ${escapeHtml(studentName)},`,
        badge: 'PROFILE REVIEW',
        contentHtml: `<p style="margin:0;">আপনার প্রোফাইল পরিবর্তনের অনুরোধ অনুমোদিত হয়েছে${adminName ? ` (${escapeHtml(adminName)})` : ''}।</p>`
    })

    return sendEmail({
        to: email,
        subject: 'প্রোফাইল এডিট অনুমোদিত হয়েছে - TitasDU',
        html,
        category: 'profileEdit'
    })
}

/** Sent when admin rejects a profile edit */
export async function sendEditRejectedEmail(email: string, studentName: string, reason: string, adminName?: string, force = false) {
    if (!force && !(await isNotificationEnabled('profileEdit'))) return { sent: false, reason: 'disabled' }

    const html = renderEmailLayout({
        title: 'প্রোফাইল আপডেট রিভিউ সম্পন্ন',
        intro: `প্রিয় ${escapeHtml(studentName)},`,
        badge: 'PROFILE REVIEW',
        contentHtml: `
            <p style="margin:0 0 8px;">আপনার প্রোফাইল পরিবর্তনের অনুরোধ অনুমোদিত হয়নি${adminName ? ` (${escapeHtml(adminName)})` : ''}।</p>
            ${reason ? `<p style="margin:0;"><strong>কারণ:</strong> ${escapeHtml(reason)}</p>` : ''}
        `
    })

    return sendEmail({
        to: email,
        subject: 'প্রোফাইল এডিট অনুরোধ আপডেট - TitasDU',
        html,
        category: 'profileEdit'
    })
}

/** Sent when a student completes registration */
export async function sendRegistrationEmail(email: string, name: string, password: string) {
    const siteUrl = process.env.NEXTAUTH_URL || ''
    const loginLink = `${siteUrl}/en/login`

    const html = renderEmailLayout({
        title: `স্বাগতম, ${escapeHtml(name)}!`,
        intro: 'আপনার রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।',
        badge: 'REGISTRATION',
        contentHtml: `
            <p style="margin:0 0 10px;">আপনার অ্যাকাউন্টের তথ্য:</p>
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
                <p style="margin:4px 0;"><strong>ইমেইল:</strong> ${escapeHtml(email)}</p>
                <p style="margin:4px 0;"><strong>পাসওয়ার্ড:</strong> <span style="font-family:monospace;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${escapeHtml(password)}</span></p>
            </div>
            <p style="margin:0 0 12px;color:#64748b;font-size:13px;">⚠️ প্রথম লগইনের পর পাসওয়ার্ড পরিবর্তন করার পরামর্শ দেওয়া হচ্ছে।</p>
            <a href="${escapeHtml(loginLink)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">লগইন করুন</a>
        `
    })

    return sendEmail({ to: email, subject: 'নিবন্ধন সফল - TitasDU অ্যাকাউন্ট তথ্য', html, category: 'registrationStatus' })
}

/** Sent for password reset */
export async function sendPasswordResetEmail(email: string, token: string, force = false) {
    if (!force && !(await isNotificationEnabled('passwordReset'))) return { sent: false, reason: 'disabled' }
    const siteUrl = process.env.NEXTAUTH_URL || ''
    const resetLink = `${siteUrl}/en/student/reset-password?token=${token}`

    const html = renderEmailLayout({
        title: 'Password Reset Request',
        intro: 'আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার অনুরোধ পাওয়া গেছে।',
        badge: 'SECURITY',
        contentHtml: `
            <p style="margin:0 0 12px;">নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন:</p>
            <a href="${escapeHtml(resetLink)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">পাসওয়ার্ড রিসেট করুন</a>
            <p style="margin:12px 0 0;color:#64748b;font-size:13px;">এই লিংকটি ১ ঘণ্টার মধ্যে মেয়াদ শেষ হবে।</p>
        `
    })

    return sendEmail({ to: email, subject: 'পাসওয়ার্ড রিসেট - TitasDU', html, category: 'passwordReset' })
}

/** Sent for OTP password reset */
export async function sendPasswordResetOtpEmail(email: string, otp: string, force = false) {
    if (!force && !(await isNotificationEnabled('passwordReset'))) return { sent: false, reason: 'disabled' }

    const html = renderEmailLayout({
        title: 'Password Reset OTP',
        intro: 'আপনার পাসওয়ার্ড রিসেট করার এককালীন কোড:',
        badge: 'SECURITY',
        contentHtml: `
            <div style="display:inline-block;padding:10px 20px;background:#0f172a;color:#ffffff;border-radius:10px;letter-spacing:8px;font-size:28px;font-weight:700;">${escapeHtml(otp)}</div>
            <p style="margin:12px 0 0;color:#475569;">এই OTP আগামী ১০ মিনিটের জন্য কার্যকর থাকবে।</p>
        `
    })

    return sendEmail({ to: email, subject: 'Password Reset OTP - TitasDU', html, category: 'passwordReset' })
}

/** Login alert when new device logs in */
export async function sendStudentLoginAlert(
    student: { email?: string | null; name_bn?: string | null; name_en?: string | null },
    meta: { ipAddress?: string; userAgent?: string } = {},
    force = false
) {
    if (!student?.email) return { sent: false }
    if (!force && !(await isNotificationEnabled('loginAlerts'))) return { sent: false, reason: 'disabled' }

    const name = getDisplayName(student)
    const time = new Date().toLocaleString('en-GB')
    const ip = meta.ipAddress || 'Unknown'
    const ua = meta.userAgent || 'Unknown device'

    const html = renderEmailLayout({
        title: 'Login Alert',
        intro: `প্রিয় ${name}, আপনার অ্যাকাউন্টে নতুন লগইন শনাক্ত হয়েছে।`,
        badge: 'ACCOUNT ALERT',
        contentHtml: `
            <p style="margin:0 0 8px;"><strong>সময়:</strong> ${escapeHtml(time)}</p>
            <p style="margin:0 0 8px;"><strong>IP:</strong> ${escapeHtml(ip)}</p>
            <p style="margin:0;"><strong>Device:</strong> ${escapeHtml(ua)}</p>
            <p style="margin:12px 0 0;color:#b91c1c;">এটি আপনি না হলে দ্রুত পাসওয়ার্ড পরিবর্তন করুন।</p>
        `
    })

    return sendEmail({ to: student.email, subject: 'নতুন লগইন এলার্ট - TitasDU', html, category: 'loginAlerts' })
}

/** Bulk notify all approved students about a new notice */
export async function notifyStudentsAboutNewNotice(notice: { text: string; link?: string | null }) {
    if (!(await isNotificationEnabled('noticePublished'))) {
        return { sentCount: 0, total: 0, disabled: true }
    }

    const students = await prisma.students.findMany({
        where: { approval: 1, email: { not: null } },
        select: { email: true, name_bn: true, name_en: true }
    })

    const recipients = students.filter(s => s.email)
    let sentCount = 0

    for (const student of recipients) {
        const html = renderEmailLayout({
            title: 'নতুন নোটিশ প্রকাশিত হয়েছে',
            intro: 'আপনার জন্য নতুন নোটিশ আপডেট:',
            badge: 'NOTICE BOARD',
            contentHtml: `
                <p style="margin:0 0 10px;font-weight:600;">${escapeHtml(notice.text)}</p>
                ${notice.link ? `<a href="${escapeHtml(notice.link)}" target="_blank" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-size:14px;font-weight:600;">বিস্তারিত দেখুন</a>` : ''}
            `
        })
        const result = await sendEmail({ to: student.email!, subject: 'নতুন নোটিশ প্রকাশিত - TitasDU', html, category: 'noticePublished' })
        if (result.sent) sentCount++
    }

    return { sentCount, total: recipients.length }
}

/** Bulk remind all approved students about an upcoming event */
export async function notifyStudentsEventReminder(event: { title: string; date: Date; location: string; link?: string | null }) {
    if (!(await isNotificationEnabled('eventReminders'))) {
        return { sentCount: 0, total: 0, disabled: true }
    }

    const students = await prisma.students.findMany({
        where: { approval: 1, email: { not: null } },
        select: { email: true, name_bn: true, name_en: true }
    })

    const recipients = students.filter(s => s.email)
    const dateText = new Date(event.date).toLocaleString('en-GB')
    let sentCount = 0

    for (const student of recipients) {
        const html = renderEmailLayout({
            title: 'ইভেন্ট রিমাইন্ডার',
            intro: 'আপনার অংশগ্রহণের জন্য আসন্ন ইভেন্টের তথ্য:',
            badge: 'EVENT REMINDER',
            contentHtml: `
                <p style="margin:0 0 8px;"><strong>ইভেন্ট:</strong> ${escapeHtml(event.title)}</p>
                <p style="margin:0 0 8px;"><strong>তারিখ:</strong> ${escapeHtml(dateText)}</p>
                <p style="margin:0;"><strong>স্থান:</strong> ${escapeHtml(event.location)}</p>
                ${event.link ? `<div style="margin-top:12px;"><a href="${escapeHtml(event.link)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:600;">ইভেন্ট লিংক</a></div>` : ''}
            `
        })
        const result = await sendEmail({ to: student.email!, subject: `ইভেন্ট রিমাইন্ডার: ${event.title} - TitasDU`, html, category: 'eventReminders' })
        if (result.sent) sentCount++
    }

    return { sentCount, total: recipients.length }
}

/** Send a test email for a specific notification category */
export async function sendNotificationTestEmail(type: string, recipientEmail: string) {
    const mockStudent = { email: recipientEmail, name_bn: 'টেস্ট শিক্ষার্থী', name_en: 'Test Student' }

    switch (type) {
        case 'registrationStatus':
            return notifyStudentRegistrationStatus(mockStudent, 'approved', true)
        case 'profileEdit':
            return sendEditApprovedEmail(recipientEmail, 'Test Student', 'Admin', true)
        case 'noticePublished': {
            const html = renderEmailLayout({
                title: 'নতুন নোটিশ প্রকাশিত হয়েছে',
                intro: 'আপনার জন্য নতুন নোটিশ আপডেট:',
                badge: 'NOTICE BOARD',
                contentHtml: '<p style="margin:0;font-weight:600;">এটি একটি টেস্ট নোটিশ। নতুন নোটিশ ইমেইল টেমপ্লেট যাচাই করার জন্য পাঠানো হয়েছে।</p>'
            })
            return sendEmail({ to: recipientEmail, subject: 'নতুন নোটিশ প্রকাশিত - TitasDU [TEST]', html, category: 'noticePublished' })
        }
        case 'eventReminders':
            return notifyStudentsEventReminder({
                title: 'বার্ষিক পুনর্মিলনী [TEST]',
                date: new Date(Date.now() + 48 * 3600 * 1000),
                location: 'ঢাকা বিশ্ববিদ্যালয় ক্যাম্পাস',
                link: null
            }).then(r => ({ sent: r.sentCount > 0, ...r }))
        case 'passwordReset':
            return sendPasswordResetOtpEmail(recipientEmail, '123456', true)
        case 'loginAlerts':
            return sendStudentLoginAlert(mockStudent, { ipAddress: '203.0.113.15', userAgent: 'Chrome on macOS' }, true)
        default:
            return { sent: false, reason: 'invalid-type' }
    }
}
