import { getStudentImageUrl } from './utils'

interface DiscordEmbed {
    title?: string
    description?: string
    color?: number
    fields?: Array<{
        name: string
        value: string
        inline?: boolean
    }>
    thumbnail?: {
        url: string
    }
    image?: {
        url: string
    }
    timestamp?: string
    footer?: {
        text: string
    }
}

interface DiscordWebhookPayload {
    embeds: DiscordEmbed[]
}

const WEBHOOK_URLS = {
    registration: process.env.DISCORD_WEBHOOK_REGISTRATION,
    approval: process.env.DISCORD_WEBHOOK_APPROVAL,
    rejection: process.env.DISCORD_WEBHOOK_REJECTION,
    studentEdit: process.env.DISCORD_WEBHOOK_STUDENT_EDIT,
    contact: process.env.DISCORD_WEBHOOK_CONTACT,
}

// Discord embed colors
const COLORS = {
    PENDING: 0xFFA500,  // Orange
    APPROVED: 0x00FF00, // Green
    REJECTED: 0xFF0000, // Red
    EDIT_NEW: 0xFFD700,     // Gold - New edit request
    EDIT_APPROVED: 0x00FF00, // Green - Edit approved
    EDIT_REJECTED: 0xFF0000, // Red - Edit rejected
    CONTACT: 0x3B82F6,      // Blue - Contact message
}

export class DiscordService {
    /**
     * Build student info embed fields
     */
    private static buildStudentFields(student: any, includeReason?: string): DiscordEmbed['fields'] {
        // Combine English and Bangla names
        const fullName = student.name_en
            ? (student.name_bn ? `${student.name_en}\n${student.name_bn}` : student.name_en)
            : (student.name_bn || 'N/A')

        // Combine English and Bangla addresses
        const fullAddress = student.address_en
            ? (student.address_bn ? `${student.address_en}\n${student.address_bn}` : student.address_en)
            : (student.address_bn || 'N/A')

        const fields: DiscordEmbed['fields'] = [
            {
                name: '🆔 Titas ID',
                value: `${student.prefix}-${student.id}`,
                inline: true
            },
            {
                name: '📋 DU Reg. Number',
                value: student.du_reg_number || 'N/A',
                inline: true
            },
            {
                name: '\u200B', // Empty field for spacing
                value: '\u200B',
                inline: true
            },
            {
                name: '👤 Name',
                value: fullName,
                inline: false
            },
            {
                name: '📅 Session',
                value: student.student_session || 'N/A',
                inline: true
            },
            {
                name: '🏛️ Department',
                value: student.department || 'N/A',
                inline: true
            },
            {
                name: '🏠 Hall',
                value: student.hall || 'N/A',
                inline: true
            },
            {
                name: '📱 Mobile',
                value: student.mobile || 'N/A',
                inline: true
            },
            {
                name: '📧 Email',
                value: student.email || 'N/A',
                inline: true
            },
            {
                name: '🩸 Blood Group',
                value: student.blood_group || 'N/A',
                inline: true
            },
            {
                name: '⚧️ Gender',
                value: student.gender || 'N/A',
                inline: true
            },
            {
                name: '📍 Upazila',
                value: student.upazila || 'N/A',
                inline: true
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true
            },
            {
                name: '🏢 Job Position',
                value: student.job_position || 'N/A',
                inline: true
            },
            {
                name: '💼 Designation',
                value: student.job_designation || 'N/A',
                inline: true
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true
            },
            {
                name: '📍 Address',
                value: fullAddress,
                inline: true
            },
            {
                name: '🕒 Submitted At',
                value: student.createdAt
                    ? new Date(student.createdAt).toLocaleString('en-US', {
                        timeZone: 'Asia/Dhaka',
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: 'numeric', minute: 'numeric', hour12: true
                    })
                    : 'N/A',
                inline: true
            },
        ]

        // Add rejection reason if provided
        if (includeReason) {
            fields.push({
                name: '❌ Rejection Reason',
                value: includeReason,
                inline: false
            })
        }

        return fields
    }

    /**
     * Send webhook to Discord
     */
    private static async sendWebhook(webhookUrl: string, payload: DiscordWebhookPayload): Promise<boolean> {
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                console.error('Discord webhook failed:', response.status, await response.text())
                return false
            }

