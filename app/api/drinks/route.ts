import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count } = await request.json();

    if (count !== 1 && count !== -1) {
      return NextResponse.json(
        { error: "Count must be 1 or -1" },
        { status: 400 },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await prisma.drinkEntry.create({
      data: {
        userId: session.user.id,
        count,
        date: today,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Error creating drink entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
