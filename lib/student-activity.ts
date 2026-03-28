import { prisma } from "./prisma"

const SECURITY_WEBHOOK = process.env.DISCORD_WEBHOOK_SECURITY

export async function logStudentActivity(
    studentId: number,
    action: "login" | "logout" | "password_change" | "profile_update",
    description: string,
    ipAddress?: string,
    userAgent?: string
) {
    try {
        const ip = ipAddress || 'Unknown'
        const ua = userAgent || 'Unknown'

        // Use raw SQL to bypass any Prisma type generation issues
        const result = await prisma.$executeRawUnsafe(
            `INSERT INTO student_activity_logs (studentId, action, description, ipAddress, userAgent, location, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            studentId,
            action,
            description,
            ip,
            ua,
            'Resolving...'
        )

        console.log(`✅ Student activity logged: ${action} for student ${studentId}, rows affected: ${result}`)

        // Get the inserted log ID for location update
        const lastId = await prisma.$queryRawUnsafe<any[]>(
            `SELECT LAST_INSERT_ID() as id`
        )
        const logId = lastId?.[0]?.id

        // AWAIT the location resolve and discord notification to prevent
        // Vercel serverless container from exiting before completion!
        await resolveLocationAndNotify(logId, studentId, action, description, ip, ua)
            .catch(err => console.error("Location/discord failed:", err))

        return { id: logId }
    } catch (error) {
        console.error("❌ Failed to log student activity:", error)
        return null
    }
}

async function resolveLocationAndNotify(
    logId: number | undefined,
    studentId: number,
    action: string,
    description: string,
    ipAddress: string,
    userAgent: string
) {
    try {
        let resolvedLocation = 'Unknown'

        // Resolve IP to location
        if (ipAddress !== 'Unknown' && ipAddress !== '::1' && ipAddress !== '127.0.0.1') {
            try {
                const res = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,city,country`, {
                    signal: AbortSignal.timeout(2000)
                })
                const data = await res.json()
                if (data.status === 'success') {
                    resolvedLocation = `${data.city}, ${data.country}`
                }
            } catch { }
        }

        // Update log with resolved location
        if (logId) {
            await prisma.$executeRawUnsafe(
                `UPDATE student_activity_logs SET location = ? WHERE id = ?`,
                resolvedLocation,
                logId
            )
        }

        const securityWebhook = process.env.DISCORD_WEBHOOK_SECURITY
        
        // Send Discord notification for security events
        if (action !== 'profile_update' && securityWebhook) {
            const student = await prisma.students.findUnique({
                where: { id: studentId },
                select: { id: true, name_en: true, department: true, image_path: true }
            })

            if (student) {
                await sendSecurityDiscord(student, action, {
                    ip: ipAddress,
                    location: resolvedLocation,
                    userAgent
                })
            }
        }
    } catch (err) {
        console.error("Background location/discord error:", err)
    }
}

async function sendSecurityDiscord(
    student: { id: number, name_en: string | null, department: string | null, image_path: string | null },
    action: string,
    details: { ip: string, location: string, userAgent: string }
) {
    const webhookUrls = [
        process.env.DISCORD_WEBHOOK_SECURITY,
        process.env.DISCORD_WEBHOOK_STUDENT_EDIT // Fallback
    ].filter(Boolean)
    
    const webhookUrl = webhookUrls[0]
    if (!webhookUrl) return

    const colorMap: Record<string, number> = {
        login: 0x10B981,      // Emerald
        logout: 0x64748B,     // Slate
        password_change: 0xF59E0B  // Amber
    }

    const iconMap: Record<string, string> = {
        login: '🔐',
        logout: '🚪',
        password_change: '🔑'
    }

    const actionText = action.replace('_', ' ').toUpperCase()

    const embed = {
        title: `${iconMap[action] || '📝'} Student Security Event: ${actionText}`,
        description: `Student **${student.name_en || 'Unknown'}** (TITAS-${student.id}) has performed a security action.`,
        color: colorMap[action] || 0x3B82F6,
        fields: [
            { name: '👤 Student', value: `${student.name_en || 'Unknown'} (TITAS-${student.id})`, inline: true },
            { name: '🏛️ Department', value: student.department || 'N/A', inline: true },
            { name: '📍 IP Address', value: details.ip, inline: true },
            { name: '🌍 Location', value: details.location || 'Unknown', inline: true },
            { name: '🖥️ Device', value: details.userAgent.length > 100 ? details.userAgent.substring(0, 97) + '...' : details.userAgent, inline: false }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'TITAS Security Audit' }
    }

    try {
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        })
        console.log(`✅ Discord security notification sent: ${res.status}`)
    } catch (err) {
        console.error("❌ Discord security notification failed:", err)
    }
}
