import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import { sessions, departments, halls, upazilas } from '../lib/form-data'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'login@titasdu.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'titasdu.com'

    // Seed Admin
    const existingAdmin = await prisma.admins.findUnique({
        where: { email: adminEmail },
    })

    if (!existingAdmin) {
        const hashedPassword = await hashPassword(adminPassword)
        await prisma.admins.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Super Admin',
            },
        })
        console.log(`Admin user created: ${adminEmail}`)
    } else {
        console.log('Admin user already exists')
    }

    // Seed Options
    console.log('Seeding options...')

    // Sessions
    for (const session of sessions) {
        if (session) {
            await prisma.sessions.upsert({
                where: { name: session },
                update: {},
                create: { name: session },
            })
        }
    }

    // Departments
    for (const dept of departments) {
        if (dept) {
            await prisma.departments.upsert({
                where: { name: dept },
                update: {},
                create: { name: dept },
            })
        }
    }

    // Halls
    for (const hall of halls) {
        if (hall) {
            await prisma.halls.upsert({
                where: { name: hall },
                update: {},
                create: { name: hall },
            })
        }
    }

    // Upazilas
    for (const upazila of upazilas) {
        if (upazila) {
            await prisma.upazilas.upsert({
                where: { name: upazila },
                update: {},
                create: { name: upazila },
            })
        }
    }

    console.log('Options seeding completed')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
