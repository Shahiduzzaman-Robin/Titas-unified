const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function updateJobInfo() {
    const filePath = path.join(__dirname, 'public', 'titas-approved-students (2).xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Header Row A-T
    const data = xlsx.utils.sheet_to_json(sheet, { header: 'A', range: 5 });

    console.log(`Analyzing and Updating Job Metadata...`);

    let updatedCount = 0;

    for (const row of data) {
        const nameEn = row['C'];
        const mobile = row['H']?.toString().replace(/\s/g, '');
        const regNo = row['E']?.toString().replace(/\s/g, '');
        
        // CORRECTION based on Raiyan's actual Row Data:
        // N is the DESIGNATION/TITLE ("সভাপতি, তিতাস")
        // O is the ORGANIZATION ("তিতাস-ঢাকা বিশ্ববিদ্যালয়স্থ...")
        const excelDesignation = row['N'];
        const excelOrganization = row['O'];

        if (!excelDesignation && !excelOrganization) continue;

        try {
            const student = await prisma.students.findFirst({
                where: {
                    OR: [
                        { mobile: { contains: mobile || 'NONEXISTENT_M' } },
                        { du_reg_number: { equals: regNo || 'NONEXISTENT_R' } }
                    ]
                }
            });

            if (student) {
                await prisma.students.update({
                    where: { id: student.id },
                    data: {
                        // FORCE WRITING EXACTLY TO THE RIGHT FIELDS
                        job_designation: excelDesignation || null, 
                        job_position: excelOrganization || null
                    }
                });
                updatedCount++;
                if (updatedCount < 5) {
                    console.log(`Updated ${nameEn}: Title=[${excelDesignation}], Org=[${excelOrganization}]`);
                }
            }
        } catch (err) {
            console.error(`Error updating ${nameEn}:`, err.message);
        }
    }

    console.log(`Total students updated: ${updatedCount}`);
}

updateJobInfo()
    .then(() => prisma.$disconnect())
    .catch(console.error);