            return true
        } catch (error) {
            console.error('Discord webhook error:', error)
            return false
        }
    }

    /**
     * Send registration notification (Pending status)
     */
    static async sendRegistrationNotification(student: any): Promise<boolean> {
        const webhookUrl = WEBHOOK_URLS.registration
        if (!webhookUrl) {
            console.log('Discord registration webhook URL not configured')
            return false
        }

        console.log('Sending Discord registration notification for student:', student.id)

        const imageUrl = getStudentImageUrl(student.image_path)
        console.log('Student image URL:', imageUrl)

        const embed: DiscordEmbed = {
            title: '📝 New Student Registration',
            description: `A new student has registered and is pending approval.`,
            color: COLORS.PENDING,
            fields: this.buildStudentFields(student),
            timestamp: new Date().toISOString(),
            footer: {
                text: 'TITAS System'
            }
        }

        if (imageUrl) {
            embed.thumbnail = { url: imageUrl }
        }

        const result = await this.sendWebhook(webhookUrl, { embeds: [embed] })
        console.log('Discord registration notification result:', result)
        return result
    }

    /**
     * Send approval notification
     */
    static async sendApprovalNotification(student: any): Promise<boolean> {
        const webhookUrl = WEBHOOK_URLS.approval
        if (!webhookUrl) {
            console.log('Discord approval webhook URL not configured')
            return false
        }

        const imageUrl = getStudentImageUrl(student.image_path)

        const embed: DiscordEmbed = {
            title: '✅ Student Approved',
            description: `Student **${student.name_en}** has been approved!`,
            color: COLORS.APPROVED,
            fields: this.buildStudentFields(student),
            timestamp: new Date().toISOString(),
            footer: {
                text: 'TITAS System'
            }
        }

        if (imageUrl) {
            embed.thumbnail = { url: imageUrl }
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] })
    }

    /**
     * Send rejection notification
     */
    static async sendRejectionNotification(student: any, reason: string): Promise<boolean> {
        const webhookUrl = WEBHOOK_URLS.rejection
        if (!webhookUrl) {
            console.log('Discord rejection webhook URL not configured')
            return false
        }

        const imageUrl = getStudentImageUrl(student.image_path)

        const embed: DiscordEmbed = {
            title: '❌ Student Rejected',
            description: `Student **${student.name_en}** has been rejected.`,
            color: COLORS.REJECTED,
            fields: this.buildStudentFields(student, reason),
            timestamp: new Date().toISOString(),
            footer: {
                text: 'TITAS System'
            }
        }

        if (imageUrl) {
            embed.thumbnail = { url: imageUrl }
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] })
    }

    /**
     * Send student edit notification (new edit, approval, or rejection)
     */
    static async sendStudentEditNotification(
        type: 'new' | 'approved' | 'rejected',
        student: any,
        changes: any,
        adminName?: string,
        rejectionReason?: string
    ): Promise<boolean> {
        const webhookUrl = WEBHOOK_URLS.studentEdit
        if (!webhookUrl) {
            console.log('Discord student edit webhook URL not configured')
            return false
        }

        // Field labels for human-readable display
        const fieldLabels: Record<string, string> = {
            name_en: 'Name (English)',
            name_bn: 'Name (Bengali)',
            mobile: 'Mobile',
            email: 'Email',
            address_en: 'Address (English)',
            address_bn: 'Address (Bengali)',
            upazila: 'Upazila',
            department: 'Department',
            student_session: 'Session',
            hall: 'Hall',
            blood_group: 'Blood Group',
            du_reg_number: 'DU Reg. Number',
            institution_name: 'Institution Name',
            designation: 'Designation',
        }

        // Build changed fields list
        const changedFields: string[] = []
        for (const [key, newValue] of Object.entries(changes)) {
            const label = fieldLabels[key] || key
            const oldValue = student[key] || 'N/A'
            changedFields.push(`• **${label}**: ${oldValue} → ${newValue}`)
        }

        // Build embed based on type
        let title: string
        let description: string
        let color: number

        switch (type) {
            case 'new':
                title = '🔔 New Student Profile Edit Request'
                description = `**${student.name_en}** (TITAS-${student.id}) has submitted a profile edit request.`
                color = COLORS.EDIT_NEW
                break
            case 'approved':
                title = '✅ Student Profile Edit Approved'
                description = `**${student.name_en}** (TITAS-${student.id})'s edit request has been approved by **${adminName}**.`
                color = COLORS.EDIT_APPROVED
                break
            case 'rejected':
                title = '❌ Student Profile Edit Rejected'
                description = `**${student.name_en}** (TITAS-${student.id})'s edit request has been rejected by **${adminName}**.`
                color = COLORS.EDIT_REJECTED
                break
        }

        const fields: DiscordEmbed['fields'] = [
            {
                name: '👤 Student',
                value: student.name_en || 'N/A',
                inline: true
            },
            {
                name: '🆔 Titas ID',
                value: `TITAS-${student.id}`,
                inline: true
            },
            {
                name: '🏛️ Department',
                value: student.department || 'N/A',
                inline: true
            },
            {
                name: '📅 Session',
                value: student.student_session || 'N/A',
                inline: true
            },
        ]

        // Add admin info for approval/rejection
        if (type !== 'new' && adminName) {
            fields.push({
                name: '👨‍💼 Admin',
                value: adminName,
                inline: true
            })
        }

        // Add rejection reason if provided
        if (type === 'rejected' && rejectionReason) {
            fields.push({
                name: '❌ Rejection Reason',
                value: rejectionReason,
                inline: false
            })
        }

        // Add changed fields
        if (changedFields.length > 0) {
            fields.push({
                name: '📝 Changed Fields',
                value: changedFields.join('\n'),
                inline: false
            })
        }

        // Add status
        const statusText = type === 'new' ? '⏳ Pending Review' :
            type === 'approved' ? '✅ Approved' : '❌ Rejected'
        fields.push({
            name: '📊 Status',
            value: statusText,
            inline: false
        })

        const embed: DiscordEmbed = {
            title,
            description,
            color,
            fields,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'TITAS System'
            }
        }

        const imageUrl = getStudentImageUrl(student.image_path)
        if (imageUrl) {
            embed.thumbnail = { url: imageUrl }
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] })
    }

    /**
     * Send bulk approval notification
     */
    static async sendBulkApprovalNotification(count: number, adminId: string): Promise<boolean> {
        const webhookUrl = WEBHOOK_URLS.approval
        if (!webhookUrl) return false

        const embed: DiscordEmbed = {
            title: '✅ Bulk Approval Complete',
            description: `**${count}** students have been approved by Admin (ID: ${adminId}).`,
            color: COLORS.APPROVED,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'TITAS System'
            }
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] })
    }

    /**
     * Send bulk rejection notification
     */
    static async sendBulkRejectionNotification(count: number, adminId: string, reason: string): Promise<boolean> {
        const webhookUrl = WEBHOOK_URLS.rejection
        if (!webhookUrl) return false

        const embed: DiscordEmbed = {
            title: '❌ Bulk Rejection Complete',
            description: `**${count}** students have been rejected by Admin (ID: ${adminId}).`,
            color: COLORS.REJECTED,
            fields: [
                {
                    name: '❌ Common Reason',
                    value: reason,
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'TITAS System'
            }
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] })
    }

    /**
     * Send contact form notification
     */
    static async sendContactNotification(data: { name: string, email: string, subject?: string, message: string }): Promise<boolean> {
        const webhookUrl = WEBHOOK_URLS.contact
        if (!webhookUrl) {
            console.log('Discord contact webhook URL not configured')
            return false
        }

        const embed: DiscordEmbed = {
            title: '📩 New Contact Message',
            description: `A new message has been submitted via the contact form.`,
            color: COLORS.CONTACT,
            fields: [
                {
                    name: '👤 Name',
                    value: data.name,
                    inline: true
                },
                {
                    name: '📧 Email',
                    value: data.email,
                    inline: true
                },
                {
                    name: '📄 Subject',
                    value: data.subject || 'General Enquiry',
                    inline: false
                },
                {
                    name: '💬 Message',
                    value: data.message.length > 1000 ? data.message.substring(0, 997) + '...' : data.message,
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'TITAS System'
            }
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] })
    }
}
