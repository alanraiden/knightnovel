import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const bodySchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  isPinned: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Title and message are required." }, { status: 400 });

  try {
    const { announcements } = await collections();
    await announcements.insertOne({
      ...parsed.data,
      publishedAt: new Date(),
      createdBy: (session.user as { id?: string }).id,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
