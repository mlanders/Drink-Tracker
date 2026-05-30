import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDB, type DBDrinkEntry } from "@/lib/db";
import { getTodayInTimezone } from "@/lib/dateUtils";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timezone =
      searchParams.get("timezone") ||
      (session.user as any).timezone ||
      "America/Los_Angeles";

    const today = getTodayInTimezone(timezone);
    const todayStr = today.toISOString().split("T")[0];

    const db = getDB();
    const { results } = await db
      .prepare(
        "SELECT * FROM drink_entries WHERE user_id = ? AND date = ?",
      )
      .bind(session.user.id, todayStr)
      .all<DBDrinkEntry>();

    const totalCount = results.reduce((sum, entry) => sum + entry.count, 0);

    return NextResponse.json({ count: Math.max(0, totalCount) });
  } catch (error) {
    console.error("Error fetching today's count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
