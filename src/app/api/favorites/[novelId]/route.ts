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
  if (!userId) return NextResponse.json({ error: "Please log in to favorite novels." }, { status: 401 });

  try {
    const { novels, favorites } = await collections();
    const novel = await novels.findOne({ slug: params.novelId });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    await favorites.updateOne(
      { userId: new ObjectId(userId), novelId: novel._id },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    await novels.updateOne({ _id: novel._id }, { $inc: { "counters.favorites": 1 } });
    return NextResponse.json({ ok: true, favorited: true });
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
    const { novels, favorites } = await collections();
    const novel = await novels.findOne({ slug: params.novelId });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    const result = await favorites.deleteOne({ userId: new ObjectId(userId), novelId: novel._id });
    if (result.deletedCount) {
      await novels.updateOne({ _id: novel._id }, { $inc: { "counters.favorites": -1 } });
    }
    return NextResponse.json({ ok: true, favorited: false });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
