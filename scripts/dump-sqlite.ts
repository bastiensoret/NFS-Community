
import { PrismaClient } from '@prisma/client'

// This script attempts to read from the SQLite database if it exists
// and print the data to see if it's the "lost" data.

async function dumpSqlite(dbPath: string) {
  console.log(`--- Checking ${dbPath} ---`)
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
  })

  try {
    const users = await prisma.user.findMany()
    console.log('Users:', users.length)
    users.forEach(u => console.log(`  - ${u.email} (${u.role})`))

    const candidates = await prisma.candidate.findMany()
    console.log('Candidates:', candidates.length)
    candidates.forEach(c => console.log(`  - ${c.firstName} ${c.lastName}`))

    const positions = await prisma.jobPosting.findMany()
    console.log('Positions:', positions.length)
    positions.forEach(p => console.log(`  - ${p.jobTitle} @ ${p.companyName}`))

  } catch (e) {
    console.log(`Could not read ${dbPath}:`, e.message)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  await dumpSqlite('./prisma/dev.db')
  await dumpSqlite('./prisma/prisma/dev.db')
}

main()
