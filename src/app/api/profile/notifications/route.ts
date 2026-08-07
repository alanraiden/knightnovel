import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import type { NotificationSettings } from "@/lib/queries";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Partial<NotificationSettings>;
  const settings: NotificationSettings = {
    reply: body.reply !== false,
    mention: body.mention !== false,
    chapter_update: body.chapter_update !== false,
    announcement: body.announcement !== false,
  };

  try {
    const { users } = await collections();
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: { notificationSettings: settings } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile/notifications PATCH]", err);
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
