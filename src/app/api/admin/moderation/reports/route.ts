import { NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { reports } = await collections();
    const docs = await reports.find({ status: "open" }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({
      reports: docs.map((d) => ({
        id: d._id.toString(),
        targetType: d.targetType,
        targetId: String(d.targetId),
        reason: d.reason,
        details: d.details,
        reporterEmail: d.reporterEmail,
        createdAt: d.createdAt,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
