const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const deptMap = {
  'ম্যানেজমেন্ট': 'Management',
  'ম্যানেজমেন্ট ইনফরমেশন সিস্টেমস': 'Management Information Systems',
  'রসায়ন': 'Chemistry',
  'রাষ্ট্রবিজ্ঞান': 'Political Science',
  'রোবটিক্স এন্ড মেকাট্রনিক্স ইঞ্জিনিয়ারিং': 'Robotics and Mechatronics Engineering',
  'লেদার ইঞ্জিনিয়ারিং এন্ড টেকনোলজি ইনস্টিটিউট': 'Institute of Leather Engineering and Technology',
  'লোক প্রশাসন': 'Public Administration',
  'শান্তি ও সংঘর্ষ অধ্যয়ন': 'Peace and Conflict Studies',
  'শিক্ষা ও গবেষণা ইনস্টিটিউট': 'Institute of Education and Research',
  'শিল্পকলার ইতিহাস': 'History of Art',
  'সংগীত': 'Music',
  'সংস্কৃত': 'Sanskrit',
  'সমাজকল্যাণ ও গবেষণা ইনস্টিটিউট': 'Institute of Social Welfare and Research',
  'সমাজবিজ্ঞান': 'Sociology',
  'সমুদ্রবিজ্ঞান': 'Oceanography',
  'স্বাস্থ্য অর্থনীতি ইনস্টিটিউট': 'Institute of Health Economics',
  'অণুজীব বিজ্ঞান': 'Microbiology',
  'অর্গানাইজেশন স্ট্র্যাটেজি এন্ড লিডারশীপ': 'Organization Strategy and Leadership',
  'অর্গ্যানাইজেশন স্ট্র্যাটেজি এন্ড লিডারশীপ': 'Organization Strategy and Leadership',
  'অর্থনীতি': 'Economics',
  'আইন': 'Law',
  'আধুনিক ভাষা ইনস্টিটিউট': 'Institute of Modern Languages',
  'ইসলামের ইতিহাস ও সংস্কৃতি': 'Islamic History and Culture',
  'ইসলামিক স্টাডিজ': 'Islamic Studies',
  'উর্দু': 'Urdu',
  'ওশানোগ্রাফি': 'Oceanography',
  'কমিউনিকেশন ডিসঅর্ডারস': 'Communication Disorders',
  'কমিউনিকেশন ডিজঅর্ডারস': 'Communication Disorders',
  'কম্পিউটার সায়েন্স এন্ড ইঞ্জিনিয়ারিং': 'Computer Science and Engineering',
  'ক্লিনিক্যাল সাইকোলজি': 'Clinical Psychology',
  'গণিত': 'Mathematics',
  'গ্রাফিক ডিজাইন': 'Graphic Design',
  'জাপানিজ স্টাডিজ': 'Japanese Studies',
  'জিন প্রকৌশল ও জীবপ্রযুক্তি': 'Genetic Engineering and Biotechnology',
  'ড্যান্স': 'Dance',
  'তথ্যবিজ্ঞান ও গ্রন্থাগার ব্যবস্থাপনা': 'Information Science and Library Management',
  'তড়িৎ ও ইলেকট্রনিক প্রকৌশল': 'Electrical and Electronic Engineering',
  'ইলেকট্রিক্যাল এন্ড ইলেকট্রনিক ইঞ্জিনিয়ারিং': 'Electrical and Electronic Engineering',
  'থিয়েটার এন্ড পারফরম্যান্স স্টাডিজ': 'Theatre and Performance Studies',
  'দার্শনিক স্টাডিজ': 'Philosophy',
  'দর্শন': 'Philosophy',
  'পপুলেশন সায়েন্সেস': 'Population Sciences',
  'পরিসংখ্যান': 'Statistics',
  'পালি ও বুদ্ধিস্ট স্টাডিজ': 'Pali and Buddhist Studies',
  'প্রিন্টমেকিং': 'Printmaking',
  'ফার্মেসী': 'Pharmacy',
  'ফার্মেসি': 'Pharmacy',
  'ফলিত গণিত': 'Applied Mathematics',
  'ফালিত গণিত': 'Applied Mathematics',
  'ফলিত রসায়ন ও কেমিকৌশল': 'Applied Chemistry and Chemical Engineering',
  'ফালিত রসায়ন ও কেমিকৌশল': 'Applied Chemistry and Chemical Engineering',
  'ফার্সি ভাষা ও সাহিত্য': 'Persian Language and Literature',
  'ফিজিক্স': 'Physics',
  'পদার্থবিজ্ঞান': 'Physics',
  'ফিন্যান্স': 'Finance',
  'বটানি': 'Botany',
  'উদ্ভিদবিজ্ঞান': 'Botany',
  'বাংলা': 'Bangla',
  'ব্যাংকিং এন্ড ইন্স্যুরেন্স': 'Banking and Insurance',
  'ভূগোল ও পরিবেশ': 'Geography and Environment',
  'ভূতত্ত্ব': 'Geology',
  'মৃত্তিকা, পানি ও পরিবেশ': 'Soil, Water and Environment',
  'মার্কেটিং': 'Marketing',
  'ম্যাথমেটিক্স': 'Mathematics',
  'একাউন্টিং এন্ড ইনফরমেশন সিস্টেমস': 'Accounting and Information Systems',
  'ইংরেজী': 'English',
  'ইংরেজি': 'English',
  'ইতিহাস': 'History',
  'ইন্টারন্যাশনাল বিজনেস': 'International Business',
  'উইমেন এন্ড জেন্ডার স্টাডিজ': 'Women and Gender Studies',
  'আন্তর্জাতিক সম্পর্ক': 'International Relations',
  'আরবী': 'Arabic',
  'আবহাওয়া বিজ্ঞান': 'Meteorology',
  'ইনস্টিটিউট অব ডিজাস্টার ম্যানেজমেন্ট এন্ড ভালনারেবিলিটি স্টাডিজ': 'Institute of Disaster Management and Vulnerability Studies',
  'ক্রিমিনোলজি': 'Criminology'
};

