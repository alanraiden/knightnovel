import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { collections } from "@/lib/db";
import { toTargetId } from "@/lib/server-utils";
import { ObjectId } from "mongodb";

export interface AdminCommentView {
  id: string;
  parentId: string | null;
  displayName: string;
  body: string;
  stickerUrl?: string;
  createdAt: string;
  status: "visible" | "hidden" | "removed";
  isGhost: boolean;
}

// GET /api/admin/ghost-comments/thread?novelSlug=&chapterId=
// Returns every comment (all statuses) for the target so the Thread Editor
// can display and edit the full thread. Admin-only.
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const novelSlug = searchParams.get("novelSlug");
  const chapterId = searchParams.get("chapterId") || "";

  if (!novelSlug) {
    return NextResponse.json({ error: "novelSlug is required" }, { status: 400 });
  }

  try {
    const { novels, comments } = await collections();
    const novel = await novels.findOne({ slug: novelSlug });
    if (!novel) return NextResponse.json({ error: "Novel not found" }, { status: 404 });

    // Mirror the same targetType/targetId logic as the ghost-comments POST route
    // and the public /api/comments GET so we're querying the same rows.
    const targetType = chapterId ? "chapter" : "novel";
    const targetId = toTargetId(chapterId || novelSlug);

    const docs = await comments
      .find({ targetType, targetId })
      .sort({ createdAt: 1 })
      .toArray();

    const result: AdminCommentView[] = docs.map((d) => ({
      id: (d._id as ObjectId).toString(),
      parentId: d.parentId ? d.parentId.toString() : null,
      displayName: d.displayName as string,
      body: d.body as string,
      stickerUrl: d.stickerUrl as string | undefined,
      createdAt: (d.createdAt as Date).toISOString(),
      status: (d.status as AdminCommentView["status"]) ?? "visible",
      isGhost: Boolean(d.isGhost),
    }));

    return NextResponse.json({ comments: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
