import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";

const fieldByPeriod: Record<string, string> = {
  day: "counters.viewsDaily",
  week: "counters.viewsWeekly",
  month: "counters.viewsMonthly",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "day";
  const field = fieldByPeriod[period] || fieldByPeriod.day;

  try {
    const { novels } = await collections();
    const results = await novels.find({}).sort({ [field]: -1 }).limit(20).toArray();
    return NextResponse.json({ period, novels: results });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
