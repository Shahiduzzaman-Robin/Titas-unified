const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const students = await prisma.students.findMany({
        where: {
            OR: [
                { job_position: { not: null, not: "" } },
                { job_designation: { not: null, not: "" } }
            ]
        },
        select: {
            id: true,
            name_en: true,
            job_position: true,
            job_designation: true,
            show_job_position: true
        },
        take: 5
    });
    console.log(students);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
