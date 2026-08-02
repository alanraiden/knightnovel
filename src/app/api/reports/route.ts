import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { notifyAdmin } from "@/lib/resend";
import { z } from "zod";

const bodySchema = z.object({
  targetType: z.enum(["novel", "comment", "review", "user"]),
  targetId: z.string(),
  targetLabel: z.string().optional(), // human-readable, e.g. novel title — for the email only
  reason: z.string().min(1),
  details: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please log in to submit a report." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in the required fields." }, { status: 400 });
  }
  const { targetType, targetId, targetLabel, reason, details } = parsed.data;

  try {
    const { reports } = await collections();
    await reports.insertOne({
      targetType,
      targetId,
      reporterEmail: session.user?.email,
      reason,
      details: details || "",
      status: "open",
      createdAt: new Date(),
    });

    // Best-effort — a missing/broken email config shouldn't fail the report itself.
    await notifyAdmin(
      `New report: ${targetType} — ${reason}`,
      `Reported by: ${session.user?.email}\nTarget: ${targetType} ${targetLabel || targetId}\nReason: ${reason}\nDetails: ${details || "(none)"}`
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
