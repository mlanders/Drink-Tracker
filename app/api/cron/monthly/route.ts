import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const year = lastMonth.getFullYear()
    const month = lastMonth.getMonth() + 1

    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    
    const users = await prisma.user.findMany()

    let processedCount = 0

    for (const user of users) {
      const entries = await prisma.drinkEntry.findMany({
        where: {
          userId: user.id,
          date: {
            gte: firstDay,
            lte: lastDay
          }
        }
      })

      if (entries.length === 0) continue

      const dailyTotals = new Map<string, number>()
      
      entries.forEach(entry => {
        const dateKey = entry.date.toISOString().split('T')[0]
        dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + entry.count)
      })

      const daysTracked = dailyTotals.size
      const totalDrinks = Array.from(dailyTotals.values()).reduce((sum, val) => sum + val, 0)
      const averagePerDay = totalDrinks / daysTracked

      await prisma.monthlySummary.upsert({
        where: {
          userId_year_month: {
            userId: user.id,
            year,
            month
          }
        },
        update: {
          totalDrinks,
          averagePerDay,
          daysTracked
        },
        create: {
          userId: user.id,
          year,
          month,
          totalDrinks,
          averagePerDay,
          daysTracked
        }
      })

      processedCount++
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} users for ${year}-${month}`
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
