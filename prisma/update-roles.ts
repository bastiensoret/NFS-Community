import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Update BASIC_USER to USER
  const result = await prisma.user.updateMany({
    where: {
      role: 'BASIC_USER'
    },
    data: {
      role: 'USER'
    }
  })
  
  console.log(`Updated ${result.count} users from BASIC_USER to USER`)
  
  // List all users with their roles
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
