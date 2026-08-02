import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { novels } = await collections();
    const novel = await novels.findOne({ slug: params.slug });
    if (!novel) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ novel });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
