import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.deleteMany({
    where: {
      email: 'bastiensoret@gmail.com'
    }
  })
  
  console.log(`Deleted ${result.count} user(s) with email bastiensoret@gmail.com`)
}

main()
  .catch((e) => {
    console.error('Error deleting user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
