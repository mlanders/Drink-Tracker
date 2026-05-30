import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const db = getDB();

    const existing = await db
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(email)
      .first();

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID();

    await db
      .prepare(
        "INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)",
      )
      .bind(id, email, hashedPassword, name || null)
      .run();

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
