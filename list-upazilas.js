const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const upazilas = await prisma.upazilas.findMany();
  console.log(upazilas.map(u => u.name));
  await prisma.$disconnect();
}

run().catch(console.error);
