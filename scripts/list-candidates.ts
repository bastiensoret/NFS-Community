import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  const candidates = await prisma.candidate.findMany({
    take: 10,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
    }
  })
  console.log(JSON.stringify(candidates, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
