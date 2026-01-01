import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count, date: dateString } = await request.json();

    if (count !== 1 && count !== -1) {
      return NextResponse.json(
        { error: "Count must be 1 or -1" },
        { status: 400 },
      );
    }

    // Use provided date or default to today
    const targetDate = dateString ? new Date(dateString) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Prevent future dates
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (targetDate > now) {
      return NextResponse.json(
        { error: "Cannot log drinks for future dates" },
        { status: 400 },
      );
    }

    // Limit backfill to 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0, 0, 0, 0);
    if (targetDate < ninetyDaysAgo) {
      return NextResponse.json(
        { error: "Cannot log drinks more than 90 days in the past" },
        { status: 400 },
      );
    }

    const entry = await prisma.drinkEntry.create({
      data: {
        userId: session.user.id,
        count,
        date: targetDate,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Error creating drink entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
