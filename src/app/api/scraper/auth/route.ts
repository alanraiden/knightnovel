import { NextRequest, NextResponse } from "next/server";

// POST /api/scraper/auth
// Body: { apiKey: string }
// Validates the scraper API key and returns a user object for the dashboard.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provided = (body?.apiKey || "").trim();
    const expected = process.env.SCRAPER_API_KEY || "";

    if (!expected) {
      return NextResponse.json(
        { error: "SCRAPER_API_KEY is not configured on the server." },
        { status: 503 }
      );
    }

    if (!provided || provided !== expected) {
      return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: { name: "Scraper Admin", role: "admin" },
    });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}
