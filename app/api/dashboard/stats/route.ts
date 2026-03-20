import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        // Get date ranges
        const now = new Date()
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Parallel queries for better performance
        const [
            totalStudents,
            approvedStudents,
            pendingStudents,
            rejectedStudents,
            pendingEdits,
            recentActivity,
            smsThisMonth,
            activeSessions,
            departmentStats,
            sessionStats,
            genderStats,
            bloodGroupStats,
            hallStats,
            upazilaStats,
            last7DaysRegistrations,
            todaysRegistrationsCount
        ] = await Promise.all([
            // Student counts
            prisma.students.count(),
            prisma.students.count({ where: { approval: 1 } }),
            prisma.students.count({ where: { approval: 0 } }),
            prisma.students.count({ where: { approval: 2 } }),

            // Pending edits
            prisma.student_edits.count({ where: { status: 'pending' } }),

            // Recent activity (last 24h)
            prisma.admin_activity_logs.count({
                where: { createdAt: { gte: last24h } }
            }),

            // SMS this month
            prisma.sms_logs.count({
                where: {
                    sentAt: { gte: thisMonth },
                    status: { in: ['sent', 'delivered'] }
                }
            }),

            // Active sessions
            prisma.sessions.count({ where: { isActive: true } }),

            // Department distribution
            prisma.students.groupBy({
                by: ['department'],
                _count: { id: true },
                where: { approval: 1 }
            }),

            // Session distribution
            prisma.students.groupBy({
                by: ['student_session'],
                _count: { id: true },
                where: { approval: 1 }
            }),

            // Gender distribution
            prisma.students.groupBy({
                by: ['gender'],
                _count: { id: true },
                where: { approval: 1 }
            }),

            // Blood group distribution
            prisma.students.groupBy({
                by: ['blood_group'],
                _count: { id: true },
                where: { approval: 1 }
            }),

            // Hall distribution
            prisma.students.groupBy({
                by: ['hall'],
                _count: { id: true },
                where: { approval: 1 }
            }),

            // Upazila distribution
            prisma.students.groupBy({
                by: ['upazila'],
                _count: { id: true },
                where: { approval: 1 }
            }),

            // Last 7 days registrations
            prisma.students.groupBy({
                by: ['createdAt'],
                _count: { id: true },
                where: {
                    createdAt: { gte: last7days }
                }
            }),

            // Today's registrations
            prisma.students.count({
                where: {
                    createdAt: { gte: last24h }
                }
            })
        ])

        // Calculate rates
        const approvalRate = totalStudents > 0
            ? Math.round((approvedStudents / totalStudents) * 100)
            : 0
        const rejectionRate = totalStudents > 0
            ? Math.round((rejectedStudents / totalStudents) * 100)
            : 0

        // Format department stats
        const departments = departmentStats.map(d => ({
            name: d.department || 'Unknown',
            count: d._count.id
        })).sort((a, b) => b.count - a.count)

        // Format session stats
        const sessions = sessionStats.map(s => ({
            name: s.student_session || 'Unknown',
            count: s._count.id
        })).sort((a, b) => b.count - a.count)

        // Format demographics
        const gender = genderStats.map(g => ({
            name: g.gender || 'Unknown',
            count: g._count.id
        }))

        const bloodGroups = bloodGroupStats.map(b => ({
            name: b.blood_group || 'Unknown',
            count: b._count.id
        }))

        const halls = hallStats.map(h => ({
            name: h.hall || 'Unknown',
            count: h._count.id
        })).sort((a, b) => b.count - a.count)

        const upazilas = upazilaStats.map(u => ({
            name: u.upazila || 'Unknown',
            count: u._count.id
        })).sort((a, b) => b.count - a.count)

        // Format 7-day trend (group by day)
        const dailyRegistrations = new Map<string, number>()
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const dateKey = date.toISOString().split('T')[0]
            dailyRegistrations.set(dateKey, 0)
        }

        last7DaysRegistrations.forEach(reg => {
            const dateKey = new Date(reg.createdAt).toISOString().split('T')[0]
            if (dailyRegistrations.has(dateKey)) {
                dailyRegistrations.set(dateKey, (dailyRegistrations.get(dateKey) || 0) + reg._count.id)
            }
        })

        const registrationTrend = Array.from(dailyRegistrations.entries()).map(([date, count]) => ({
            date,
            count
        }))

        return NextResponse.json({
            students: {
                total: totalStudents,
                approved: approvedStudents,
                pending: pendingStudents,
                rejected: rejectedStudents,
                todaysRegistrations: todaysRegistrationsCount,
                approvalRate,
                rejectionRate
            },
            activity: {
                pendingEdits,
                recentActivity,
                smsThisMonth,
                activeSessions
            },
            distribution: {
                departments,
                sessions,
                gender,
                bloodGroups,
                halls,
                upazilas
            },
            trends: {
                registrations: registrationTrend
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache'
            }
        })
    } catch (error) {
        console.error('Dashboard stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        )
    }
}
