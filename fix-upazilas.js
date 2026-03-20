const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const upazilas = await prisma.upazilas.findMany();
  const dupes = upazilas.filter(u => u.name.match(/[\u0980-\u09FF]/));

  const mapping = {
    'সদর': 'Brahmanbaria Sadar',
    'কসবা': 'Kasba',
    'নবীনগর': 'Nabinagar',
    'নাসিরনগর': 'Nasirnagar',
    'সরাইল': 'Sarail',
    'আশুগঞ্জ': 'Ashuganj',
    'আখাউড়া': 'Akhaura',
    'বাঞ্ছারামপুর': 'Bancharampur',
    'বিজয়নগর': 'Bijoynagar'
  };

  for (const dupe of dupes) {
    const englishName = mapping[dupe.name];
    if (!englishName) {
      console.log('No mapping for', dupe.name);
      continue;
    }

    const studentsToUpdate = await prisma.students.count({ where: { upazila: dupe.name } });
    if (studentsToUpdate > 0) {
      console.log(`Migrating ${studentsToUpdate} students from ${dupe.name} to ${englishName}`);
      await prisma.students.updateMany({
        where: { upazila: dupe.name },
        data: { upazila: englishName }
      });
    }

    // After migration, delete the dupes
    console.log(`Deleting duplicate upazila: ${dupe.name}`);
    await prisma.upazilas.delete({
      where: { id: dupe.id }
    });
  }

  console.log('Done!');
}

check().catch(console.error).finally(() => prisma.$disconnect());
