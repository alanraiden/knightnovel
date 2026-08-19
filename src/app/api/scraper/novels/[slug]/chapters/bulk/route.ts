import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";

// ── Scraper API key guard ────────────────────────────────────────────────────
function checkKey(req: NextRequest): boolean {
  const expected = process.env.SCRAPER_API_KEY || "";
  if (!expected) return false;
  const provided =
    req.headers.get("x-scraper-key") ||
    new URL(req.url).searchParams.get("key") ||
    "";
  return provided.trim() === expected.trim();
}

// POST /api/scraper/novels/[slug]/chapters/bulk
// Bulk-import scraped chapters. Uses upsert so re-running is safe.
// Body: { chapters: [{ number, title, content }], skipDuplicates?: boolean }
//
// This route mirrors the POST handler on /chapters so the scraper dashboard
// can call /chapters/bulk (explicit path) without ambiguity.
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!checkKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { chapters?: { number: number; title: string; content: string }[]; skipDuplicates?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const chaptersInput = body.chapters;
  if (!Array.isArray(chaptersInput) || chaptersInput.length === 0) {
    return NextResponse.json({ error: "chapters array is required." }, { status: 400 });
  }

  try {
    const { novels, chapters, bookmarks, notifications } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) {
      return NextResponse.json({ error: "Novel not found." }, { status: 404 });
    }

    const now = new Date();
    let created = 0;
    let skipped = 0;
    const errors: { number: number; reason: string }[] = [];

    for (const c of chaptersInput) {
      if (!c.number || !c.title || !c.content) {
        errors.push({ number: c.number ?? 0, reason: "Missing number, title, or content" });
        continue;
      }

      try {
        const doc = {
          novelId: novel._id,
          chapterNumber: c.number,
          title: c.title,
          slug: `chapter-${c.number}`,
          content: c.content,
          wordCount: c.content.trim().split(/\s+/).length,
          status: "published" as const,
          publishedAt: now,
          updatedAt: now,
          views: 0,
        };

        const existing = await chapters.findOne({
          novelId: novel._id,
          chapterNumber: c.number,
        });

        if (existing && body.skipDuplicates !== false) {
          skipped++;
          continue;
        }

        await chapters.updateOne(
          { novelId: novel._id, chapterNumber: c.number },
          { $set: doc },
          { upsert: true }
        );
        created++;
      } catch (e) {
        errors.push({ number: c.number, reason: String(e) });
      }
    }

    // Update novel's chapterCount and lastChapterAddedAt
    if (created > 0) {
      const totalChapters = await chapters.countDocuments({ novelId: novel._id });
      await novels.updateOne(
        { _id: novel._id },
        { $set: { chapterCount: totalChapters, lastChapterAddedAt: now, updatedAt: now } }
      );

      // Notify bookmarkers
      try {
        const bookmarkers = await bookmarks.find({ novelId: novel._id }).toArray();
        if (bookmarkers.length) {
          await notifications.insertMany(
            bookmarkers.map((b) => ({
              userId: b.userId,
              type: "chapter_update" as const,
              payload: {
                novelId: novel._id,
                message: `${novel.title} · ${created} new chapter${created > 1 ? "s" : ""} released`,
                link: `/novel/${novel.slug}`,
              },
              isRead: false,
              createdAt: now,
            }))
          );
        }
      } catch {
        // Notifications are best-effort, don't fail the whole request
      }
    }

    return NextResponse.json({
      ok: true,
      created,
      skipped,
      errors,
      message: `${created} uploaded, ${skipped} skipped, ${errors.length} errors`,
    });
  } catch (err) {
    console.error("[scraper/novels/[slug]/chapters/bulk POST] DB error:", err);
    return NextResponse.json({ error: "Database error." }, { status: 503 });
  }
}
