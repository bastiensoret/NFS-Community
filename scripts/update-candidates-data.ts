
import 'dotenv/config'
import { prisma } from '../lib/prisma'

const candidates = [
  {
    id: "cmjqlry060000t0ucdztexp5q",
    firstName: "Sarah",
    lastName: "Connor",
    email: "sarah.connor@sky-net.com",
    phoneNumber: "+33612345678",
    desiredRoles: ["Full Stack Engineer", "Team Lead"],
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    industries: ["Technology", "Security"],
    location: "Paris, France",
    status: "ACTIVE"
  },
  {
    id: "cmjqlry1l0001t0uctcjv2924",
    firstName: "James",
    lastName: "Howlett",
    email: "logan@x-men.org",
    phoneNumber: "+33698765432",
    desiredRoles: ["Senior Security Specialist", "Field Agent"],
    skills: ["Security Auditing", "Risk Management", "Crisis Response"],
    industries: ["Defense", "Private Security"],
    location: "Lyon, France",
    status: "ACTIVE"
  },
  {
    id: "cmjqlry2j0002t0uchd3cd7si",
    firstName: "Ellen",
    lastName: "Ripley",
    email: "ripley@weyland-yutani.com",
    phoneNumber: "+33712345678",
    desiredRoles: ["Operations Manager", "Logistics Director"],
    skills: ["Project Management", "Supply Chain", "Team Leadership"],
    industries: ["Aerospace", "Logistics"],
    location: "Marseille, France",
    status: "PENDING_APPROVAL"
  },
  {
    id: "cmjqlry3a0003t0ucscr36ggm",
    firstName: "Arthur",
    lastName: "Dent",
    email: "arthur@hitchhiker.gal",
    phoneNumber: "+33787654321",
    desiredRoles: ["Technical Writer", "Communications Specialist"],
    skills: ["Copywriting", "Documentation", "Public Relations"],
    industries: ["Media", "Publishing"],
    location: "Bordeaux, France",
    status: "DRAFT"
  }
]

async function main() {
  for (const candidate of candidates) {
    const { id, ...data } = candidate
    await prisma.candidate.update({
      where: { id },
      data
    })
    console.log(`Updated candidate: ${data.firstName} ${data.lastName}`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
