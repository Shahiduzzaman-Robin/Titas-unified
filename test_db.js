const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const student = await prisma.students.findFirst({
        where: { name_en: { contains: 'Ikara Jahan' } }
    });
    console.log("Ikara in DB:", student ? student.id : 'NOT FOUND');
}
main();
