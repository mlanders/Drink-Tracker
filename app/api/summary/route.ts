import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDB, type DBMonthlySummary } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDB();
    const { results: summaries } = await db
      .prepare(
        "SELECT * FROM monthly_summaries WHERE user_id = ? ORDER BY year DESC, month DESC LIMIT 12",
      )
      .bind(session.user.id)
      .all<DBMonthlySummary>();

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
