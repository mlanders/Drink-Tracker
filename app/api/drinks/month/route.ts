import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDB, type DBDrinkEntry } from "@/lib/db";

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

    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDayDate = new Date(Date.UTC(year, month, 0));
    const lastDay = lastDayDate.toISOString().split("T")[0];

    const db = getDB();
    const { results: entries } = await db
      .prepare(
        "SELECT * FROM drink_entries WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC",
      )
      .bind(session.user.id, firstDay, lastDay)
      .all<DBDrinkEntry>();

    const dailyTotals = new Map<string, number>();
    entries.forEach((entry) => {
      dailyTotals.set(
        entry.date,
        (dailyTotals.get(entry.date) || 0) + entry.count,
      );
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
