import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre");
  const tag = searchParams.get("tag"); // comma-separated
  const status = searchParams.get("status");
  const country = searchParams.get("country");
  const sort = searchParams.get("sort") || "popular";
  const page = Number(searchParams.get("page") || "1");
  const limit = 24;

  const filter: Record<string, unknown> = {};
  if (genre) filter.genres = genre;
  if (tag) filter.tags = { $in: tag.split(",") };
  if (status) filter.status = status;
  if (country) filter.country = country;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    popular: { "counters.viewsTotal": -1 },
    rated: { "counters.ratingAvg": -1 },
    ascending: { title: 1 },
    descending: { title: -1 },
  };

  try {
    const { novels } = await collections();
    const results = await novels
      .find(filter)
      .sort(sortMap[sort] || sortMap.popular)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    const total = await novels.countDocuments(filter);

    return NextResponse.json({ novels: results, total, page, limit });
  } catch (err) {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
