import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.students.count({
    where: {
      AND: [
        { email: { not: null } },
        { email: { not: '' } }
      ]
    }
  })
  console.log(`Total students with email: ${count}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
