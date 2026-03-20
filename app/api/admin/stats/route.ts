import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Run all queries in parallel
        const [
            total,
            approved,
            pending,
            rejected,
            todayCount,
            monthlyCount,
            lastMonthCount,
            males,
            females,
            bloodGroupRaw,
            upazilaRaw,
            hallRaw,
            departmentRaw,
            trendRaw,
            // Blog stats
            blogTotal,
            blogPublished,
            blogDraft,
            blogViews,
            blogComments,
            // Events
            eventsTotal,
            eventsUpcoming,
            eventsPast,
            // Gallery
            galleryTotal,
            // Notices
            noticesTotal,
            noticesActive,
            noticesUrgent,
            // Messages
            messagesTotal,
            messagesUnread,
            messagesReplied,
            // Pending edits
            pendingEdits,
            // Audit logs
            recentActivityLogs,
            last24hLogs,
        ] = await Promise.all([
            prisma.students.count(),
            prisma.students.count({ where: { approval: 1 } }),
            prisma.students.count({ where: { approval: 0 } }),
            prisma.students.count({ where: { approval: 2 } }),
            prisma.students.count({ where: { createdAt: { gte: startOfToday } } }),
            prisma.students.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.students.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
            prisma.students.count({ where: { gender: { in: ['Male', 'male', 'পুরুষ'] } } }),
            prisma.students.count({ where: { gender: { in: ['Female', 'female', 'মহিলা', 'নারী'] } } }),
            prisma.students.groupBy({ by: ['blood_group'], _count: { blood_group: true }, where: { blood_group: { not: null }, approval: 1 }, orderBy: { _count: { blood_group: 'desc' } } }),
            prisma.students.groupBy({ by: ['upazila'], _count: { upazila: true }, where: { upazila: { not: null }, approval: 1 }, orderBy: { _count: { upazila: 'desc' } }, take: 10 }),
            prisma.students.groupBy({ by: ['hall'], _count: { hall: true }, where: { hall: { not: null }, approval: 1 }, orderBy: { _count: { hall: 'desc' } }, take: 10 }),
            prisma.students.groupBy({ by: ['department'], _count: { department: true }, where: { department: { not: null }, approval: 1 }, orderBy: { _count: { department: 'desc' } }, take: 10 }),
            // Daily registrations - last 7 days
            prisma.$queryRaw`SELECT DATE(createdAt) as day, COUNT(*) as count FROM students WHERE createdAt >= ${sevenDaysAgo} GROUP BY DATE(createdAt) ORDER BY day ASC`,
            // Blog
            prisma.blog_posts.count(),
            prisma.blog_posts.count({ where: { status: 'published' } }),
            prisma.blog_posts.count({ where: { status: 'draft' } }),
            prisma.blog_posts.aggregate({ _sum: { views: true } }),
            prisma.blog_comments.count(),
            // Events
            prisma.events.count(),
            prisma.events.count({ where: { date: { gte: now } } }),
            prisma.events.count({ where: { date: { lt: now } } }),
            // Gallery
            prisma.gallery_images.count(),
            // Notices
            prisma.notices.count(),
            prisma.notices.count({ where: { isActive: true } }),
            prisma.notices.count({ where: { priority: 'urgent', isActive: true } }),
            // Messages
            prisma.contact_messages.count(),
            prisma.contact_messages.count({ where: { status: 'unread' } }),
            prisma.contact_messages.count({ where: { status: 'replied' } }),
            // Pending edits
            prisma.student_edits.count({ where: { status: 'pending' } }),
            // Audit
            prisma.admin_activity_logs.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { admin: { select: { name: true, email: true } } } }),
            prisma.admin_activity_logs.count({ where: { createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } }),
        ])

        const approvalRate = total ? Math.round((approved / total) * 100) : 0

        // Build 7-day trend labels
        const trendMap = new Map<string, number>()
        ;(trendRaw as any[]).forEach(row => {
            const dateStr = new Date(row.day).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })
            trendMap.set(dateStr, Number(row.count))
        })
        const trend = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now)
            d.setDate(d.getDate() - (6 - i))
            const label = d.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })
            return { label, count: trendMap.get(label) || 0 }
        })

        return NextResponse.json({
            total,
            approved,
            pending,
            rejected,
            todayCount,
            monthlyCount,
            lastMonthCount,
            approvalRate,
            males,
            females,
            bloodGroups: bloodGroupRaw.map(b => ({ _id: b.blood_group, count: b._count.blood_group })),
            upazilas: upazilaRaw.map(u => ({ _id: u.upazila, count: u._count.upazila })),
            halls: hallRaw.map(h => ({ _id: h.hall, count: h._count.hall })),
            departments: departmentRaw.map(d => ({ _id: d.department, count: d._count.department })),
            trend,
            blog: {
                total: blogTotal,
                published: blogPublished,
                draft: blogDraft,
                totalViews: blogViews._sum.views || 0,
                totalComments: blogComments
            },
            events: {
                total: eventsTotal,
                upcoming: eventsUpcoming,
                past: eventsPast
            },
            gallery: { total: galleryTotal },
            notices: { total: noticesTotal, active: noticesActive, urgent: noticesUrgent },
            messages: { total: messagesTotal, unread: messagesUnread, replied: messagesReplied },
            profileEdits: { total: pendingEdits, pending: pendingEdits },
            audit: {
                recentActivity: recentActivityLogs.map(log => ({
                    ...log,
                    adminUsername: log.admin?.name || 'System',
                    description: log.description || `${log.action}`
                })),
                last24h: last24hLogs
            }
        })
    } catch (error) {
        console.error('Stats error:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
