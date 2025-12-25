import { prisma } from "../lib/prisma"

async function updateUserRole() {
  try {
    const user = await prisma.user.update({
      where: { email: "bastiensoret@gmail.com" },
      data: { role: "SUPER_ADMIN" },
    })
    console.log(`✓ Updated user ${user.email} to role: ${user.role}`)
  } catch (error) {
    console.error("Error updating user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserRole()