const hallMap = {
  'হাজী মুহম্মদ মুহসীন হল': 'Haji Muhammad Mohsin Hall',
  'সলিমুল্লাহ মুসলিম হল': 'Salimullah Muslim Hall',
  'ফজলুল হক মুসলিম হল': 'Fazlul Huq Muslim Hall',
  'স্যার এ এফ রহমান হল': 'Sir A. F. Rahman Hall',
  'জাতির জনক বঙ্গবন্ধু শেখ মুজিবুর রহমান হল': 'Jatir Janak Bangabandhu Sheikh Mujibur Rahman Hall',
  'শহীদ সার্জেন্ট জহুরুল হক হল': 'Shaheed Sergeant Zahurul Huq Hall',
  'কবি জসীম উদ্দীন হল': 'Kabi Jasimuddin Hall',
  'মুক্তিযোদ্ধা জিয়াউর রহমান হল': 'Muktijoddha Ziaur Rahman Hall',
  'বিজয় একাত্তর হল': 'Bijoy Ekattor Hall',
  'ড. মুহম্মদ শহীদুল্লাহ্‌ হল': 'Dr. Muhammad Shahidullah Hall',
  'সূর্যসেন হল': 'Surja Sen Hall',
  'অমর একুশে হল': 'Amar Ekushey Hall',
  'জগন্নাথ হল': 'Jagannath Hall',
  'রোকেয়া হল': 'Rokeya Hall',
  'শামসুন নাহার হল': 'Shamsun Nahar Hall',
  'কবি সুফিয়া কামাল হল': 'Kabi Sufia Kamal Hall',
  'বঙ্গমাতা শেখ ফজিলেতুন্নেছা মুজিব হল': 'Bangamata Sheikh Fazilatunnesa Mujib Hall',
  'বাংলাদেশ কুয়েত মৈত্রী হল': 'Kuvait Maitree Hall', // Use existing english spelling in DB
  'কুয়েত মৈত্রী হল': 'Kuvait Maitree Hall'
};

async function processModel(modelName, mapDict) {
  console.log(`Processing ${modelName}...`);
  const items = await prisma[modelName].findMany();
  
  for (const item of items) {
    if (mapDict[item.name]) {
      const targetEnglishName = mapDict[item.name];
      const targetBanglaName = item.name;
      
      // Check if the english name already exists in another record
      const existingEn = await prisma[modelName].findFirst({
        where: { name: targetEnglishName }
      });
      
      if (existingEn && existingEn.id !== item.id) {
        console.log(`Merge needed for ${item.name} -> ${existingEn.name}`);
        // 1. Convert students
        const updateField = modelName === 'departments' ? 'department' : 'hall';
        const students = await prisma.students.updateMany({
          where: { [updateField]: targetBanglaName },
          data: { [updateField]: targetEnglishName }
        });
        
        // 2. Update existing EN to have BN name
        await prisma[modelName].update({
          where: { id: existingEn.id },
          data: { name_bn: targetBanglaName }
        });
        
        // 3. Delete the duplicated BN item
        await prisma[modelName].delete({
          where: { id: item.id }
        });
        
        console.log(`  Merged ${students.count} students. Deleted duplicate id ${item.id}.`);
      } else {
        // Safe to rename
        await prisma[modelName].update({
          where: { id: item.id },
          data: { name: targetEnglishName, name_bn: targetBanglaName }
        });
        // Also update students from bangla to english name since we changed the primary key name used for relations
        const updateField = modelName === 'departments' ? 'department' : 'hall';
        await prisma.students.updateMany({
          where: { [updateField]: targetBanglaName },
          data: { [updateField]: targetEnglishName }
        });
        console.log(`Renamed and updated students for ${targetBanglaName} -> ${targetEnglishName}`);
      }
    }
  }
}

async function main() {
  await processModel('departments', deptMap);
  await processModel('halls', hallMap);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
