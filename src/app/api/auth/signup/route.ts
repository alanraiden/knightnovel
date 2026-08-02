import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { collections } from "@/lib/db";

const bodySchema = z.object({
  displayName: z.string().min(2).max(40),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { displayName, email, password } = parsed.data;

  try {
    const { users } = await collections();

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const username = email.split("@")[0] + "-" + Math.random().toString(36).slice(2, 6);
    const now = new Date();

    await users.insertOne({
      username,
      email,
      passwordHash,
      displayName,
      role: "user",
      createdAt: now,
      lastActiveAt: now,
      stats: { chaptersRead: 0, favoritesCount: 0, commentsCount: 0 },
      settings: { theme: "dark", fontSize: 16, fontFamily: "serif", lineHeight: 1.8 },
      status: "active",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
