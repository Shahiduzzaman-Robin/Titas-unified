const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Cloud Seeding...');

    // 1. Create Admin
    const adminEmail = 'login@titasdu.com';
    const adminPassword = 'admin123'; // Temporary password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.admins.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            name: 'TITAS Admin',
            isSystemAdmin: true
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'TITAS Admin',
            isSystemAdmin: true
        }
    });

    console.log(`✅ Admin created/updated: ${admin.email}`);
    console.log(`🔑 Temporary Password: ${adminPassword}`);
    console.log('⚠️ Please change this password after logging in.');

    // 2. Initialize necessary lookup data if empty
    // (This prevents the "Application error" on /students page)
    
    const sessionsCount = await prisma.sessions.count();
    if (sessionsCount === 0) {
        await prisma.sessions.create({ data: { name: '2024-25', name_bn: '২০২৪-২৫', isActive: true } });
        console.log('✅ Added default session');
    }

    const deptsCount = await prisma.departments.count();
    if (deptsCount === 0) {
        await prisma.departments.create({ data: { name: 'Computer Science and Engineering', name_bn: 'কম্পিউটার বিজ্ঞান ও প্রকৌশল', isActive: true } });
        console.log('✅ Added default department');
    }
    
    console.log('Cloud Seeding Complete!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
