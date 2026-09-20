import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { notifyIndexNow } from "@/lib/indexnow";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    const { chapters } = await collections();
    const chapter = await chapters.findOne({ _id: new ObjectId(params.id) });
    if (!chapter) return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
    return NextResponse.json({
      id: chapter._id.toString(),
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      content: chapter.content,
    });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}

const updateSchema = z.object({ title: z.string().min(1), content: z.string().min(1) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Title and content are required." }, { status: 400 });

  try {
    const { chapters, novels } = await collections();
    const chapter = await chapters.findOne({ _id: new ObjectId(params.id) });
    if (!chapter) return NextResponse.json({ error: "Chapter not found." }, { status: 404 });

    const result = await chapters.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          title: parsed.data.title,
          content: parsed.data.content,
          wordCount: parsed.data.content.trim().split(/\s+/).length,
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: "Chapter not found." }, { status: 404 });

    // Notify search engines: the chapter content changed.
    const novel = await novels.findOne({ _id: chapter.novelId });
    if (novel) {
      void notifyIndexNow(`/novel/${novel.slug}/chapter/${chapter.chapterNumber}`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    const { chapters, novels } = await collections();
    const chapter = await chapters.findOne({ _id: new ObjectId(params.id) });
    if (!chapter) return NextResponse.json({ error: "Chapter not found." }, { status: 404 });

    await chapters.deleteOne({ _id: chapter._id });
    const totalChapters = await chapters.countDocuments({ novelId: chapter.novelId });
    await novels.updateOne({ _id: chapter.novelId }, { $set: { chapterCount: totalChapters } });

    // Notify search engines: the novel page changed (chapterCount updated).
    // IndexNow for the deleted chapter URL signals engines to recrawl and drop it.
    const novel = await novels.findOne({ _id: chapter.novelId });
    if (novel) {
      void notifyIndexNow([
        `/novel/${novel.slug}/chapter/${chapter.chapterNumber}`,
        `/novel/${novel.slug}`,
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
