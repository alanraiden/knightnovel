import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * POST /api/admin/novels/[slug]/sync-chapters
 *
 * Recounts the actual chapter documents in the DB for this novel and writes
 * the real count back to novel.chapterCount.  Call this whenever the stored
 * count drifts out of sync (e.g. chapters were deleted outside the admin UI,
 * or the count was set too high during a bulk import).
 */
export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { novels, chapters } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    const realCount = await chapters.countDocuments({ novelId: novel._id });
    await novels.updateOne(
      { _id: novel._id },
      { $set: { chapterCount: realCount, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true, chapterCount: realCount });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}

/**
 * DELETE /api/admin/novels/[slug]/sync-chapters
 *
 * Removes every chapter document that has no real content
 * (wordCount === 0, wordCount missing, or content is blank/whitespace),
 * then resyncs novel.chapterCount to the remaining real chapters.
 * Returns the chapter numbers that were removed and the new count.
 */
export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // The unique substring that appears in the default placeholder content that
  // gets shown (and can be accidentally saved) when a chapter has no real text.
  const PLACEHOLDER_MARKER = "This is placeholder text";

  try {
    const { novels, chapters } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    // Pull every chapter with its content so we can inspect it.
    // We only fetch the first 200 chars of content — enough to catch the
    // placeholder marker without loading the full text of all real chapters.
    const allChapters = await chapters
      .find({ novelId: novel._id })
      .project({ chapterNumber: 1, wordCount: 1, content: { $substr: ["$content", 0, 200] } })
      .toArray();

    const emptyIds = allChapters
      .filter((d) => {
        const wc = d.wordCount ?? 0;
        const content = (d.content ?? "").trim();
        // Delete if: no content, blank, or contains the placeholder marker text.
        return wc === 0 || content === "" || content.includes(PLACEHOLDER_MARKER);
      })
      .map((d) => d._id);

    const removedNumbers = allChapters
      .filter((d) => emptyIds.some((id) => id.equals(d._id)))
      .map((d) => d.chapterNumber as number)
      .sort((a, b) => a - b);

    if (emptyIds.length > 0) {
      await chapters.deleteMany({ _id: { $in: emptyIds } });
    }

    const newCount = await chapters.countDocuments({ novelId: novel._id });
    await novels.updateOne(
      { _id: novel._id },
      { $set: { chapterCount: newCount, updatedAt: new Date() } }
    );

    return NextResponse.json({
      ok: true,
      deleted: emptyIds.length,
      removedChapterNumbers: removedNumbers,
      chapterCount: newCount,
    });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}

