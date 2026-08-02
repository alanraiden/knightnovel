import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { toTargetId } from "@/lib/server-utils";
import { z } from "zod";

const bodySchema = z.object({
  novelSlug: z.string(),
  chapterId: z.string().optional(), // if omitted, defaults to a novel-level comment
  displayName: z.string().min(1).max(40),
  title: z.string().max(120).optional(),
  category: z.string().max(40).optional(),
  body: z.string().min(1).max(2000),
  createdAt: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { novelSlug, chapterId, displayName, title, category, body, createdAt } = parsed.data;

  const { novels, comments } = await collections();
  const novel = await novels.findOne({ slug: novelSlug });
  if (!novel) return NextResponse.json({ error: "Novel not found" }, { status: 404 });

  // Novel-level discussion is keyed by the novel's slug everywhere else in
  // the app (see getComments/queries.ts) — this previously used novel._id,
  // which meant novel-level ghost comments never actually showed up.
  const targetType = chapterId ? "chapter" : "novel";
  const targetId = toTargetId(chapterId ?? novelSlug);

  await comments.insertOne({
    targetType,
    targetId,
    parentId: null,
    authorId: null, // no real user behind a ghost comment
    displayName,
    title,
    category,
    body,
    isSpoiler: false,
    votes: { up: 0, down: 0 },
    reportCount: 0,
    status: "visible",
    createdAt: new Date(createdAt),
    updatedAt: new Date(),
    isGhost: true,
    ghostCreatedBy: session?.user ? (session.user as { id?: string }).id : undefined,
  });

  return NextResponse.json({ ok: true });
}
