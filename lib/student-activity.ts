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
        let location = "Unknown";
        
        // Attempt to resolve location from IP if provided and not localhost
        if (params.ipAddress && params.ipAddress !== '127.0.0.1' && params.ipAddress !== '::1') {
            try {
                // Use a free, fast geolocation API (ip-api.com)
                // We use a timeout to ensure it doesn't hang the request
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
                
                const response = await fetch(`http://ip-api.com/json/${params.ipAddress}?fields=status,country,city`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success') {
                        location = `${data.city}, ${data.country}`;
                    }
                }
            } catch (geoError) {
                console.warn('Geolocation resolution failed:', geoError);
                location = "Unknown (Resolution Failed)";
            }
        } else if (params.ipAddress === '127.0.0.1' || params.ipAddress === '::1') {
            location = "Localhost";
        }

        await prisma.student_activity_logs.create({
            data: {
                studentId: params.studentId,
                action: params.action,
                description: params.description || null,
                metadata: params.metadata ? JSON.stringify(params.metadata) : null,
                ipAddress: params.ipAddress || null,
                location: location,
                userAgent: params.userAgent || null,
            }
        });
    } catch (error) {
        console.error('Failed to log student activity:', error);
    }
}
