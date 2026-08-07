import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";

// Edit a comment's own body. Only the original author can edit — ghost
// comments (authorId: null) can never be edited through this route, which
// is intentional; those are managed from the admin Ghost Comments tool.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
  }

  const body = await req.json();
  const newBody = typeof body.body === "string" ? body.body.trim() : "";
  if (!newBody) return NextResponse.json({ error: "Comment can't be empty" }, { status: 400 });

  try {
    const { comments } = await collections();
    const existing = await comments.findOne({ _id: new ObjectId(params.id) });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!existing.authorId || existing.authorId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    await comments.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { body: newBody, updatedAt: now, editedAt: now } }
    );

    return NextResponse.json({ ok: true, editedAt: now.toISOString() });
  } catch (err) {
    console.error("[comments/:id PATCH]", err);
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
