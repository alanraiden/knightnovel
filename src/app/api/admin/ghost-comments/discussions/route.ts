import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { collections } from "@/lib/db";
import { toTargetId } from "@/lib/server-utils";
import { ObjectId } from "mongodb";

export interface AdminDiscussionStub {
  id: string;
  title: string;
  category: string | null;
  author: string;
  status: "visible" | "hidden" | "removed";
  replyCount: number;
  createdAt: string;
}

/**
 * GET /api/admin/ghost-comments/discussions?novelSlug=
 *
 * Returns every root-level discussion (parentId null, targetType "novel")
 * for the given novel, regardless of status. Admin-only.
 * Used by the Thread Editor's discussion selector.
 */
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const novelSlug = searchParams.get("novelSlug");

  if (!novelSlug) {
    return NextResponse.json({ error: "novelSlug is required" }, { status: 400 });
  }

  try {
    const { novels, comments } = await collections();

    const novel = await novels.findOne({ slug: novelSlug });
    if (!novel) return NextResponse.json({ error: "Novel not found" }, { status: 404 });

    const targetId = toTargetId(novelSlug);

    // Fetch all root-level posts for this novel (any status so admin can see hidden ones too)
    const roots = await comments
      .find({ targetType: "novel", targetId, parentId: null })
      .sort({ createdAt: -1 })
      .toArray();

    // Batch-count replies for each root
    const rootIds = roots.map((r) => r._id as ObjectId);
    const replyCounts: Record<string, number> = {};

    if (rootIds.length > 0) {
      // Count all descendants (not just direct children) via a single pass:
      // gather every comment for this targetId and walk parentId chains.
      const allDocs = await comments
        .find({ targetType: "novel", targetId }, { projection: { _id: 1, parentId: 1 } })
        .toArray();

      // Build parent → children map
      const childrenOf = new Map<string, string[]>();
      for (const d of allDocs) {
        if (!d.parentId) continue;
        const pid = d.parentId.toString();
        if (!childrenOf.has(pid)) childrenOf.set(pid, []);
        childrenOf.get(pid)!.push((d._id as ObjectId).toString());
      }

      // BFS from each root to count all descendants
      for (const rootId of rootIds) {
        const rootStr = rootId.toString();
        let count = 0;
        const queue = [rootStr];
        while (queue.length) {
          const cur = queue.shift()!;
          const kids = childrenOf.get(cur) ?? [];
          count += kids.length;
          queue.push(...kids);
        }
        replyCounts[rootStr] = count;
      }
    }

    const stubs: AdminDiscussionStub[] = roots.map((r) => {
      const id = (r._id as ObjectId).toString();
      return {
        id,
        title: (r.title as string | undefined) || r.body.split("\n")[0].slice(0, 80),
        category: (r.category as string | undefined) ?? null,
        author: r.displayName as string,
        status: ((r.status as string | undefined) ?? "visible") as AdminDiscussionStub["status"],
        replyCount: replyCounts[id] ?? 0,
        createdAt: (r.createdAt as Date).toISOString(),
      };
    });

    return NextResponse.json({ discussions: stubs });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
