import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
