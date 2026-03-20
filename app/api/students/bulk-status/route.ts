import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { SMSService } from '@/lib/sms'
import { DiscordService } from '@/lib/discord'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { ids, status, reason, sendSms } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No student IDs provided' }, { status: 400 })
        }

        const { getAdminIdFromSession, logAdminActivity, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
        const adminId = getAdminIdFromSession(session)

        // Perform bulk update in a transaction
        const updatedStudents = await prisma.$transaction(
            ids.map(id => prisma.students.update({
                where: { id: parseInt(id) },
                data: {
                    approval: status,
                    approvedBy: adminId,
                    deny_reason: reason || null
                }
            }))
        )

        // Log admin activity once for the bulk action
        await logAdminActivity({
            adminId,
            action: status === 1 ? 'approve_registration' : status === 2 ? 'reject_registration' : 'update_student',
            description: `${status === 1 ? 'Bulk Approved' : 'Bulk Rejected'} ${ids.length} students`,
            metadata: {
                studentCount: ids.length,
                studentIds: ids,
                status,
                reason: reason || null
            },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request)
        })

        // Handle Notifications (Background)
        // We'll process them without awaiting to speed up response, 
        // but for serverless/Vercel we might need to await to ensure completion.
        if (sendSms !== false) {
            for (const student of updatedStudents) {
                if (!student.mobile) continue;

                try {
                    const templateType = status === 1 ? 'approval' : status === 2 ? 'rejection' : null;
                    if (templateType) {
                        const message = await SMSService.getTemplate(templateType as any, {
                            name: student.name_en || 'Student',
                            name_bn: student.name_bn || student.name_en || '',
                            id: student.id.toString(),
                            reg: student.du_reg_number || '',
                            mobile: student.mobile || '',
                            reason: reason || 'Application update'
                        });

                        if (message) {
                            await SMSService.sendSMS(student.mobile, message, student.id);
                        }
                    }
                } catch (smsError) {
                    console.error(`Status SMS failed for student ${student.id}:`, smsError);
                }

                // NEW: Email Notification
                try {
                    const { notifyStudentRegistrationStatus } = await import('@/lib/email')
                    await notifyStudentRegistrationStatus(student, status)
                } catch (emailError) {
                    console.error(`Status Email failed for student ${student.id}:`, emailError)
                }
            }
        }

        // Discord Notifications (Bulk Summary)
        try {
            if (status === 1) {
                await DiscordService.sendBulkApprovalNotification(updatedStudents.length, String(adminId));
            }
        } catch (discordError) {
            console.error('Discord bulk notification failed:', discordError);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${updatedStudents.length} students`,
            count: updatedStudents.length
        })

    } catch (error) {
        console.error('Bulk update error:', error)
        return NextResponse.json(
            { error: 'Failed to perform bulk update' },
            { status: 500 }
        )
    }
}
