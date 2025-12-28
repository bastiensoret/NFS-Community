import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting database seed...')

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.SEED_ADMIN_PASSWORD || 'password123'

  if (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD) {
    console.warn('⚠️  Using default seed credentials. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env for security.')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const devUser = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Admin User',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log('Dev user created/updated:')
  console.log(`Email: ${email}`)
  console.log('Role: SUPER_ADMIN')
  // Do not log the password in production scenarios, but helpful for dev
  if (process.env.NODE_ENV !== 'production') {
      console.log(`Password: ${password}`)
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
