/**
 * scripts/ensure-indexes.ts
 *
 * Idempotent, one-time index creation for the Knight Novel database.
 * Run with:  npx tsx scripts/ensure-indexes.ts
 *
 * Only needs to be executed once per environment (development or production).
 * Re-running is safe — createIndex with the same key pattern is a no-op if
 * the index already exists.  All indexes are created with background:true so
 * the operation does not block reads/writes on a live database.
 */

import * as dotenv from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";

// Load .env.local so MONGODB_URI and MONGODB_DB are available without
// needing the Next.js runtime.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const uri    = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "knightnovel";

if (!uri) {
  console.error("[ensure-indexes] MONGODB_URI is not set in .env.local — exiting.");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);

  const comments = db.collection("comments");

  // ── Community feed — Discussions tab ──────────────────────────────────────
  // getDiscussionFeed: filter by targetType + parentId + status + title + isSpoiler,
  // then sort by createdAt (newest/oldest) or votes.up (popular).
  await comments.createIndex(
    { targetType: 1, parentId: 1, status: 1 },
    { name: "comm_type_parent_status", background: true }
  );
  await comments.createIndex(
    { targetType: 1, parentId: 1, status: 1, createdAt: -1 },
    { name: "comm_type_parent_status_created", background: true }
  );
  await comments.createIndex(
    { targetType: 1, parentId: 1, status: 1, "votes.up": -1 },
    { name: "comm_type_parent_status_votes", background: true }
  );

  // ── Community feed — Chapter Comments tab ─────────────────────────────────
  // getChapterCommentFeed: filter by targetType=chapter + parentId=null + status,
  // sort by createdAt or votes.up.
  await comments.createIndex(
    { targetType: 1, parentId: 1, status: 1, targetId: 1, createdAt: -1 },
    { name: "comm_chapter_feed_created", background: true }
  );
  await comments.createIndex(
    { targetType: 1, parentId: 1, status: 1, targetId: 1, "votes.up": -1 },
    { name: "comm_chapter_feed_votes", background: true }
  );

  // ── Reply-count aggregation ────────────────────────────────────────────────
  // $match on parentId + status for batch reply-count aggregation.
  await comments.createIndex(
    { parentId: 1, status: 1 },
    { name: "comm_parent_status", background: true }
  );

  // ── Per-target lookup (getCommentsPage) ───────────────────────────────────
  await comments.createIndex(
    { targetType: 1, targetId: 1, parentId: 1, status: 1 },
    { name: "comm_target_parent_status", background: true }
  );

  // ── Top contributors aggregation ──────────────────────────────────────────
  await comments.createIndex(
    { status: 1, displayName: 1 },
    { name: "comm_status_displayname", background: true }
  );

  // ── getTopDiscussions sort support ────────────────────────────────────────
  await comments.createIndex(
    { targetType: 1, parentId: 1, status: 1, "votes.up": -1, createdAt: -1 },
    { name: "comm_top_discussions_votes", background: true }
  );
  await comments.createIndex(
    { targetType: 1, parentId: 1, status: 1, createdAt: -1 },
    { name: "comm_top_discussions_recent", background: true }
  );

  console.log("[ensure-indexes] All indexes created (or already existed).");
  await client.close();
}

main().catch((err) => {
  console.error("[ensure-indexes] Error:", err);
  process.exit(1);
});
