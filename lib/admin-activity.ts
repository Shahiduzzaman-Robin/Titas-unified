import { prisma } from './prisma'

export type AdminAction =
    | 'approve_registration'
    | 'reject_registration'
    | 'approve_edit'
    | 'reject_edit'
    | 'delete_student'
    | 'update_student'
    | 'create_option'
    | 'update_option'
    | 'delete_option'
    | 'send_bulk_sms'
    | 'export_data'
    | 'create_post'
    | 'update_post'
    | 'delete_post'
    | 'create_category'
    | 'update_category'
    | 'delete_category'
    | 'create_tag'
    | 'update_tag'
    | 'delete_tag'
    | 'upload_gallery_image'
    | 'delete_gallery_image'
    | 'create_notice'
    | 'update_notice'
    | 'delete_notice'
    | 'create_event'
    | 'update_event'
    | 'delete_event'
    | 'update_comment'
    | 'delete_comment'
    | 'admin_login'
    | 'admin_logout'
    | 'other'

interface LogActivityParams {
    adminId: number | null // null for static/system admin
    studentId?: number | null
    action: AdminAction
    description?: string
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
}

/**
 * Log an admin activity to the database
 */
export async function logAdminActivity(params: LogActivityParams) {
    try {
        await prisma.admin_activity_logs.create({
            data: {
                adminId: params.adminId,
                studentId: params.studentId || null,
                action: params.action,
                description: params.description || null,
                metadata: params.metadata ? JSON.stringify(params.metadata) : null,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
            }
        })
    } catch (error) {
        console.error('Failed to log admin activity:', error)
        // Don't throw - logging should not break the main flow
    }
}

/**
 * Get admin ID from session, handling both database and static admins
 */
export function getAdminIdFromSession(session: any): number | null {
    if (!session?.user?.id) return null
    // Database admins have numeric IDs
    return parseInt(session.user.id) || null
}

/**
 * Extract IP address from request
 */
export function getIpAddress(request: Request): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    return realIp || undefined
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: Request): string | undefined {
    return request.headers.get('user-agent') || undefined
}
