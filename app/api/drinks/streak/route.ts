import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all drink entries for the user, ordered by date descending
    const entries = await prisma.drinkEntry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    if (entries.length === 0) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastTrackedDate: null,
      });
    }

    // Group entries by date and sum counts
    const dailyTotals = new Map<string, number>();
    entries.forEach((entry) => {
      const dateKey = entry.date.toISOString().split("T")[0];
      dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + entry.count);
    });

    // Get unique dates with entries (tracked days - includes zero confirmations)
    // A day is tracked if it has any entries, regardless of count
    const trackedDates = Array.from(dailyTotals.entries())
      .filter(([date]) => dailyTotals.has(date)) // Keep all tracked dates, including zeros
      .map(([date]) => date)
      .sort()
      .reverse();

    if (trackedDates.length === 0) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastTrackedDate: null,
      });
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    // Check if we have data for today or yesterday
    let checkDate: Date;
    if (trackedDates[0] === todayString) {
      checkDate = today;
      currentStreak = 1;
    } else if (trackedDates[0] === yesterdayString) {
      checkDate = yesterday;
      currentStreak = 1;
    } else {
      // Streak is broken
      checkDate = new Date(0);
    }

    // Count consecutive days backwards
    if (currentStreak > 0) {
      for (let i = 1; i < trackedDates.length; i++) {
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateString = prevDate.toISOString().split("T")[0];

        if (trackedDates[i] === prevDateString) {
          currentStreak++;
          checkDate = prevDate;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 0; i < trackedDates.length - 1; i++) {
      const currentDate = new Date(trackedDates[i]);
      const nextDate = new Date(trackedDates[i + 1]);
      const dayDiff = Math.floor(
        (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return NextResponse.json({
      currentStreak,
      longestStreak,
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
