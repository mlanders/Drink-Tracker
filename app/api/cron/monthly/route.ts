import { NextResponse } from "next/server";
import { getDB, type DBUser, type DBDrinkEntry } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const year =
      now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
    const month = now.getUTCMonth() === 0 ? 12 : now.getUTCMonth();

    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDayDate = new Date(Date.UTC(year, month, 0));
    const lastDay = lastDayDate.toISOString().split("T")[0];

    const db = getDB();
    const { results: users } = await db
      .prepare("SELECT id FROM users")
      .all<Pick<DBUser, "id">>();

    let processedCount = 0;

    for (const user of users) {
      const { results: entries } = await db
        .prepare(
          "SELECT * FROM drink_entries WHERE user_id = ? AND date >= ? AND date <= ?",
        )
        .bind(user.id, firstDay, lastDay)
        .all<DBDrinkEntry>();

      if (entries.length === 0) continue;

      const dailyTotals = new Map<string, number>();
      entries.forEach((entry: DBDrinkEntry) => {
        dailyTotals.set(
          entry.date,
          (dailyTotals.get(entry.date) || 0) + entry.count,
        );
      });

      const daysTracked = dailyTotals.size;
      const totalDrinks = Array.from(dailyTotals.values()).reduce(
        (sum, val) => sum + val,
        0,
      );
      const averagePerDay = totalDrinks / daysTracked;
      const id = crypto.randomUUID();

      await db
        .prepare(
          `INSERT INTO monthly_summaries (id, user_id, year, month, total_drinks, average_per_day, days_tracked)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id, year, month) DO UPDATE SET
             total_drinks = excluded.total_drinks,
             average_per_day = excluded.average_per_day,
             days_tracked = excluded.days_tracked`,
        )
        .bind(
          id,
          user.id,
          year,
          month,
          totalDrinks,
          averagePerDay,
          daysTracked,
        )
        .run();

      processedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} users for ${year}-${month}`,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
