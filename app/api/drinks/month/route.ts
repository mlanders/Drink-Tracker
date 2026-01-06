import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || "");
    const month = parseInt(searchParams.get("month") || "");

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid year or month" },
        { status: 400 },
      );
    }

    // Create dates in UTC to avoid timezone issues
    const firstDay = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const entries = await prisma.drinkEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by date and sum counts
    const dailyTotals = new Map<string, number>();
    entries.forEach((entry) => {
      const dateKey = entry.date.toISOString().split("T")[0];
      dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + entry.count);
    });

    const days = Array.from(dailyTotals.entries()).map(([date, count]) => ({
      date,
      count: Math.max(0, count),
    }));

    return NextResponse.json({ days });
  } catch (error) {
    console.error("Error fetching month data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
