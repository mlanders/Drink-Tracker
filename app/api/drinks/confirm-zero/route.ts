import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date: dateString } = await request.json();

    // Use provided date or default to today
    const targetDate = dateString ? new Date(dateString) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Prevent future dates
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (targetDate > now) {
      return NextResponse.json(
        { error: "Cannot confirm zero for future dates" },
        { status: 400 },
      );
    }

    // Limit backfill to 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0, 0, 0, 0);
    if (targetDate < ninetyDaysAgo) {
      return NextResponse.json(
        { error: "Cannot confirm zero more than 90 days in the past" },
        { status: 400 },
      );
    }

    // Check if there are already entries for this date
    const existingEntries = await prisma.drinkEntry.findMany({
      where: {
        userId: session.user.id,
        date: targetDate,
      },
    });

    const totalCount = existingEntries.reduce((sum, entry) => sum + entry.count, 0);

    if (totalCount > 0) {
      return NextResponse.json(
        { error: "Cannot confirm zero when drinks are already logged" },
        { status: 400 },
      );
    }

    // Create a zero entry to mark the day as tracked
    const entry = await prisma.drinkEntry.create({
      data: {
        userId: session.user.id,
        count: 0,
        date: targetDate,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Error confirming zero:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
