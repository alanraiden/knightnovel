import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminOverviewData } from "@/lib/queries";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await getAdminOverviewData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/overview] error:", err);
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
