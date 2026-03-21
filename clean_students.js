const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    console.log('Cleaning existing student data in TiDB Cloud...');
    
    // 1. Delete SMS logs (depends on students)
    await prisma.sms_logs.deleteMany({});
    console.log('✅ Deleted SMS logs');

    // 2. Delete Student Activity logs
    await prisma.admin_activity_logs.deleteMany({
        where: { studentId: { not: null } }
    });
    console.log('✅ Deleted Student Activity logs');

    // 3. Delete Student Edits
    await prisma.student_edits.deleteMany({});
    console.log('✅ Deleted Student Edits');

    // 4. Delete Students
    const count = await prisma.students.deleteMany({});
    console.log(`✅ Deleted ${count.count} students`);

    console.log('Database is clean! Ready for a fresh import.');
}

clean()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
