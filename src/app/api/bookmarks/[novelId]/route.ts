import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";

async function requireUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  return userId ?? null;
}

export async function POST(_req: NextRequest, { params }: { params: { novelId: string } }) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Please log in to bookmark novels." }, { status: 401 });

  try {
    const { novels, bookmarks } = await collections();
    const novel = await novels.findOne({ slug: params.novelId });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    await bookmarks.updateOne(
      { userId: new ObjectId(userId), novelId: novel._id },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true, bookmarked: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { novelId: string } }) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const { novels, bookmarks } = await collections();
    const novel = await novels.findOne({ slug: params.novelId });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    await bookmarks.deleteOne({ userId: new ObjectId(userId), novelId: novel._id });
    return NextResponse.json({ ok: true, bookmarked: false });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}

// Assign/move a bookmark to a folder (or remove from folder with folderId: null).
export async function PATCH(req: NextRequest, { params }: { params: { novelId: string } }) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { folderId } = await req.json();

  try {
    const { novels, bookmarks } = await collections();
    const novel = await novels.findOne({ slug: params.novelId });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    await bookmarks.updateOne(
      { userId: new ObjectId(userId), novelId: novel._id },
      { $set: { folderId: folderId ? new ObjectId(folderId) : null } }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
