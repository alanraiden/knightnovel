import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/queries";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ notifications: [] });

  const notifications = await getNotificationsForUser(userId);
  return NextResponse.json({ notifications });
}
