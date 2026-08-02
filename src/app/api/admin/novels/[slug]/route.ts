import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  authors: z.array(z.string()).default([]),
  altTitles: z.array(z.string()).default([]),
  genres: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["ongoing", "completed", "hiatus", "dropped"]),
  country: z.enum(["chinese", "korean", "japanese"]),
  coverImageUrl: z.string().default(""),
});

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });

  try {
    const { novels } = await collections();
    const result = await novels.updateOne(
      { slug: params.slug },
      { $set: { ...parsed.data, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: "Novel not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { novels, chapters } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    await chapters.deleteMany({ novelId: novel._id });
    await novels.deleteOne({ _id: novel._id });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
