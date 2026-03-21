import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.admins.update({
    where: { email: 'login@titasdu.com' },
    data: { password: hashedPassword }
  })
  console.log('Password successfully reset to: admin123')
}

main()
