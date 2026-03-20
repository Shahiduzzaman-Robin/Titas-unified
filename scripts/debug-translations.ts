
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking Departments...')
    const departments = await prisma.departments.findMany({
        select: { name: true, name_bn: true }
    })

    console.log('Total departments:', departments.length)
    console.log('Sample departments:', departments.slice(0, 5))

    const students = await prisma.students.findMany({
        take: 5,
        select: { department: true }
    })

    console.log('\nSample Student Departments:')
    students.forEach(s => console.log(s.department))

    // Check matches
    console.log('\nChecking matches for student departments:')
    for (const s of students) {
        if (!s.department) continue
        const match = departments.find(d => d.name === s.department)
        console.log(`Student Dept: "${s.department}" -> Match found: ${!!match}, BN: "${match?.name_bn}"`)
    }
}

main()
