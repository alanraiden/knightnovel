import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { toTargetId } from "@/lib/server-utils";
import { getCommentsPage, type CommentSort } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType") as "novel" | "chapter" | null;
  const targetId = searchParams.get("targetId");
  const sort = (searchParams.get("sort") as CommentSort) || "top";
  const offset = Number(searchParams.get("offset") || "0");
  const limit = Number(searchParams.get("limit") || "20");

  if (!targetType || !targetId) {
    return NextResponse.json({ error: "targetType and targetId are required" }, { status: 400 });
  }

  const page = await getCommentsPage(targetType, targetId, { sort, offset, limit });
  return NextResponse.json(page);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  try {
    const { comments, notifications, chapters, novels } = await collections();
    const targetId = toTargetId(body.targetId);

    const result = await comments.insertOne({
      ...body,
      targetId,
      authorId: userId ? new ObjectId(userId) : null,
      votes: { up: 0, down: 0 },
      reportCount: 0,
      status: "visible",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Notify the parent comment's author, if this is a reply and they're a real user
    // (not a ghost comment, and not replying to themselves).
    if (body.parentId) {
      const parentId = toTargetId(body.parentId);
      const parent = await comments.findOne(
        typeof parentId === "string" && ObjectId.isValid(parentId)
          ? { _id: new ObjectId(parentId) }
          : { _id: parentId as ObjectId }
      );

      if (parent?.authorId && parent.authorId.toString() !== userId) {
        // Build a link back to the discussion — resolve chapter targets to their novel slug.
        let link = "#";
        if (body.targetType === "novel") {
          link = `/novel/${body.targetId}#comment-${parent._id}`;
        } else if (ObjectId.isValid(String(body.targetId))) {
          const chapter = await chapters.findOne({ _id: new ObjectId(String(body.targetId)) });
          if (chapter) {
            const novel = await novels.findOne({ _id: chapter.novelId });
            if (novel) link = `/novel/${novel.slug}/chapter/${chapter.chapterNumber}#comment-${parent._id}`;
          }
        }

        await notifications.insertOne({
          userId: parent.authorId,
          type: "reply",
          payload: { commentId: parent._id, replyAuthor: body.displayName, message: body.body, link },
          isRead: false,
          createdAt: new Date(),
        });
      }
    }

    return NextResponse.json({ ok: true, id: result.insertedId.toString() });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
