import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding email templates...')

    const templates = [
        {
            key: 'password_reset',
            name: 'Password Reset',
            subject: 'Reset Your Titas Account Password',
            content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Dear {{name}},</p>
            <p>You requested a password reset for your Titas account ({{email}}).</p>
            <p>Click the button below to set a new password:</p>
            <a href="{{resetLink}}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Reset Password
            </a>
            <p>Or copy this link:</p>
            <p>{{resetLink}}</p>
            <p>This link will expire in 1 hour.</p>
            <p>Best regards,<br>{{siteName}} Team</p>
        </div>
            `,
            variables: ["name", "email", "resetLink", "siteName", "siteUrl", "year"]
        },
        {
            key: 'edit_approved',
            name: 'Profile Edit Approved',
            subject: 'Profile Update Approved - Titas',
            content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Profile Update Approved</h2>
            <p>Dear {{name}},</p>
            <p>Your recent profile update request has been <strong>APPROVED</strong> by an admin.</p>
            <p>Your profile ({{titasId}}) has been updated with the new information.</p>
            <p>You can view your updated profile here:</p>
            <a href="{{loginLink}}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                View Profile
            </a>
            <p>Best regards,<br>{{siteName}} Team</p>
        </div>
            `,
            variables: ["name", "titasId", "loginLink", "siteName", "department", "session", "year"]
        },
        {
            key: 'edit_rejected',
            name: 'Profile Edit Rejected',
            subject: 'Profile Update Rejected - Titas',
            content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Profile Update Rejected</h2>
            <p>Dear {{name}},</p>
            <p>Your recent profile update request has been <strong>REJECTED</strong> by an admin.</p>
            <p><strong>Reason:</strong> {{reason}}</p>
            <p>You can login to make a new request if needed:</p>
            <a href="{{loginLink}}" style="display: inline-block; background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Login to Titas
            </a>
            <p>Best regards,<br>{{siteName}} Team</p>
        </div>
            `,
            variables: ["name", "reason", "loginLink", "siteName", "year"]
        },
        {
            key: 'registration_success',
            name: 'Registration Success',
            subject: 'Registration Successful - Your Titas Account Credentials',
            content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to {{siteName}}</h2>
            <p>Dear {{name}},</p>
            <p>Your registration has been received successfully.</p>
            <p>An account has been created for you with the following credentials:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> {{email}}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 1.2em; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">{{password}}</span></p>
            </div>
            <p><strong>Details Provided:</strong></p>
            <ul>
                <li><strong>Session:</strong> {{session}}</li>
                <li><strong>Department:</strong> {{department}}</li>
                <li><strong>Titas ID:</strong> {{titasId}}</li>
            </ul>
            <p>Please log in and complete/update your profile information.</p>
            <p><strong>Note:</strong> We recommend changing this auto-generated password after your first login.</p>
            <a href="{{loginLink}}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Login to Dashboard
            </a>
            <p>Best regards,<br>{{siteName}} Team</p>
        </div>
            `,
            variables: ["name", "email", "password", "session", "department", "titasId", "loginLink", "siteName", "year"]
        }
    ]

    for (const template of templates) {
        await prisma.email_templates.upsert({
            where: { key: template.key },
            update: template as any,
            create: template as any,
        })
        console.log(`Synced template: ${template.key}`)
    }

    console.log('Seeding email templates completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
