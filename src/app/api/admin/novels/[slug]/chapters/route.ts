import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { novels, chapters } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    const docs = await chapters
      .find({ novelId: novel._id })
      .sort({ chapterNumber: 1 })
      .project({ content: 0 })
      .toArray();

    return NextResponse.json({
      chapters: docs.map((d) => ({ id: d._id.toString(), chapterNumber: d.chapterNumber, title: d.title })),
    });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}

const chapterInput = z.object({
  chapterNumber: z.number().int().positive(),
  title: z.string().min(1),
  content: z.string().min(1),
});

// Accepts either a single chapter or an array — the bulk-paste UI on the
// admin page sends an array parsed from a delimited text block, so this
// covers "bulk import" without needing a file-parsing library.
const bodySchema = z.union([chapterInput, z.array(chapterInput)]);

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chapter data." }, { status: 400 });
  }
  const chaptersInput = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
  if (chaptersInput.length === 0) {
    return NextResponse.json({ error: "No chapters provided." }, { status: 400 });
  }

  try {
    const { novels, chapters } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    const now = new Date();
    const docs = chaptersInput.map((c) => ({
      novelId: novel._id,
      chapterNumber: c.chapterNumber,
      title: c.title,
      slug: `chapter-${c.chapterNumber}`,
      content: c.content,
      wordCount: c.content.trim().split(/\s+/).length,
      status: "published" as const,
      publishedAt: now,
      updatedAt: now,
      views: 0,
    }));

    // Upsert each so re-pasting the same chapter numbers updates rather than duplicates.
    for (const doc of docs) {
      await chapters.updateOne(
        { novelId: novel._id, chapterNumber: doc.chapterNumber },
        { $set: doc },
        { upsert: true }
      );
    }

    const totalChapters = await chapters.countDocuments({ novelId: novel._id });
    await novels.updateOne(
      { _id: novel._id },
      { $set: { chapterCount: totalChapters, lastChapterAddedAt: now, updatedAt: now } }
    );

    // Notify everyone who has this novel bookmarked.
    const { bookmarks, notifications } = await collections();
    const bookmarkers = await bookmarks.find({ novelId: novel._id }).toArray();
    if (bookmarkers.length) {
      const addedCount = docs.length;
      await notifications.insertMany(
        bookmarkers.map((b) => ({
          userId: b.userId,
          type: "chapter_update" as const,
          payload: {
            message: `${novel.title} · ${addedCount} new chapter${addedCount > 1 ? "s" : ""} released`,
            link: `/novel/${novel.slug}`,
          },
          isRead: false,
          createdAt: now,
        }))
      );
    }

    return NextResponse.json({ ok: true, added: docs.length, totalChapters });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
