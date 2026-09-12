import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { toTargetId } from "@/lib/server-utils";
import { z } from "zod";

const bodySchema = z.object({
  novelSlug: z.string(),
  chapterId: z.string().optional(), // if omitted, defaults to a novel-level comment
  parentId: z.string().optional(),  // ObjectId string of parent comment (for replies)
  displayName: z.string().min(1).max(40),
  title: z.string().max(120).optional(),
  category: z.string().max(40).optional(),
  body: z.string().min(1).max(2000),
  stickerUrl: z.string().url().optional(), // image attached to the comment (uploaded via /api/uploads/sticker)
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
  const { novelSlug, chapterId, parentId, displayName, title, category, body, stickerUrl, createdAt } = parsed.data;

  const { novels, comments } = await collections();
  const novel = await novels.findOne({ slug: novelSlug });
  if (!novel) return NextResponse.json({ error: "Novel not found" }, { status: 404 });

  // Novel-level discussion is keyed by the novel's slug everywhere else in
  // the app (see getComments/queries.ts) — this previously used novel._id,
  // which meant novel-level ghost comments never actually showed up.
  const targetType = chapterId ? "chapter" : "novel";
  const targetId = toTargetId(chapterId ?? novelSlug);

  // Resolve parentId — must be a valid ObjectId of an existing comment
  let resolvedParentId: ObjectId | null = null;
  if (parentId && ObjectId.isValid(parentId)) {
    const parent = await comments.findOne({ _id: new ObjectId(parentId) });
    if (parent) resolvedParentId = parent._id as ObjectId;
  }

  const result = await comments.insertOne({
    targetType,
    targetId,
    parentId: resolvedParentId,
    authorId: null, // no real user behind a ghost comment
    displayName,
    title,
    category,
    body,
    stickerUrl: stickerUrl ?? null,
    isSpoiler: false,
    votes: { up: 0, down: 0 },
    reportCount: 0,
    status: "visible",
    createdAt: new Date(createdAt),
    updatedAt: new Date(),
    isGhost: true,
    ghostCreatedBy: session?.user ? (session.user as { id?: string }).id : undefined,
  });

  return NextResponse.json({ ok: true, id: result.insertedId.toString() });
}
