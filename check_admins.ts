import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const admins = await prisma.admins.findMany()
  console.log(admins)
}
main()
