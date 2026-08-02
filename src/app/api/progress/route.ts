import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  novelSlug: z.string(),
  chapterNumber: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Please log in to save your progress." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  const { novelSlug, chapterNumber } = parsed.data;

  try {
    const { novels, chapters, readingProgress, bookmarks } = await collections();
    const novel = await novels.findOne({ slug: novelSlug });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    const chapter = await chapters.findOne({ novelId: novel._id, chapterNumber });
    const uid = new ObjectId(userId);

    await readingProgress.updateOne(
      { userId: uid, novelId: novel._id },
      {
        $set: {
          chapterId: chapter?._id ?? null,
          chapterNumber,
          scrollPercent: 0,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Saving progress on a novel you haven't bookmarked yet implicitly
    // bookmarks it too — otherwise it would never show up anywhere on
    // the profile dashboard.
    await bookmarks.updateOne(
      { userId: uid, novelId: novel._id },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
