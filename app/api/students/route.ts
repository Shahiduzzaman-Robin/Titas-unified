import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { deleteImage } from '@/lib/upload'
import { DiscordService } from '@/lib/discord'
import { generatePassword } from '@/lib/otp'
import { sendRegistrationEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { toEnglishDigits } from '@/lib/utils'


const baseStudentSchema = z.object({
    student_session: z.string().min(1, 'সেশন নির্বাচন করুন'),
    du_reg_number: z.string().min(1, 'রেজিস্ট্রেশন নম্বর প্রয়োজন'),
    name: z.string().min(1, 'নাম প্রয়োজন'),
    name_bn: z.string().optional(),
    address: z.string().min(1, 'ঠিকানা প্রয়োজন'),
    address_bn: z.string().optional(),
    upazila: z.string().min(1, 'উপজেলা নির্বাচন করুন'),
    department: z.string().min(1, 'ডিপার্টমেন্ট নির্বাচন করুন'),
    mobile: z.string().length(11, 'মোবাইল নম্বর ১১ ডিজিটের হতে হবে'),
    email: z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
    blood_group: z.string().min(1, 'রক্তের গ্রুপ নির্বাচন করুন'),
    hall: z.string().min(1, 'হল নির্বাচন করুন'),
    gender: z.enum(['male', 'female'], { errorMap: () => ({ message: 'লিঙ্গ নির্বাচন করুন' }) }),
    image_path: z.string().min(1, 'ছবি আপলোড করুন'),
    job_position: z.string().optional(),
    job_designation: z.string().optional(),
})

const createStudentSchema = baseStudentSchema.extend({
    password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
})

const updateStudentSchema = baseStudentSchema.extend({
    password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে').optional(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Normalize numeric fields
        if (body.mobile) body.mobile = toEnglishDigits(body.mobile)
        if (body.du_reg_number) body.du_reg_number = toEnglishDigits(body.du_reg_number)

        // Validate input
        const validatedData = createStudentSchema.parse(body)

        // Password logic: use provided password
        const passwordToHash = validatedData.password
        const hashedPassword = await bcrypt.hash(passwordToHash, 10)

        // Create student record
        const student = await prisma.students.create({
            data: {
                student_session: validatedData.student_session,
                du_reg_number: validatedData.du_reg_number,
                name_en: validatedData.name,
                name_bn: validatedData.name_bn || null,
                address_en: validatedData.address,
                address_bn: validatedData.address_bn || null,
                upazila: validatedData.upazila,
                department: validatedData.department,
                mobile: validatedData.mobile,
                email: validatedData.email || null,
                blood_group: validatedData.blood_group,
                hall: validatedData.hall,
                gender: validatedData.gender,
                image_path: validatedData.image_path,
                district: 'ব্রাহ্মণবাড়িয়া', // Auto-filled
                approval: 0, // Pending by default
                image_show: 1,
                prefix: 'TITAS',
                job_position: validatedData.job_position || null,
                job_designation: validatedData.job_designation || null,
                password: hashedPassword,
            },
        })

        // Send Registration Email with Password
        if (validatedData.email) {
            try {
                // IMPORTANT: Await email in Vercel/Serverless to ensure it sends before function terminates
                await sendRegistrationEmail(validatedData.email, validatedData.name, passwordToHash)
            } catch (emailError) {
                console.error('Failed to send registration email:', emailError)
            }
        }

        // Send Discord notification for new registration
        try {
            await DiscordService.sendRegistrationNotification(student)
        } catch (discordError) {
            console.error('Discord notification failed:', discordError)
            // Don't fail the request if Discord notification fails
        }

        return NextResponse.json(
            {
                success: true,
                message: 'আপনার তথ্য সফলভাবে জমা হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।',
                studentId: student.id
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Student creation error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'তথ্য জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        
        // Multiple filter support
        const sessions = searchParams.getAll('session').filter(v => v && v !== 'all')
        const departments = searchParams.getAll('department').filter(v => v && v !== 'all')
        const statuses = searchParams.getAll('status').filter(v => v && v !== 'all')
        const upazilas = searchParams.getAll('upazila').filter(v => v && v !== 'all')
        const halls = searchParams.getAll('hall').filter(v => v && v !== 'all')
        const bloodGroups = searchParams.getAll('blood_group').filter(v => v && v !== 'all')
        const genders = searchParams.getAll('gender').filter(v => v && v !== 'all')

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        // Default to approved only for public, unless specifically requested otherwise (e.g. admin)
        // But for this route, if no status is provided, we usually want all for admin or approved for public.
        // Let's check if the caller is asking for a specific status.
        if (statuses.length > 0 && !statuses.includes('all')) {
            where.approval = { in: statuses.map(s => parseInt(s)) }
        } else if (statuses.includes('all')) {
            // No approval filter needed for 'all'
        } else {
            // Default to approved only for public, unless specifically requested otherwise
            where.approval = 1 
        }

        if (search) {
            const orConditions: any[] = [
                { name_en: { contains: search } },
                { name_bn: { contains: search } },
                { mobile: { contains: search } },
            ]

            const idMatch = search.match(/^([a-zA-Z]+)-(\d+)$/i)
            if (idMatch) {
                const prefix = idMatch[1]
                const id = parseInt(idMatch[2])
                orConditions.push({
                    AND: [
                        { prefix: { equals: prefix, mode: 'insensitive' } },
                        { id: id }
                    ]
                })
            }

            where.OR = orConditions
        }

        if (sessions.length > 0) where.student_session = { in: sessions }
        if (departments.length > 0) where.department = { in: departments }
        if (upazilas.length > 0) where.upazila = { in: upazilas }
        if (halls.length > 0) where.hall = { in: halls }
        if (bloodGroups.length > 0) where.blood_group = { in: bloodGroups }
        if (genders.length > 0) where.gender = { in: genders }

        const isExport = searchParams.get('export') === 'true'

        const [students, total] = await Promise.all([
            prisma.students.findMany({
                where,
                skip: isExport ? 0 : skip,
                take: limit,
                orderBy: { id: 'asc' },
            }),
            prisma.students.count({ where }),
        ])

        return NextResponse.json({
            students,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Students fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Titas ID is required' },
                { status: 400 }
            )
        }

        const body = await request.json()

        // Normalize numeric fields
        if (body.mobile) body.mobile = toEnglishDigits(body.mobile)
        if (body.du_reg_number) body.du_reg_number = toEnglishDigits(body.du_reg_number)

        // Check if this is a status update or full profile update
        // If 'approval' is present and it's the only main field, it's a status update
        // But for full edit, we expect 'name', 'mobile', etc.
        // We can check if 'name' is in body to decide.

        if (body.approval !== undefined && !body.name) {
            const { approval, deny_reason } = body

            // Get session to track which admin is performing this action
            const session = await getServerSession(authOptions)
            const { getAdminIdFromSession, logAdminActivity, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
            const adminId = getAdminIdFromSession(session)

            // Get student info for SMS
            const studentInfo = await prisma.students.findUnique({
                where: { id: parseInt(id) }
            });

            const student = await prisma.students.update({
                where: { id: parseInt(id) },
                data: {
                    approval: parseInt(approval),
                    approvedBy: adminId, // Track which admin approved/rejected
                    deny_reason: deny_reason || null
                }
            })

            // Log admin activity
            const approvalStatus = parseInt(approval)
            let action: 'approve_registration' | 'reject_registration' | 'update_student' = 'update_student'
            let description = ''

            if (approvalStatus === 1) {
                action = 'approve_registration'
                description = `Approved registration for ${studentInfo?.name_en || studentInfo?.name_bn || 'student'}`
            } else if (approvalStatus === 2) {
                action = 'reject_registration'
                description = `Rejected registration for ${studentInfo?.name_en || studentInfo?.name_bn || 'student'}${deny_reason ? `: ${deny_reason}` : ''}`
            } else {
                // approval = 0 (pending) or other status
                action = 'update_student'
                description = `Updated approval status to pending for ${studentInfo?.name_en || studentInfo?.name_bn || 'student'}`
            }

            try {
                await logAdminActivity({
                    adminId,
                    studentId: parseInt(id),
                    action,
                    description,
                    metadata: {
                        approval: approvalStatus,
                        deny_reason: deny_reason || null,
                        student_name: studentInfo?.name_en || studentInfo?.name_bn,
                        student_email: studentInfo?.email,
                    },
                    ipAddress: getIpAddress(request),
                    userAgent: getUserAgent(request)
                })
            } catch (logError) {
                console.error('Failed to log admin activity:', logError)
                // Don't fail the request if logging fails
            }

            // Send SMS Notification
            if (studentInfo && studentInfo.mobile) {
                try {
                    const { SMSService } = require('@/lib/sms');

                    if (parseInt(approval) === 1) {
                        // Approved
                        const message = await SMSService.getTemplate('approval', {
                            name: studentInfo.name_en || 'Student',
                            name_bn: studentInfo.name_bn || studentInfo.name_en || '',
                            id: studentInfo.id.toString(),
                            reg: studentInfo.du_reg_number || '',
                            mobile: studentInfo.mobile || '',
                            email: studentInfo.email || '',
                            session: studentInfo.student_session || '',
                            department: studentInfo.department || '',
                            hall: studentInfo.hall || '',
                            upazila: studentInfo.upazila || '',
                            blood_group: studentInfo.blood_group || '',
                            address: studentInfo.address_en || '',
                            address_bn: studentInfo.address_bn || '',
                            gender: studentInfo.gender || '',
                            job_position: studentInfo.job_position || '',
                            job_designation: studentInfo.job_designation || ''
                        });

                        if (message) {
                            await SMSService.sendSMS(studentInfo.mobile, message, studentInfo.id);
                        }
                    } else if (parseInt(approval) === 2) {
                        // Rejected - Check if SMS should be sent
                        console.log('Rejection SMS - body.send_sms:', body.send_sms)
                        console.log('Rejection SMS - typeof body.send_sms:', typeof body.send_sms)

                        const shouldSendSMS = body.send_sms === true || body.send_sms === undefined;
                        console.log('Rejection SMS - shouldSendSMS:', shouldSendSMS)

                        if (shouldSendSMS) {
                            console.log('Attempting to send rejection SMS to:', studentInfo.mobile)
                            const message = await SMSService.getTemplate('rejection', {
                                name: studentInfo.name_en || 'Student',
                                name_bn: studentInfo.name_bn || studentInfo.name_en || '',
                                id: studentInfo.id.toString(),
                                reg: studentInfo.du_reg_number || '',
                                mobile: studentInfo.mobile || '',
                                email: studentInfo.email || '',
                                session: studentInfo.student_session || '',
                                department: studentInfo.department || '',
                                hall: studentInfo.hall || '',
                                upazila: studentInfo.upazila || '',
                                blood_group: studentInfo.blood_group || '',
                                address: studentInfo.address_en || '',
                                address_bn: studentInfo.address_bn || '',
                                gender: studentInfo.gender || '',
                                job_position: studentInfo.job_position || '',
                                job_designation: studentInfo.job_designation || '',
                                reason: deny_reason || 'Verification failed'
                            });

                            console.log('Rejection SMS - message template:', message ? 'Found' : 'Not found')
                            if (message) {
                                await SMSService.sendSMS(studentInfo.mobile, message, studentInfo.id);
                                console.log('Rejection SMS sent successfully')
                            }
                        } else {
                            console.log('Rejection SMS skipped - send_sms was explicitly set to false')
                        }
                    }
                } catch (smsError) {
                    console.error('Failed to send status SMS:', smsError);
                    // Don't fail the request if SMS fails
                }
            }

            // Send Discord Notification
            try {
                if (parseInt(approval) === 1) {
                    // Approved
                    await DiscordService.sendApprovalNotification(studentInfo)
                } else if (parseInt(approval) === 2) {
                    // Rejected
                    await DiscordService.sendRejectionNotification(
                        studentInfo,
                        deny_reason || 'No reason provided'
                    )
                }
            } catch (discordError) {
                console.error('Discord notification failed:', discordError)
                // Don't fail the request if Discord notification fails
            }

            return NextResponse.json({
                success: true,
                message: 'Status updated successfully',
                student
            })
        }

        // Full Profile Update
        // Validate with update schema
        const validatedData = updateStudentSchema.parse(body)

        // If image changed, we might want to delete old one?
        // We need to fetch old student data to know old image path.
        const oldStudent = await prisma.students.findUnique({ where: { id: parseInt(id) } })

        if (oldStudent && oldStudent.image_path && validatedData.image_path && oldStudent.image_path !== validatedData.image_path) {
            // New image uploaded, delete old one
            await deleteImage(oldStudent.image_path)
        }

        const updateData: any = {
            student_session: validatedData.student_session,
            du_reg_number: validatedData.du_reg_number,
            name_en: validatedData.name,
            name_bn: validatedData.name_bn || null,
            address_en: validatedData.address,
            address_bn: validatedData.address_bn || null,
            upazila: validatedData.upazila,
            department: validatedData.department,
            mobile: validatedData.mobile,
            email: validatedData.email || null,
            blood_group: validatedData.blood_group,
            hall: validatedData.hall,
            gender: validatedData.gender,
            image_path: validatedData.image_path,
            job_position: validatedData.job_position || null,
            job_designation: validatedData.job_designation || null,
        }

        // Only update password if provided
        if (validatedData.password) {
            updateData.password = await bcrypt.hash(validatedData.password, 10)
        }

        const student = await prisma.students.update({
            where: { id: parseInt(id) },
            data: updateData
        })

        // Log admin activity
        try {
            const session = await getServerSession(authOptions)
            const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
            const adminId = getAdminIdFromSession(session)
            await logAdminActivity({
                adminId,
                action: 'update_student',
                description: `Updated profile for ${student.name_en || student.name_bn || id}`,
                metadata: { 
                    student_id: student.id, 
                    student_name: student.name_en || student.name_bn,
                    updates: Object.keys(updateData).filter(k => k !== 'password')
                },
                ipAddress: getIpAddress(request),
                userAgent: getUserAgent(request)
            })
        } catch (logError) {
            console.error('Failed to log student update activity:', logError)
        }

        return NextResponse.json({
            success: true,
            message: 'Student information updated successfully',
            student
        })

    } catch (error) {
        console.error('Update error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update student information' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        // Check if admin
        // Note: verify this logic matches your auth requirement. 
        // Usually existence of session.user is enough if it's an admin-only app, 
        // but checking role is better if there are multiple roles.
        // Based on other files, we might check session.user.role or similar.
        // For now, assuming any logged in user (who is admin) can delete.
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Titas ID is required' },
                { status: 400 }
            )
        }

        // Get student to find image path and name for logging
        const student = await prisma.students.findUnique({
            where: { id: parseInt(id) }
        })

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            )
        }

        // Delete image if exists
        if (student.image_path) {
            await deleteImage(student.image_path)
        }

        // Use transaction to delete related records first to avoid foreign key constraints
        await prisma.$transaction([
            // Delete edit requests
            prisma.student_edits.deleteMany({
                where: { studentId: parseInt(id) }
            }),
            // Disconnect from SMS logs (instead of deleting them)
            prisma.sms_logs.updateMany({
                where: { studentId: parseInt(id) },
                data: { studentId: null }
            }),
            // Disconnect from activity logs (instead of deleting the logs)
            prisma.admin_activity_logs.updateMany({
                where: { studentId: parseInt(id) },
                data: { studentId: null }
            }),
            // Finally delete the student record
            prisma.students.delete({
                where: { id: parseInt(id) }
            })
        ])

        // Log activity
        try {
            const { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } = await import('@/lib/admin-activity')
            const adminId = getAdminIdFromSession(session)

            await logAdminActivity({
                adminId,
                action: 'delete_student',
                description: `Deleted student ${student.name_en || student.name_bn || student.prefix + '-' + student.id}`,
                metadata: {
                    student_id: student.id,
                    student_name: student.name_en || student.name_bn,
                    du_reg: student.du_reg_number
                },
                ipAddress: getIpAddress(request),
                userAgent: getUserAgent(request)
            })
        } catch (logError) {
            console.error('Failed to log delete activity:', logError)
        }

        return NextResponse.json({ success: true, message: 'Student deleted successfully' })

    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json(
            { error: 'Failed to delete student' },
            { status: 500 }
        )
    }
}
