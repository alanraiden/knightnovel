import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";

const PAGE_SIZE = 30;

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");

  try {
    const { novels, chapters } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const results = await chapters
      .find({ novelId: novel._id, status: "published" })
      .sort({ chapterNumber: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .project({ content: 0 }) // list view doesn't need full chapter text
      .toArray();

    const totalChapters = await chapters.countDocuments({ novelId: novel._id, status: "published" });

    return NextResponse.json({
      chapters: results,
      totalChapters,
      hasMore: page * PAGE_SIZE < totalChapters,
    });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
