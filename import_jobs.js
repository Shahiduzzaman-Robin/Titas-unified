const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting job import...");
    const workbook = XLSX.readFile('public/titas-approved-students (2).xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let updatedCount = 0;

    for (let i = 5; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[0]) continue;

        const mobile = row[7] ? String(row[7]).trim() : null;
        const email = row[8] ? String(row[8]).trim() : null;
        
        // As seen in Excel, index 13 was roles, index 14 was places.
        const designation = row[13] ? String(row[13]).trim() : null;
        const place = row[14] ? String(row[14]).trim() : null;

        if (designation || place) {
            // Find student by mobile or email
            const whereClause = [];
            if (mobile) whereClause.push({ mobile });
            if (email) whereClause.push({ email });

            if (whereClause.length === 0) continue;

            const student = await prisma.students.findFirst({
                where: { OR: whereClause }
            });

            if (student) {
                await prisma.students.update({
                    where: { id: student.id },
                    data: {
                        job_designation: designation || null,
                        job_position: place || null
                    }
                });
                console.log(`Updated ID: ${student.id} (${student.name_en}) - Desig: ${designation}, Place: ${place}`);
                updatedCount++;
            } else {
                console.log(`Could not find student by mobile ${mobile} or email ${email}`);
            }
        }
    }
    console.log(`Successfully updated ${updatedCount} students.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
