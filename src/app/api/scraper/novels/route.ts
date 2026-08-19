import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";

// ── Scraper API key guard ────────────────────────────────────────────────────
function checkKey(req: NextRequest): boolean {
  const expected = process.env.SCRAPER_API_KEY || "";
  if (!expected) return false;
  const provided =
    req.headers.get("x-scraper-key") ||
    new URL(req.url).searchParams.get("key") ||
    "";
  return provided.trim() === expected.trim();
}

// GET /api/scraper/novels
// Returns all novels (no pagination cap) for the scraper dashboard sidebar.
export async function GET(req: NextRequest) {
  if (!checkKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { novels } = await collections();
    const results = await novels
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ novels: results, total: results.length });
  } catch (err) {
    console.error("[scraper/novels] DB error:", err);
    return NextResponse.json(
      { error: "Database error. Check MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
