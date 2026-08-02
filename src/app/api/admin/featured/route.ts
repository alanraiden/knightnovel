import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const bodySchema = z.object({ slugs: z.array(z.string()).max(6) });

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  const { slugs } = parsed.data;

  try {
    const { novels } = await collections();
    // Unset everyone, then set the chosen ones in order — simplest way to
    // guarantee no stale featured novels linger if they're removed from the list.
    await novels.updateMany({}, { $set: { isFeatured: false }, $unset: { featuredOrder: "" } });
    await Promise.all(
      slugs.map((slug, i) =>
        novels.updateOne({ slug }, { $set: { isFeatured: true, featuredOrder: i } })
      )
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
