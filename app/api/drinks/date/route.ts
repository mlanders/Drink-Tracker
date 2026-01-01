import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateString = searchParams.get("date");

    if (!dateString) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    const entries = await prisma.drinkEntry.findMany({
      where: {
        userId: session.user.id,
        date: targetDate,
      },
    });

    const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);

    return NextResponse.json({ count: Math.max(0, totalCount) });
  } catch (error) {
    console.error("Error fetching date count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
