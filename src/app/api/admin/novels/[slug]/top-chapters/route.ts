import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { getTopChaptersByViews } from "@/lib/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const chapters = await getTopChaptersByViews(params.slug, 10);
    return NextResponse.json({ chapters });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
