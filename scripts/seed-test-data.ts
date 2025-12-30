
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
  console.log('Cleaning up database...')
  await prisma.jobPostingLanguage.deleteMany()
  await prisma.jobPosting.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding users...')
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Standard User',
      password: hashedPassword,
      role: 'USER',
    },
  })

  console.log('Seeding candidates...')
  const candidates = [
    {
      firstName: "Sarah",
      lastName: "Connor",
      email: "sarah.connor@sky-net.com",
      phoneNumber: "+33612345678",
      desiredRoles: ["Full Stack Engineer", "Team Lead"],
      hardSkills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      industries: ["Technology", "Security"],
      location: "Paris, France",
      status: "ACTIVE",
      seniorityLevel: "Senior",
      creatorId: admin.id
    },
    {
      firstName: "James",
      lastName: "Howlett",
      email: "logan@x-men.org",
      phoneNumber: "+33698765432",
      desiredRoles: ["Senior Security Specialist", "Field Agent"],
      hardSkills: ["Security Auditing", "Risk Management", "Crisis Response"],
      industries: ["Defense", "Private Security"],
      location: "Lyon, France",
      status: "ACTIVE",
      seniorityLevel: "Senior",
      creatorId: admin.id
    },
    {
      firstName: "Ellen",
      lastName: "Ripley",
      email: "ripley@weyland-yutani.com",
      phoneNumber: "+33712345678",
      desiredRoles: ["Operations Manager", "Logistics Director"],
      hardSkills: ["Project Management", "Supply Chain", "Team Leadership"],
      industries: ["Aerospace", "Logistics"],
      location: "Marseille, France",
      status: "PENDING_APPROVAL",
      seniorityLevel: "Lead",
      creatorId: admin.id
    },
    {
      firstName: "Arthur",
      lastName: "Dent",
      email: "arthur@hitchhiker.gal",
      phoneNumber: "+33787654321",
      desiredRoles: ["Technical Writer", "Communications Specialist"],
      hardSkills: ["Copywriting", "Documentation", "Public Relations"],
      industries: ["Media", "Publishing"],
      location: "Bordeaux, France",
      status: "DRAFT",
      seniorityLevel: "Junior",
      creatorId: admin.id
    }
  ]

  for (const c of candidates) {
    await prisma.candidate.create({ data: c })
  }

  console.log('Seeding positions...')
  const positions = [
    {
      jobTitle: 'Senior Full Stack Developer',
      companyName: 'Tech Corp',
      location: 'Brussels',
      country: 'Belgium',
      seniorityLevel: 'Senior',
      industrySector: 'IT',
      description: 'We are looking for a senior developer to lead our core team.',
      status: 'ACTIVE',
      remoteAllowed: true,
      onSiteDays: 2,
      minSalary: 60000,
      maxSalary: 85000,
      currency: 'EUR',
      contactName: 'John Doe',
      contactEmail: 'john@techcorp.com',
      contactPhone: '+3212345678',
      responsibilities: ['Architecting systems', 'Mentoring juniors', 'Code reviews'],
      skills: ['React', 'Node.js', 'PostgreSQL'],
      creatorId: admin.id,
      languageRequirements: {
        create: [
          { language: 'English', level: 'Fluent', mandatory: true },
          { language: 'French', level: 'Professional', mandatory: false }
        ]
      }
    },
    {
      jobTitle: 'Security Specialist',
      companyName: 'CyberShield',
      location: 'Paris',
      country: 'France',
      seniorityLevel: 'Lead',
      industrySector: 'IT',
      description: 'Join our security response team to protect critical infrastructure.',
      status: 'ACTIVE',
      remoteAllowed: false,
      onSiteDays: 5,
      minSalary: 70000,
      maxSalary: 95000,
      currency: 'EUR',
      contactName: 'Jane Smith',
      contactEmail: 'jane@cybershield.com',
      contactPhone: '+33123456789',
      responsibilities: ['Incident response', 'Security audits', 'Risk assessment'],
      skills: ['Network Security', 'Penetration Testing', 'SIEM'],
      creatorId: admin.id,
      languageRequirements: {
        create: [
          { language: 'French', level: 'Native', mandatory: true },
          { language: 'English', level: 'Professional', mandatory: true }
        ]
      }
    },
    {
      jobTitle: 'Operations Manager',
      companyName: 'Global Logistics',
      location: 'Antwerp',
      country: 'Belgium',
      seniorityLevel: 'Senior',
      industrySector: 'Logistics',
      description: 'Oversee complex logistics operations across Europe.',
      status: 'ACTIVE',
      remoteAllowed: true,
      onSiteDays: 3,
      minSalary: 55000,
      maxSalary: 75000,
      currency: 'EUR',
      contactName: 'Marc Peeters',
      contactEmail: 'marc@globallogistics.com',
      contactPhone: '+3234567890',
      responsibilities: ['Supply chain optimization', 'Fleet management', 'Budgeting'],
      skills: ['Project Management', 'ERP Systems', 'Leadership'],
      creatorId: admin.id,
      languageRequirements: {
        create: [
          { language: 'Dutch', level: 'Native', mandatory: true },
          { language: 'English', level: 'Professional', mandatory: true }
        ]
      }
    }
  ]

  for (const p of positions) {
    await prisma.jobPosting.create({ data: p })
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
