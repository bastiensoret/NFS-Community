import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const GET = async (request: Request) => {
  // Optional: Check for authorization if you want to secure this endpoint
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    // Find positions that have been 'CAMPAIGN_SENT' for more than 2 weeks
    // We assume 'lastUpdated' reflects when the status changed to CAMPAIGN_SENT
    // because editing is blocked for finalized statuses.
    const positionsToArchive = await prisma.jobPosting.findMany({
      where: {
        status: "CAMPAIGN_SENT",
        lastUpdated: {
          lt: twoWeeksAgo,
        },
      },
      select: {
        id: true,
      },
    })

    if (positionsToArchive.length === 0) {
      return NextResponse.json({ message: "No positions to archive", count: 0 })
    }

    const idsToArchive = positionsToArchive.map((p) => p.id)

    // Bulk update status to ARCHIVED
    const result = await prisma.jobPosting.updateMany({
      where: {
        id: {
          in: idsToArchive,
        },
      },
      data: {
        status: "ARCHIVED",
      },
    })

    return NextResponse.json({
      message: "Successfully archived positions",
      count: result.count,
      archivedIds: idsToArchive,
    })
  } catch (error) {
    console.error("Error archiving positions:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
