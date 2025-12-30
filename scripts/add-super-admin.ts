import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'bastiensoret@gmail.com'
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log(`User ${email} not found.`)
    return
  }

  console.log(`Found user: ${user.name} (${user.email}) with current role: ${user.role}`)

  await prisma.user.update({
    where: { email },
    data: { role: 'SUPER_ADMIN' }
  })

  console.log(`Successfully updated ${email} to SUPER_ADMIN role.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
