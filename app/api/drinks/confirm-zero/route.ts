import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDB, type DBDrinkEntry } from "@/lib/db";
import { parseDateString, getTodayUTC, getDaysAgoUTC } from "@/lib/dateUtils";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date: dateString } = await request.json();

    const targetDate = dateString ? parseDateString(dateString) : getTodayUTC();
    const now = getTodayUTC();

    if (targetDate > now) {
      return NextResponse.json(
        { error: "Cannot confirm zero for future dates" },
        { status: 400 },
      );
    }

    const ninetyDaysAgo = getDaysAgoUTC(90);
    if (targetDate < ninetyDaysAgo) {
      return NextResponse.json(
        { error: "Cannot confirm zero more than 90 days in the past" },
        { status: 400 },
      );
    }

    const dateStr = targetDate.toISOString().split("T")[0];
    const db = getDB();

    const { results: existingEntries } = await db
      .prepare(
        "SELECT * FROM drink_entries WHERE user_id = ? AND date = ?",
      )
      .bind(session.user.id, dateStr)
      .all<DBDrinkEntry>();

    const totalCount = existingEntries.reduce(
      (sum, entry) => sum + entry.count,
      0,
    );

    if (totalCount > 0) {
      return NextResponse.json(
        { error: "Cannot confirm zero when drinks are already logged" },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    await db
      .prepare(
        "INSERT INTO drink_entries (id, user_id, count, date) VALUES (?, ?, ?, ?)",
      )
      .bind(id, session.user.id, 0, dateStr)
      .run();

    return NextResponse.json({
      success: true,
      entry: { id, userId: session.user.id, count: 0, date: dateStr },
    });
  } catch (error) {
    console.error("Error confirming zero:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
