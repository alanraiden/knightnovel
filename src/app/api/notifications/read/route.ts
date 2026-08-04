import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/queries";

// Called when the user opens the notification dropdown — clears the red
// badge by flipping isRead on everything currently unread for them.
export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  await markNotificationsRead(userId);
  return NextResponse.json({ ok: true });
}
