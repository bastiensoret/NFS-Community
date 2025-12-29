import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Roles have been consolidated to USER, ADMIN, SUPER_ADMIN
  // This script lists all users with their roles
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true
    }
  })
  
  console.log('\nCurrent users:')
  users.forEach(user => {
    console.log(`- ${user.email}: ${user.role}`)
  })
}

main()
  .catch((e) => {
    console.error('Error updating roles:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
