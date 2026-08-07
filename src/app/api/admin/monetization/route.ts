import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { setAdSettings, type AdSettings } from "@/lib/queries";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as Partial<AdSettings>;
  if (
    typeof body.enabled !== "boolean" ||
    !body.pageTypes ||
    !body.positions
  ) {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }

  try {
    await setAdSettings({
      enabled: body.enabled,
      pageTypes: {
        chapter: Boolean(body.pageTypes.chapter),
        novel: Boolean(body.pageTypes.novel),
        community: Boolean(body.pageTypes.community),
      },
      positions: {
        top: Boolean(body.positions.top),
        middle: Boolean(body.positions.middle),
        bottom: Boolean(body.positions.bottom),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/monetization POST]", err);
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
