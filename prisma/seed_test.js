const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding data...')

    // Seed Sessions
    const sessions = [
        { name: '2020-21', name_bn: '২০২০-২১', isActive: true },
        { name: '2021-22', name_bn: '২০২১-২২', isActive: true },
        { name: '2022-23', name_bn: '২০২২-২৩', isActive: true },
    ]
    for (const s of sessions) {
        await prisma.sessions.upsert({
            where: { name: s.name },
            update: s,
            create: s,
        })
    }

    // Seed Departments
    const departments = [
        { name: 'Computer Science and Engineering', name_bn: 'কম্পিউটার বিজ্ঞান ও প্রকৌশল', isActive: true },
        { name: 'Physics', name_bn: 'পদর্থবিজ্ঞান', isActive: true },
        { name: 'Mathematics', name_bn: 'গণিত', isActive: true },
    ]
    for (const d of departments) {
        await prisma.departments.upsert({
            where: { name: d.name },
            update: d,
            create: d,
        })
    }

    // Seed Halls
    const halls = [
        { name: 'S.M. Hall', name_bn: 'এস এম হল', isActive: true },
        { name: 'Zahurul Huq Hall', name_bn: 'জহুরুল হক হল', isActive: true },
        { name: 'Kuvait Maitree Hall', name_bn: 'কুয়েত মৈত্রী হল', isActive: true },
    ]
    for (const h of halls) {
        await prisma.halls.upsert({
            where: { name: h.name },
            update: h,
            create: h,
        })
    }

    // Seed Upazilas
    const upazilas = [
        { name: 'Brahmanbaria Sadar', name_bn: 'ব্রাহ্মণবাড়িয়া সদর', isActive: true },
        { name: 'Ashuganj', name_bn: 'আশুগঞ্জ', isActive: true },
        { name: 'Kasba', name_bn: 'কসবা', isActive: true },
    ]
    for (const u of upazilas) {
        await prisma.upazilas.upsert({
            where: { name: u.name },
            update: u,
            create: u,
        })
    }

    // Seed Students
    const students = [
        {
            prefix: 'TITAS',
            name_en: 'Ashiqur Rahman',
            name_bn: 'আশিকুর রহমান',
            student_session: '2020-21',
            department: 'Computer Science and Engineering',
            hall: 'S.M. Hall',
            upazila: 'Brahmanbaria Sadar',
            mobile: '01712345678',
            email: 'ashiqur@example.com',
            blood_group: 'A+',
            gender: 'male',
            approval: 1,
        },
        {
            prefix: 'TITAS',
            name_en: 'Nusrat Jahan',
            name_bn: 'নুসরাত জাহান',
            student_session: '2021-22',
            department: 'Physics',
            hall: 'Kuvait Maitree Hall',
            upazila: 'Ashuganj',
            mobile: '01887654321',
            email: 'nusrat@example.com',
            blood_group: 'B+',
            gender: 'female',
            approval: 1,
        },
        {
            prefix: 'TITAS',
            name_en: 'Tanvir Ahmed',
            name_bn: 'তানভীর আহমেদ',
            student_session: '2022-23',
            department: 'Mathematics',
            hall: 'Zahurul Huq Hall',
            upazila: 'Kasba',
            mobile: '01911223344',
            email: 'tanvir@example.com',
            blood_group: 'O+',
            gender: 'male',
            approval: 1,
        }
    ]

    for (const s of students) {
        await prisma.students.create({ data: s })
    }

    console.log('Seeding completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
