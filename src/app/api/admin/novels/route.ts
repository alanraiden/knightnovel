import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const bodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().default(""),
  authors: z.array(z.string()).default([]),
  altTitles: z.array(z.string()).default([]),
  genres: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["ongoing", "completed", "hiatus", "dropped"]).default("ongoing"),
  country: z.enum(["chinese", "korean", "japanese"]).default("chinese"),
  coverImageUrl: z.string().default(""),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const { novels } = await collections();
    const existing = await novels.findOne({ slug: input.slug });
    if (existing) {
      return NextResponse.json({ error: "A novel with this slug already exists." }, { status: 409 });
    }

    const now = new Date();
    await novels.insertOne({
      ...input,
      chapterCount: 0,
      wordCount: 0,
      counters: {
        viewsTotal: 0,
        viewsDaily: 0,
        viewsWeekly: 0,
        viewsMonthly: 0,
        favorites: 0,
        ratingAvg: 0,
        ratingCount: 0,
        commentCount: 0,
      },
      isFeatured: false,
      featuredHighlight: false,
      relatedNovelIds: [],
      createdAt: now,
      updatedAt: now,
      lastChapterAddedAt: now,
      seo: { metaTitle: input.title, metaDescription: input.description },
    });

    return NextResponse.json({ ok: true, slug: input.slug });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
