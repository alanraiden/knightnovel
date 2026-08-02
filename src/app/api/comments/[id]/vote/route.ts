import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({ direction: z.enum(["up", "down"]) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session || !userId) {
    return NextResponse.json({ error: "Please log in to vote." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid vote." }, { status: 400 });
  const { direction } = parsed.data;

  if (!ObjectId.isValid(params.id)) {
    // Local-only optimistic comment (not yet persisted) — nothing to vote on server-side.
    return NextResponse.json({ error: "This comment isn't saved yet." }, { status: 404 });
  }

  try {
    const { commentVotes, comments } = await collections();
    const commentId = new ObjectId(params.id);
    const voterId = new ObjectId(userId);

    const existing = await commentVotes.findOne({ userId: voterId, commentId });

    if (existing && existing.direction === direction) {
      await commentVotes.deleteOne({ _id: existing._id });
      await comments.updateOne({ _id: commentId }, { $inc: { [`votes.${direction}`]: -1 } });
    } else if (existing) {
      await commentVotes.updateOne({ _id: existing._id }, { $set: { direction } });
      await comments.updateOne(
        { _id: commentId },
        { $inc: { [`votes.${existing.direction}`]: -1, [`votes.${direction}`]: 1 } }
      );
    } else {
      await commentVotes.insertOne({ userId: voterId, commentId, direction });
      await comments.updateOne({ _id: commentId }, { $inc: { [`votes.${direction}`]: 1 } });
    }

    const updated = await comments.findOne({ _id: commentId });
    return NextResponse.json({ up: updated?.votes?.up ?? 0, down: updated?.votes?.down ?? 0 });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
