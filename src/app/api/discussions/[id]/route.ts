import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  status: z.enum(["visible", "hidden"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  try {
    const { comments } = await collections();
    const result = await comments.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...parsed.data, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    const { comments } = await collections();
    const rootId = new ObjectId(params.id);

    // Cascade delete: gather every descendant reply (any depth) and remove
    // the whole thread, not just the root comment.
    const all = await comments.find({}, { projection: { _id: 1, parentId: 1 } }).toArray();
    const childrenOf = new Map<string, ObjectId[]>();
    for (const d of all) {
      if (!d.parentId) continue;
      const pid = d.parentId.toString();
      if (!childrenOf.has(pid)) childrenOf.set(pid, []);
      childrenOf.get(pid)!.push(d._id);
    }
    const toDelete: ObjectId[] = [rootId];
    const queue = [params.id];
    while (queue.length) {
      const current = queue.shift()!;
      const kids = childrenOf.get(current) ?? [];
      for (const k of kids) {
        toDelete.push(k);
        queue.push(k.toString());
      }
    }

    await comments.deleteMany({ _id: { $in: toDelete } });
    return NextResponse.json({ ok: true, deleted: toDelete.length });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
