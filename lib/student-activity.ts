import { prisma } from './prisma'

export type StudentAction = 
    | 'login'
    | 'logout'
    | 'password_change'
    | 'profile_update'
    | 'other'

interface LogStudentActivityParams {
    studentId: number
    action: StudentAction
    description?: string
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
}

/**
 * Log a student activity to the database
 */
export async function logStudentActivity(params: LogStudentActivityParams) {
    try {
        await prisma.student_activity_logs.create({
            data: {
                studentId: params.studentId,
                action: params.action,
                description: params.description || null,
                metadata: params.metadata ? JSON.stringify(params.metadata) : null,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
            }
        })
    } catch (error) {
        console.error('Failed to log student activity:', error)
        // Don't throw - logging should not break the main flow
    }
}
