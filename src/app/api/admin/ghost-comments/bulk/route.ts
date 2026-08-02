import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { toTargetId } from "@/lib/server-utils";
import { z } from "zod";

const itemSchema = z.object({
  tempId: z.string(),
  parentTempId: z.string().nullable(),
  username: z.string().min(1).max(40),
  comment: z.string().min(1).max(2000),
  title: z.string().max(120).optional(),
  category: z.string().max(40).optional(),
  createdAt: z.string(),
});

const bodySchema = z.object({
  novelSlug: z.string(),
  chapterId: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid import data." }, { status: 400 });
  const { novelSlug, chapterId, items } = parsed.data;

  try {
    const { novels, comments } = await collections();
    const novel = await novels.findOne({ slug: novelSlug });
    if (!novel) return NextResponse.json({ error: "Novel not found" }, { status: 404 });

    const targetType = chapterId ? "chapter" : "novel";
    const targetId = toTargetId(chapterId ?? novelSlug);
    const adminId = session?.user ? (session.user as { id?: string }).id : undefined;

    // Insert sequentially (parents were flattened before children) so each
    // reply can look up its parent's freshly-assigned real ObjectId.
    const tempIdToRealId = new Map<string, ObjectId>();
    let inserted = 0;

    for (const item of items) {
      const parentId = item.parentTempId ? tempIdToRealId.get(item.parentTempId) ?? null : null;
      const result = await comments.insertOne({
        targetType,
        targetId,
        parentId,
        authorId: null,
        displayName: item.username,
        title: item.title,
        category: item.category,
        body: item.comment,
        isSpoiler: false,
        votes: { up: 0, down: 0 },
        reportCount: 0,
        status: "visible",
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(),
        isGhost: true,
        ghostCreatedBy: adminId,
      });
      tempIdToRealId.set(item.tempId, result.insertedId);
      inserted += 1;
    }

    return NextResponse.json({ ok: true, inserted });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
