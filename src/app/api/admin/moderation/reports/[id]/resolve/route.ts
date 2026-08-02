import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const bodySchema = z.object({ action: z.enum(["dismiss", "remove"]) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  try {
    const { reports, comments } = await collections();
    const report = await reports.findOne({ _id: new ObjectId(params.id) });
    if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

    if (parsed.data.action === "remove" && report.targetType === "comment" && ObjectId.isValid(String(report.targetId))) {
      await comments.updateOne({ _id: new ObjectId(String(report.targetId)) }, { $set: { status: "removed" } });
    }

    await reports.updateOne(
      { _id: report._id },
      { $set: { status: parsed.data.action === "remove" ? "resolved" : "dismissed" } }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
