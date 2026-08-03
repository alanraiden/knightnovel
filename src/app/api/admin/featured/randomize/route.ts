import { NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { novels } = await collections();
    const count = Math.min(5, await novels.countDocuments({}));
    const picked = await novels.aggregate([{ $sample: { size: count } }]).toArray();

    await novels.updateMany({}, { $set: { isFeatured: false }, $unset: { featuredOrder: "" } });
    await Promise.all(
      picked.map((n, i) =>
        novels.updateOne({ _id: n._id }, { $set: { isFeatured: true, featuredOrder: i } })
      )
    );

    return NextResponse.json({ ok: true, slugs: picked.map((n) => n.slug) });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
