import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || 'file:./dev.db'
})

async function main() {
  console.log('Starting database seed...')

  const hashedPassword = await bcrypt.hash('devpassword123', 10)

  const devUser = await prisma.user.upsert({
    where: { email: 'info@bastiensoret.com' },
    update: {},
    create: {
      email: 'info@bastiensoret.com',
      name: 'Bastien Soret',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log('Dev user created:', devUser)
  console.log('Email: info@bastiensoret.com')
  console.log('Password: devpassword123')
  console.log('Role: SUPER_ADMIN')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
