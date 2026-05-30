import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDB, type DBDrinkEntry } from "@/lib/db";
import { parseDateString } from "@/lib/dateUtils";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateString = searchParams.get("date");

    if (!dateString) {
      return NextResponse.json(
        { error: "Date parameter required" },
        { status: 400 },
      );
    }

    const targetDate = parseDateString(dateString);
    const dateStr = targetDate.toISOString().split("T")[0];

    const db = getDB();
    const { results: entries } = await db
      .prepare(
        "SELECT * FROM drink_entries WHERE user_id = ? AND date = ?",
      )
      .bind(session.user.id, dateStr)
      .all<DBDrinkEntry>();

    const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
    const hasTracked = entries.length > 0;

    return NextResponse.json({
      count: Math.max(0, totalCount),
      hasTracked,
    });
  } catch (error) {
    console.error("Error fetching date count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
