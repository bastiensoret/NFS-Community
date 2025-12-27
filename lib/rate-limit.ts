import { prisma } from "@/lib/prisma"

export async function checkRateLimit(identifier: string, limit: number = 10, windowDuration: number = 60000): Promise<boolean> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowDuration)

  try {
    // Clean up old entries (optional optimization, could be a cron job)
    // We do this async without awaiting to not block the request
    prisma.rateLimit.deleteMany({
      where: { resetAt: { lt: now } }
    }).catch(console.error)

    const rateLimit = await prisma.rateLimit.findUnique({
      where: { identifier }
    })

    if (!rateLimit || rateLimit.resetAt < now) {
      // Create or reset
      await prisma.rateLimit.upsert({
        where: { identifier },
        update: {
          count: 1,
          resetAt: new Date(now.getTime() + windowDuration)
        },
        create: {
          identifier,
          count: 1,
          resetAt: new Date(now.getTime() + windowDuration)
        }
      })
      return true
    }

    if (rateLimit.count >= limit) {
      return false
    }

    // Increment
    await prisma.rateLimit.update({
      where: { identifier },
      data: { count: { increment: 1 } }
    })

    return true
  } catch (error) {
    console.error("Rate limit check failed:", error)
    // Fail open if DB is down to avoid blocking legitimate users during outages
    return true
  }
}

