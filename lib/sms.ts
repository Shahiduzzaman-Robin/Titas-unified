import { prisma } from "./prisma"

const DEFAULT_SMS_API_URL = 'https://api.smsinbd.com/sms-api'

interface SMSResponse {
    status: string
    message: string
    smsid?: string
    SmsCount?: number
    success?: number // For bulk/campaign response
}

interface BalanceResponse {
    status: string
    mask: number
    nonmask: number
    voice: number
    message?: string
}

export class SMSService {
    /**
     * Send SMS to multiple numbers
     */
    static async sendBulkSMS(numbers: string[], message: string) {
        if (!numbers.length) return { success: false, message: 'No recipients' }
        const phone = numbers.join(',')
        return this.sendSMS(phone, message)
    }

    /**
     * Send SMS to a single number
     */
    static async sendSMS(phone: string, message: string, studentId?: number, studentName?: string) {
        const SMS_API_TOKEN = process.env.SMS_API_TOKEN
        const SMS_SENDER_ID = process.env.SMS_SENDER_ID
        const SMS_API_URL = process.env.SMS_API_URL || DEFAULT_SMS_API_URL

        if (!SMS_API_TOKEN || !SMS_SENDER_ID) {
            console.error('SMS credentials not configured')
            return { success: false, message: 'SMS credentials not configured' }
        }

        try {
            // URL Encode parameters
            const params = new URLSearchParams({
                api_token: SMS_API_TOKEN,
                senderid: SMS_SENDER_ID,
                message: message,
                contact_number: phone
            })

            const response = await fetch(`${SMS_API_URL}/sendsms?${params.toString()}`)

            // Check if response is JSON
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('SMS API Error: Invalid response format (expected JSON, got HTML/text)')
                return { success: false, message: 'SMS API is currently unavailable' }
            }

            const data: SMSResponse = await response.json()

            // Store log in database
            try {
                // Determine status
                const logStatus = data.status === 'success' ? 'sent' : 'failed'
                const smsId = data.smsid || null

                // If it's a single phone number (not comma separated list)
                if (phone && !phone.includes(',')) {
                    await prisma.sms_logs.create({
                        data: {
                            studentId: studentId || null,
                            phone,
                            message,
                            smsId: smsId,
                            status: logStatus
                        }
                    })
                } else if (phone && phone.includes(',')) {
                    // It's a bulk/list of numbers, log each one
                    const numbers = phone.split(',')
                    await prisma.sms_logs.createMany({
                        data: numbers.map(num => ({
                            phone: num.trim().substring(0, 15),
                            message,
                            smsId: smsId,
                            status: logStatus,
                            studentId: null // We don't easily map in bulk unless passed
                        })),
                        skipDuplicates: true
                    })
                }
            } catch (logError) {
                console.error('Failed to log SMS:', logError)
            }

            if (data.status === 'success') {
                const sentCount = data.success || data.SmsCount || 1
                return { success: true, message: data.message, smsId: data.smsid, sent: sentCount }
            } else {
                console.error(`SMS Send Failed: ${data.message}`, { 
                    senderId: SMS_SENDER_ID, 
                    phone,
                    status: data.status
                })
                return { success: false, message: data.message }
            }
        } catch (error) {
            // Only log the error type, not the full stack trace
            if (error instanceof Error) {
                console.error('SMS API Error:', error.message)
            } else {
                console.error('SMS API Error: Unknown error')
            }
            return { success: false, message: 'SMS API is currently unavailable' }
        }
    }

    /**
     * Check SMS Balance
     */
    static async checkBalance() {
        const SMS_API_TOKEN = process.env.SMS_API_TOKEN
        const SMS_API_URL = process.env.SMS_API_URL || DEFAULT_SMS_API_URL

        if (!SMS_API_TOKEN) {
            return { success: false, message: 'API Token not configured' }
        }

        try {
            const params = new URLSearchParams({
                api_token: SMS_API_TOKEN
            })

            const response = await fetch(`${SMS_API_URL}/balance?${params.toString()}`)
            const data: BalanceResponse = await response.json()

            if (data.status === 'success') {
                return {
                    success: true,
                    data: {
                        mask: data.mask || 0,
                        nonmask: data.nonmask || 0,
                        voice: data.voice || 0
                    }
                }
            } else {
                console.error(`SMS Balance Check Failed: ${data.message}`, { status: data.status })
                return { success: false, message: data.message || 'Failed to fetch balance' }
            }
        } catch (error) {
            console.error('Balance Check Error:', error)
            return { success: false, message: 'Connection error' }
        }
    }

    /**
     * Get Delivery Status
     */
    static async checkDeliveryStatus(smsId: string) {
        const SMS_API_TOKEN = process.env.SMS_API_TOKEN
        const SMS_API_URL = process.env.SMS_API_URL || DEFAULT_SMS_API_URL

        if (!SMS_API_TOKEN) {
            return { success: false, message: 'API Token not configured' }
        }

        try {
            const params = new URLSearchParams({
                api_token: SMS_API_TOKEN,
                smsId: smsId
            })

            const response = await fetch(`${SMS_API_URL}/delivery-report?${params.toString()}`)
            const data = await response.json()

            return data
        } catch (error) {
            console.error('Delivery Check Error:', error)
            return { success: false, message: 'Connection error' }
        }
    }

    /**
     * Get Template Message
     */
    static async getTemplate(type: 'approval' | 'rejection', replacements: Record<string, string>) {
        const template = await prisma.sms_templates.findUnique({
            where: { type }
        })

        if (!template || !template.isActive) return null

        let message = template.template

        // Replace variables like {name}, {id}
        Object.entries(replacements).forEach(([key, value]) => {
            message = message.replace(new RegExp(`{${key}}`, 'g'), value || '')
        })

        return message
    }
}
