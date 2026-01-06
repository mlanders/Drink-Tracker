import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTodayInTimezone } from "@/lib/dateUtils";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get timezone from query param or use session timezone or default
    const { searchParams } = new URL(request.url);
    const timezone =
      searchParams.get("timezone") ||
      (session.user as any).timezone ||
      "America/Los_Angeles";

    // Calculate today in the user's timezone
    const today = getTodayInTimezone(timezone);

    const entries = await prisma.drinkEntry.findMany({
      where: {
        userId: session.user.id,
        date: today,
      },
    });

    const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);

    return NextResponse.json({ count: Math.max(0, totalCount) });
  } catch (error) {
    console.error("Error fetching today's count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
