import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { parseDateString, getTodayUTC, getDaysAgoUTC } from "@/lib/dateUtils";

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

    const targetDate = dateString ? parseDateString(dateString) : getTodayUTC();
    const now = getTodayUTC();

    if (targetDate > now) {
      return NextResponse.json(
        { error: "Cannot log drinks for future dates" },
        { status: 400 },
      );
    }

    const ninetyDaysAgo = getDaysAgoUTC(90);
    if (targetDate < ninetyDaysAgo) {
      return NextResponse.json(
        { error: "Cannot log drinks more than 90 days in the past" },
        { status: 400 },
      );
    }

    const db = getDB();
    const id = crypto.randomUUID();
    const dateStr = targetDate.toISOString().split("T")[0];

    await db
      .prepare(
        "INSERT INTO drink_entries (id, user_id, count, date) VALUES (?, ?, ?, ?)",
      )
      .bind(id, session.user.id, count, dateStr)
      .run();

    return NextResponse.json({
      success: true,
      entry: { id, userId: session.user.id, count, date: dateStr },
    });
  } catch (error) {
    console.error("Error creating drink entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
