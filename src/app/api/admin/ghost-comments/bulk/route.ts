import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { createHash } from "crypto";
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
  /** https:// URL from an Image: line in the import format — stored as stickerUrl */
  imageUrl: z.string().url().optional(),
  createdAt: z.string(),
});

const bodySchema = z.object({
  novelSlug: z.string(),
  chapterId: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

/** Build a deterministic fingerprint for an import item so we can skip duplicates. */
function makeImportHash(
  novelSlug: string,
  chapterId: string | undefined,
  item: z.infer<typeof itemSchema>
): string {
  // Normalise the date to day-level so re-imports with slight timestamp drift still match.
  const dateDay = item.createdAt.slice(0, 10);
  const raw = [novelSlug, chapterId ?? "", item.username, item.comment, dateDay].join("|");
  return createHash("sha256").update(raw).digest("hex");
}

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
    let skipped = 0;

    for (const item of items) {
      const importHash = makeImportHash(novelSlug, chapterId, item);

      // Duplicate protection — skip if a comment with this fingerprint already exists.
      const existing = await comments.findOne({ importHash });
      if (existing) {
        // Still track its real _id so child replies can resolve parentId correctly.
        if (existing._id) tempIdToRealId.set(item.tempId, existing._id);
        skipped += 1;
        continue;
      }

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
        stickerUrl: item.imageUrl, // from Image: line in the import format
        isSpoiler: false,
        votes: { up: 0, down: 0 },
        reportCount: 0,
        status: "visible",
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(),
        isGhost: true,
        ghostCreatedBy: adminId,
        importHash,
      });
      tempIdToRealId.set(item.tempId, result.insertedId);
      inserted += 1;
    }

    return NextResponse.json({ ok: true, inserted, skipped });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Surface the real error — the old generic message hid connection/auth failures.
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

