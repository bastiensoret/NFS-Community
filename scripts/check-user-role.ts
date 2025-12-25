import { prisma } from "../lib/prisma"

async function checkUserRole() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "bastiensoret@gmail.com" },
      select: { email: true, role: true },
    })
    console.log(JSON.stringify(user, null, 2))
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserRole()
