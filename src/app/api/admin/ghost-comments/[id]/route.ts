import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth-helpers";
import { collections } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  body: z.string().min(1).max(2000).optional(),
  displayName: z.string().min(1).max(40).optional(),
  createdAt: z.string().optional(),
  status: z.enum(["visible", "hidden", "removed"]).optional(),
});

// Collect all descendant comment IDs for a given parent ID.
async function collectDescendantIds(
  parentId: ObjectId,
  commentsCol: Awaited<ReturnType<typeof collections>>["comments"]
): Promise<ObjectId[]> {
  const result: ObjectId[] = [];
  const queue = [parentId];
  while (queue.length) {
    const current = queue.shift()!;
    const children = await commentsCol
      .find({ parentId: current })
      .project({ _id: 1 })
      .toArray();
    for (const c of children) {
      result.push(c._id as ObjectId);
      queue.push(c._id as ObjectId);
    }
  }
  return result;
}

// Resync counters.commentCount on the novel that owns this comment's target.
// Best-effort — we don't fail the request if this step errors.
async function resyncCommentCount(
  commentId: ObjectId,
  commentsCol: Awaited<ReturnType<typeof collections>>["comments"],
  novelsCol: Awaited<ReturnType<typeof collections>>["novels"]
) {
  try {
    const doc = await commentsCol.findOne({ _id: commentId });
    if (!doc) return;

    // Novel-level: targetId is the slug string
    // Chapter-level: targetId is an ObjectId — look up novel via chapter
    let novel: Awaited<ReturnType<typeof novelsCol.findOne>> | null = null;
    if (doc.targetType === "novel") {
      novel = await novelsCol.findOne({ slug: doc.targetId as string });
    }
    if (!novel) return;

    const visibleCount = await commentsCol.countDocuments({
      targetType: doc.targetType,
      targetId: doc.targetId,
      status: "visible",
    });
    await novelsCol.updateOne(
      { _id: (novel as { _id: ObjectId })._id },
      { $set: { "counters.commentCount": visibleCount, updatedAt: new Date() } }
    );
  } catch {
    // Non-fatal
  }
}

// PATCH /api/admin/ghost-comments/[id]
// Ghost comments: edits body, displayName, createdAt, status.
// Real user comments: only status changes allowed (no body/username edits).
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { comments, novels } = await collections();
    const existing = await comments.findOne({ _id: new ObjectId(params.id) });
    if (!existing) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const isGhost = Boolean(existing.isGhost);

    // Real user comments: only status changes allowed
    if (!isGhost && (parsed.data.body !== undefined || parsed.data.displayName !== undefined)) {
      return NextResponse.json(
        { error: "Body and displayName edits are not allowed on real user comments. Only status changes are permitted." },
        { status: 403 }
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.body !== undefined) updates.body = parsed.data.body;
    if (parsed.data.displayName !== undefined) updates.displayName = parsed.data.displayName;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.createdAt !== undefined) updates.createdAt = new Date(parsed.data.createdAt);

    await comments.updateOne({ _id: new ObjectId(params.id) }, { $set: updates });

    // Resync count if visibility changed
    if (parsed.data.status !== undefined) {
      await resyncCommentCount(new ObjectId(params.id), comments, novels);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

// DELETE /api/admin/ghost-comments/[id]?permanent=true
//
// Default (no ?permanent):  soft-hide — sets status:"hidden" on the comment
//   AND all its descendants. Reversible. Resyncs novel comment count.
//
// ?permanent=true:  hard-deletes the comment AND all descendants from the DB.
//   Irreversible. Use only after explicit confirmation in the UI.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
  }

  const permanent = new URL(req.url).searchParams.get("permanent") === "true";
  const rootId = new ObjectId(params.id);

  try {
    const { comments, novels } = await collections();

    // Collect the root + all descendants
    const descendantIds = await collectDescendantIds(rootId, comments);
    const allIds = [rootId, ...descendantIds];

    if (permanent) {
      await comments.deleteMany({ _id: { $in: allIds } });
    } else {
      // Soft-hide: mark as hidden so they disappear from visitor-facing queries
      // but remain recoverable via the moderation panel.
      await comments.updateMany(
        { _id: { $in: allIds } },
        { $set: { status: "hidden", updatedAt: new Date() } }
      );
    }

    // Resync novel comment count (best-effort, uses root comment's target)
    await resyncCommentCount(rootId, comments, novels);

    return NextResponse.json({
      ok: true,
      affected: allIds.length,
      permanent,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
