import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { toTargetId } from "@/lib/server-utils";
import { getCommentsPage, filterUsersByNotificationPref, type CommentSort } from "@/lib/queries";

const MENTION_RE = /@([a-zA-Z0-9_]{3,20})/g;

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
    const { comments, notifications, chapters, novels, users } = await collections();
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

    // Build a link back to the discussion — resolve chapter targets to their novel slug.
    // Shared by reply and mention notifications below.
    let link = "#";
    if (body.targetType === "novel") {
      link = `/novel/${body.targetId}#comment-${result.insertedId}`;
    } else if (ObjectId.isValid(String(body.targetId))) {
      const chapter = await chapters.findOne({ _id: new ObjectId(String(body.targetId)) });
      if (chapter) {
        const novel = await novels.findOne({ _id: chapter.novelId });
        if (novel) link = `/novel/${novel.slug}/chapter/${chapter.chapterNumber}#comment-${result.insertedId}`;
      }
    }

    // Notify the parent comment's author, if this is a reply and they're a real user
    // (not a ghost comment, and not replying to themselves).
    let parentAuthorId: string | undefined;
    if (body.parentId) {
      const parentId = toTargetId(body.parentId);
      const parent = await comments.findOne(
        typeof parentId === "string" && ObjectId.isValid(parentId)
          ? { _id: new ObjectId(parentId) }
          : { _id: parentId as ObjectId }
      );

      if (parent?.authorId && parent.authorId.toString() !== userId) {
        parentAuthorId = parent.authorId.toString();
        const [allowed] = await filterUsersByNotificationPref([parent.authorId], "reply");
        if (allowed) {
          await notifications.insertOne({
            userId: parent.authorId,
            type: "reply",
            payload: { commentId: parent._id, replyAuthor: body.displayName, message: body.body, link },
            isRead: false,
            createdAt: new Date(),
          });
        }
      }
    }

    // Notify anyone @mentioned in the comment body — skip the author
    // mentioning themselves, and skip the parent-comment author if they
    // were also mentioned (they already got a reply notification above,
    // no need to double up).
    const mentionedUsernames = [...new Set(Array.from(String(body.body).matchAll(MENTION_RE), (m) => m[1]))];
    if (mentionedUsernames.length) {
      const mentionedUsers = await users
        .find({ username: { $in: mentionedUsernames } })
        .project({ _id: 1, username: 1 })
        .toArray();

      const eligibleIds = mentionedUsers
        .map((u) => u._id)
        .filter((id) => id.toString() !== userId && id.toString() !== parentAuthorId);
      const allowedIds = new Set(
        (await filterUsersByNotificationPref(eligibleIds, "mention")).map((id) => id.toString())
      );

      for (const u of mentionedUsers) {
        const idStr = u._id.toString();
        if (!allowedIds.has(idStr)) continue;
        await notifications.insertOne({
          userId: u._id,
          type: "mention",
          payload: { replyAuthor: body.displayName, message: body.body, link },
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
