const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const upazilasInfo = [
  { name: 'Brahmanbaria Sadar', name_bn: 'ব্রাহ্মণবাড়িয়া সদর' },
  { name: 'Ashuganj', name_bn: 'আশুগঞ্জ' },
  { name: 'Kasba', name_bn: 'কসবা' },
  { name: 'Nabinagar', name_bn: 'নবীনগর' },
  { name: 'Nasirnagar', name_bn: 'নাসিরনগর' },
  { name: 'Sarail', name_bn: 'সরাইল' },
  { name: 'Akhaura', name_bn: 'আখাউড়া' },
  { name: 'Bancharampur', name_bn: 'বাঞ্ছারামপুর' },
  { name: 'Bijoynagar', name_bn: 'বিজয়নগর' },
];

async function run() {
  // 1. Ensure all 9 upazilas exist in their English-key form
  for (const info of upazilasInfo) {
    const existing = await prisma.upazilas.findUnique({ where: { name: info.name } });
    if (!existing) {
      console.log(`Creating missing upazila: ${info.name}`);
      await prisma.upazilas.create({
        data: {
          name: info.name,
          name_bn: info.name_bn,
          district: 'ব্রাহ্মণবাড়িয়া',
          isActive: true
        }
      });
    } else {
      // update name_bn if needed
      if (existing.name_bn !== info.name_bn) {
        await prisma.upazilas.update({
          where: { name: info.name },
          data: { name_bn: info.name_bn }
        });
      }
    }
  }

  // 2. Map of Bengali duplicates that might exist in DB to target English name
  const bengaliToEnglish = {
    'সরাইল': 'Sarail',
    'আশুগঞ্জ': 'Ashuganj',
    'আখাউড়া': 'Akhaura',
    'বাঞ্ছারামপুর': 'Bancharampur',
    'বিজয়নগর': 'Bijoynagar',
    'সদর': 'Brahmanbaria Sadar',
    'কসবা': 'Kasba',
    'নবীনগর': 'Nabinagar',
    'নাসিরনগর': 'Nasirnagar'
  };

  // 3. Find and migrate any students attached to the old Bengali names
  for (const [bnName, enName] of Object.entries(bengaliToEnglish)) {
    const dupe = await prisma.upazilas.findFirst({ where: { name: bnName } });
    if (dupe) {
      console.log(`Found Bengali duplicate record: ${dupe.name}`);
      
      const count = await prisma.students.count({ where: { upazila: dupe.name } });
      if (count > 0) {
        console.log(`  -> Migrating ${count} students to ${enName}`);
        await prisma.students.updateMany({
          where: { upazila: dupe.name },
          data: { upazila: enName }
        });
      }

      console.log(`  -> Deleting duplicate record: ${dupe.name}`);
      await prisma.upazilas.delete({ where: { id: dupe.id } });
    } else {
      // Record doesn't exist in upazilas block. However, some students might STILL have the string mapped if FK was missing, but Prisma enforces FK so they MUST exist in upazilas.
      // We already checked and couldn't find it.
    }
  }

  console.log('All upazilas verified and duplicates cleaned up.');
  await prisma.$disconnect();
}

run().catch(console.error);
