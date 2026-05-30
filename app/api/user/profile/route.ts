import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDB, type DBUser } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDB();
    const user = await db
      .prepare(
        "SELECT id, email, name, timezone FROM users WHERE id = ?",
      )
      .bind(session.user.id)
      .first<Pick<DBUser, "id" | "email" | "name" | "timezone">>();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, timezone } = await request.json();

    const db = getDB();

    const fields: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }
    if (timezone !== undefined) {
      fields.push("timezone = ?");
      values.push(timezone);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    fields.push("updated_at = datetime('now')");
    values.push(session.user.id);

    await db
      .prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    const user = await db
      .prepare("SELECT id, email, name, timezone FROM users WHERE id = ?")
      .bind(session.user.id)
      .first<Pick<DBUser, "id" | "email" | "name" | "timezone">>();

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
