import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function toBengaliNumber(number: string | number): string {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return number.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
}

async function main() {
    console.log('Standardizing sessions (1980-81 to 2024-25)...')

    const sessions = []
    for (let year = 2024; year >= 1980; year--) {
        const startYear = year
        const endYear = (year + 1) % 100
        const sessionName = `${startYear}-${endYear.toString().padStart(2, '0')}`
        const sessionNameBn = `${toBengaliNumber(startYear)}-${toBengaliNumber(endYear.toString().padStart(2, '0'))}`
        
        sessions.push({
            name: sessionName,
            name_bn: sessionNameBn,
            isActive: true
        })
    }

    // Upsert sessions
    for (const session of sessions) {
        await prisma.sessions.upsert({
            where: { name: session.name },
            update: { 
                isActive: true,
                name_bn: session.name_bn
            },
            create: session
        })
    }

    // Deactivate sessions not in the list
    const sessionNames = sessions.map(s => s.name)
    await prisma.sessions.updateMany({
        where: {
            name: { notIn: sessionNames }
        },
        data: { isActive: false }
    })

    console.log('Successfully standardized ' + sessions.length + ' sessions.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
