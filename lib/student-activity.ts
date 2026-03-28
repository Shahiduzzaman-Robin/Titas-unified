import { prisma } from "./prisma"
import { headers } from "next/headers"
import { DiscordService } from "./discord"

export async function logStudentActivity(
    studentId: number,
    action: "login" | "logout" | "password_change" | "profile_update",
    description: string
) {
    try {
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || 'Unknown'
        const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                         headersList.get('x-real-ip') || 
                         'Unknown'

        // Log to database first
        // @ts-ignore - Prisma type quirk with underscores
        const log = await prisma.student_activity_logs.create({
            data: {
                studentId,
                action,
                description,
                ipAddress,
                userAgent,
                location: 'Resolving...' // Initial placeholder
            }
        })

        // Resolve location and send Discord notification in background
        // Using an immediately-invoked async function (IIFE) to avoid blocking the main thread
        (async () => {
            try {
                let resolvedLocation = 'Unknown'
                if (ipAddress !== 'Unknown' && ipAddress !== '::1' && ipAddress !== '127.0.0.1') {
                    // Quick fetch to ip-api.com
                    const res = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,city,country`, {
                        signal: AbortSignal.timeout(2000) // 2 second timeout
                    })
                    const data = await res.json()
                    if (data.status === 'success') {
                        resolvedLocation = `${data.city}, ${data.country}`
                    }
                }

                // Update database with location
                // @ts-ignore - Prisma type quirk with underscores
                await prisma.student_activity_logs.update({
                    where: { id: log.id },
                    data: { location: resolvedLocation }
                })

                // Send Discord Notification for high-priority security events
                if (action !== 'profile_update') {
                    const student = await prisma.students.findUnique({
                        where: { id: studentId },
                        select: { id: true, name_en: true, department: true, image_path: true }
                    })
                    
                    if (student) {
                        await DiscordService.sendSecurityNotification(student, action as any, {
                            ip: ipAddress,
                            location: resolvedLocation,
                            userAgent
                        })
                    }
                }
            } catch (err) {
                console.error("Async location/discord update failed:", err)
            }
        })()

        return log
    } catch (error) {
        console.error("Failed to log student activity:", error)
        return null
    }
}
