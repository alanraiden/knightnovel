import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

// Separate from the general novel-edit PATCH route on purpose: this only ever
// touches heroBackgroundUrl, so the Featured admin page can save it inline
// per-slide without needing to send (or risk overwriting) the rest of the
// novel's fields.
const bodySchema = z.object({
  slug: z.string().min(1),
  url: z.string(), // empty string clears it, falling back to the blurred cover
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  const { slug, url } = parsed.data;

  try {
    const { novels } = await collections();
    const result = await novels.updateOne({ slug }, { $set: { heroBackgroundUrl: url } });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Novel not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
