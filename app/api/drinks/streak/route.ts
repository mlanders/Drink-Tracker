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

    const db = getDB();
    const { results: entries } = await db
      .prepare(
        "SELECT * FROM drink_entries WHERE user_id = ? ORDER BY date DESC",
      )
      .bind(session.user.id)
      .all<DBDrinkEntry>();

    if (entries.length === 0) {
      return NextResponse.json({
        currentTrackingStreak: 0,
        longestTrackingStreak: 0,
        currentSoberStreak: 0,
        longestSoberStreak: 0,
        lastTrackedDate: null,
      });
    }

    // Group entries by date and sum counts
    const dailyTotals = new Map<string, number>();
    entries.forEach((entry) => {
      dailyTotals.set(
        entry.date,
        (dailyTotals.get(entry.date) || 0) + entry.count,
      );
    });

    const trackedDates = Array.from(dailyTotals.keys()).sort().reverse();

    if (trackedDates.length === 0) {
      return NextResponse.json({
        currentTrackingStreak: 0,
        longestTrackingStreak: 0,
        currentSoberStreak: 0,
        longestSoberStreak: 0,
        lastTrackedDate: null,
      });
    }

    const today = getTodayInTimezone(timezone);
    const todayString = today.toISOString().split("T")[0];

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    let currentTrackingStreak = 0;
    let checkDate: Date;

    if (trackedDates[0] === todayString) {
      checkDate = today;
      currentTrackingStreak = 1;
    } else if (trackedDates[0] === yesterdayString) {
      checkDate = yesterday;
      currentTrackingStreak = 1;
    } else {
      checkDate = new Date(0);
    }

    if (currentTrackingStreak > 0) {
      for (let i = 1; i < trackedDates.length; i++) {
        const prevDate = new Date(checkDate);
        prevDate.setUTCDate(prevDate.getUTCDate() - 1);
        const prevDateString = prevDate.toISOString().split("T")[0];

        if (trackedDates[i] === prevDateString) {
          currentTrackingStreak++;
          checkDate = prevDate;
        } else {
          break;
        }
      }
    }

    let longestTrackingStreak = 0;
    let tempStreak = 1;

    for (let i = 0; i < trackedDates.length - 1; i++) {
      const currentDate = new Date(trackedDates[i] + "T00:00:00Z");
      const nextDate = new Date(trackedDates[i + 1] + "T00:00:00Z");
      const dayDiff = Math.floor(
        (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestTrackingStreak = Math.max(longestTrackingStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestTrackingStreak = Math.max(longestTrackingStreak, tempStreak);

    const soberDates = trackedDates.filter(
      (date) => dailyTotals.get(date) === 0,
    );

    let currentSoberStreak = 0;
    let checkSoberDate: Date;

    if (soberDates.length > 0) {
      if (soberDates[0] === todayString) {
        checkSoberDate = today;
        currentSoberStreak = 1;
      } else if (soberDates[0] === yesterdayString) {
        checkSoberDate = yesterday;
        currentSoberStreak = 1;
      } else {
        checkSoberDate = new Date(0);
      }

      if (currentSoberStreak > 0) {
        for (let i = 1; i < soberDates.length; i++) {
          const prevDate = new Date(checkSoberDate);
          prevDate.setUTCDate(prevDate.getUTCDate() - 1);
          const prevDateString = prevDate.toISOString().split("T")[0];

          if (soberDates[i] === prevDateString) {
            currentSoberStreak++;
            checkSoberDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    let longestSoberStreak = 0;
    let tempSoberStreak = 1;

    for (let i = 0; i < soberDates.length - 1; i++) {
      const currentDate = new Date(soberDates[i] + "T00:00:00Z");
      const nextDate = new Date(soberDates[i + 1] + "T00:00:00Z");
      const dayDiff = Math.floor(
        (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff === 1) {
        tempSoberStreak++;
      } else {
        longestSoberStreak = Math.max(longestSoberStreak, tempSoberStreak);
        tempSoberStreak = 1;
      }
    }
    longestSoberStreak = Math.max(longestSoberStreak, tempSoberStreak);

    return NextResponse.json({
      currentTrackingStreak,
      longestTrackingStreak,
      currentSoberStreak,
      longestSoberStreak,
      lastTrackedDate: trackedDates[0],
    });
  } catch (error) {
    console.error("Error calculating streak:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
