import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { z } from "zod";

const bodySchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().max(2000).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session || !userId) return NextResponse.json({ rating: null, reviewText: "" });

  try {
    const { novels, ratingsReviews } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) return NextResponse.json({ rating: null, reviewText: "" });

    const existing = await ratingsReviews.findOne({ novelId: novel._id, userId: new ObjectId(userId) });
    return NextResponse.json({ rating: existing?.rating ?? null, reviewText: existing?.reviewText ?? "" });
  } catch {
    return NextResponse.json({ rating: null, reviewText: "" });
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session || !userId) {
    return NextResponse.json({ error: "Please log in to rate this novel." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
  }
  const { rating, reviewText } = parsed.data;

  try {
    const { novels, ratingsReviews } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) return NextResponse.json({ error: "Novel not found." }, { status: 404 });

    await ratingsReviews.updateOne(
      { novelId: novel._id, userId: new ObjectId(userId) },
      { $set: { rating, reviewText: reviewText || "", updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    // Recompute the novel's aggregate rating from all reviews.
    const agg = await ratingsReviews
      .aggregate([
        { $match: { novelId: novel._id } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ])
      .toArray();
    const { avg = rating, count = 1 } = agg[0] || {};

    await novels.updateOne(
      { _id: novel._id },
      { $set: { "counters.ratingAvg": Math.round(avg * 10) / 10, "counters.ratingCount": count } }
    );

    return NextResponse.json({ ok: true, ratingAvg: avg, ratingCount: count });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
