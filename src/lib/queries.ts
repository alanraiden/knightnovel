import { ObjectId } from "mongodb";
import { collections } from "@/lib/db";
import { demoNovels, demoComments, type DemoNovel } from "@/lib/seed-data";
import type { Novel, Comment as CommentDoc } from "@/lib/models/types";
import { toTargetId } from "@/lib/server-utils";

// Every function here follows the same pattern: try MongoDB, and if it's not
// configured (no MONGODB_URI) or the query comes back empty, fall back to
// the in-memory demo data. This means the site looks correct immediately
// after cloning, and swaps over to real content the moment a database is
// connected and seeded — no code changes required either way.

export type NovelView = DemoNovel; // same shape; kept as an alias for clarity at call sites

function hasDb() {
  return Boolean(process.env.MONGODB_URI);
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function fromMongo(doc: Novel & { _id: ObjectId }): NovelView {
  const status = doc.status === "dropped" ? "hiatus" : doc.status;
  return {
    slug: doc.slug,
    title: doc.title,
    altTitles: doc.altTitles ?? [],
    author: (doc.authors ?? []).join(", "),
    cover: doc.coverImageUrl || "",
    heroBackground: doc.heroBackgroundUrl || "",
    genres: doc.genres ?? [],
    tags: doc.tags ?? [],
    status,
    country: doc.country,
    rating: doc.counters?.ratingAvg ?? 0,
    chapterCount: doc.chapterCount ?? 0,
    description: doc.description ?? "",
    views: formatViews(doc.counters?.viewsTotal ?? 0),
    bookmarks: formatViews(doc.counters?.favorites ?? 0),
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    lastChapterAddedAt: (doc.lastChapterAddedAt ?? doc.createdAt ?? new Date()).toISOString(),
  };
}

export async function getAllNovels(): Promise<NovelView[]> {
  if (hasDb()) {
    try {
      const { novels } = await collections();
      const docs = await novels.find({}).toArray();
      if (docs.length) return docs.map((d) => fromMongo(d as Novel & { _id: ObjectId }));
    } catch (err) {
      console.error("[queries] getAllNovels — falling back to demo data:", err);
    }
  }
  return demoNovels;
}

export async function getNovelBySlug(slug: string): Promise<NovelView | undefined> {
  if (hasDb()) {
    try {
      const { novels } = await collections();
      const doc = await novels.findOne({ slug });
      if (doc) return fromMongo(doc as Novel & { _id: ObjectId });
    } catch (err) {
      console.error("[queries] getNovelBySlug — falling back to demo data:", err);
    }
  }
  return demoNovels.find((n) => n.slug === slug);
}

export async function getNovelSlugs(): Promise<string[]> {
  const all = await getAllNovels();
  return all.map((n) => n.slug);
}

export async function getFeatured(limit = 3): Promise<NovelView[]> {
  if (hasDb()) {
    try {
      const { novels } = await collections();
      const docs = await novels.find({ isFeatured: true }).sort({ featuredOrder: 1 }).limit(limit).toArray();
      if (docs.length) return docs.map((d) => fromMongo(d as Novel & { _id: ObjectId }));
    } catch (err) {
      console.error("[queries] getFeatured — falling back to demo data:", err);
    }
  }
  return demoNovels.slice(0, limit);
}

export async function getTrending(limit = 5): Promise<NovelView[]> {
  if (hasDb()) {
    try {
      const { novels } = await collections();
      const docs = await novels.find({}).sort({ "counters.viewsWeekly": -1 }).limit(limit).toArray();
      if (docs.length) return docs.map((d) => fromMongo(d as Novel & { _id: ObjectId }));
    } catch (err) {
      console.error("[queries] getTrending — falling back to demo data:", err);
    }
  }
  return [...demoNovels].slice(0, limit);
}

const rankingField: Record<string, string> = {
  day: "counters.viewsDaily",
  week: "counters.viewsWeekly",
  month: "counters.viewsMonthly",
};

export async function getRankingsForPeriod(period: "day" | "week" | "month", limit = 10): Promise<NovelView[]> {
  if (hasDb()) {
    try {
      const { novels } = await collections();
      const docs = await novels.find({}).sort({ [rankingField[period]]: -1 }).limit(limit).toArray();
      if (docs.length) return docs.map((d) => fromMongo(d as Novel & { _id: ObjectId }));
    } catch (err) {
      console.error("[queries] getRankingsForPeriod — falling back to demo data:", err);
    }
  }
  return [...demoNovels].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export async function getNewlyAdded(limit = 5): Promise<NovelView[]> {
  if (hasDb()) {
    try {
      const { novels } = await collections();
      const docs = await novels.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
      if (docs.length) return docs.map((d) => fromMongo(d as Novel & { _id: ObjectId }));
    } catch (err) {
      console.error("[queries] getNewlyAdded — falling back to demo data:", err);
    }
  }
  return demoNovels.slice(0, limit);
}

export async function getRecentlyUpdated(limit = 5): Promise<NovelView[]> {
  if (hasDb()) {
    try {
      const { novels } = await collections();
      const docs = await novels.find({}).sort({ lastChapterAddedAt: -1 }).limit(limit).toArray();
      if (docs.length) return docs.map((d) => fromMongo(d as Novel & { _id: ObjectId }));
    } catch (err) {
      console.error("[queries] getRecentlyUpdated — falling back to demo data:", err);
    }
  }
  return demoNovels.slice(0, limit);
}

export async function getChapterContent(
  slug: string,
  chapterNumber: number
): Promise<{ id: string; title: string; content: string } | null> {
  if (hasDb()) {
    try {
      const { novels, chapters } = await collections();
      const novel = await novels.findOne({ slug });
      if (novel) {
        const chapter = await chapters.findOne({ novelId: novel._id, chapterNumber });
        if (chapter) return { id: chapter._id!.toString(), title: chapter.title, content: chapter.content };
      }
    } catch (err) {
      console.error("[queries] getChapterContent — falling back to placeholder text:", err);
    }
  }
  return null; // caller falls back to its own sample paragraph
}

// ---- Comments ----

export interface CommentView {
  id: string;
  author: string;
  authorId?: string;
  body: string;
  up: number;
  down: number;
  isSpoiler?: boolean;
  stickerUrl?: string;
  parentId: string | null;
  title?: string;
  category?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt?: string;
  editedAt?: string;
}

function fromMongoComment(doc: CommentDoc & { _id: ObjectId }): CommentView {
  return {
    id: doc._id.toString(),
    author: doc.displayName,
    authorId: doc.authorId ? doc.authorId.toString() : undefined,
    body: doc.body,
    up: doc.votes?.up ?? 0,
    down: doc.votes?.down ?? 0,
    isSpoiler: doc.isSpoiler,
    stickerUrl: doc.stickerUrl,
    parentId: doc.parentId ? doc.parentId.toString() : null,
    title: doc.title,
    category: doc.category,
    isPinned: doc.isPinned,
    isLocked: doc.isLocked,
    createdAt: doc.createdAt.toISOString(),
    editedAt: doc.editedAt ? doc.editedAt.toISOString() : undefined,
  };
}

export type CommentSort = "top" | "newest" | "oldest" | "most_liked";

export interface CommentsPage {
  comments: CommentView[]; // this page's top-level comments PLUS all of their replies (any depth)
  totalTopLevel: number;
  totalAll: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export async function getCommentsPage(
  targetType: "novel" | "chapter",
  targetId: string,
  opts: { sort?: CommentSort; offset?: number; limit?: number } = {}
): Promise<CommentsPage> {
  const { sort = "top", offset = 0, limit = PAGE_SIZE } = opts;
  if (!hasDb()) return { comments: [], totalTopLevel: 0, totalAll: 0, hasMore: false };

  try {
    const { comments } = await collections();
    const resolvedTargetId = toTargetId(targetId);

    const sortSpec: Record<string, 1 | -1> =
      sort === "newest"
        ? { createdAt: -1 }
        : sort === "oldest"
        ? { createdAt: 1 }
        : sort === "most_liked"
        ? { "votes.up": -1 }
        : { "votes.up": -1 }; // "top" — net score would need a computed field; votes.up is a fair proxy for now

    const baseFilter = { targetType, targetId: resolvedTargetId, parentId: null, status: "visible" as const };

    const [topLevelDocs, totalTopLevel, totalAll] = await Promise.all([
      comments.find(baseFilter).sort(sortSpec).skip(offset).limit(limit).toArray(),
      comments.countDocuments(baseFilter),
      comments.countDocuments({ targetType, targetId: resolvedTargetId, status: "visible" }),
    ]);

    // Gather every reply (any depth) under just this page's top-level comments.
    const childrenOf = new Map<string, typeof topLevelDocs>();
    if (topLevelDocs.length) {
      const allForTarget = await comments
        .find({ targetType, targetId: resolvedTargetId, status: "visible", parentId: { $ne: null } })
        .toArray();
      for (const d of allForTarget) {
        const pid = d.parentId!.toString();
        if (!childrenOf.has(pid)) childrenOf.set(pid, []);
        childrenOf.get(pid)!.push(d);
      }
    }

    const replyDocs: typeof topLevelDocs = [];
    const queue = topLevelDocs.map((d) => d._id.toString());
    while (queue.length) {
      const current = queue.shift()!;
      const kids = childrenOf.get(current) ?? [];
      for (const k of kids) {
        replyDocs.push(k);
        queue.push(k._id.toString());
      }
    }

    return {
      comments: [...topLevelDocs, ...replyDocs].map((d) => fromMongoComment(d as CommentDoc & { _id: ObjectId })),
      totalTopLevel,
      totalAll,
      hasMore: offset + topLevelDocs.length < totalTopLevel,
    };
  } catch (err) {
    console.error("[queries] getCommentsPage:", err);
    return { comments: [], totalTopLevel: 0, totalAll: 0, hasMore: false };
  }
}

export async function getComments(
  targetType: "novel" | "chapter",
  targetId: string
): Promise<CommentView[]> {
  if (hasDb()) {
    try {
      const { comments } = await collections();
      const docs = await comments
        .find({ targetType, targetId: toTargetId(targetId), status: "visible" })
        .sort({ "votes.up": -1 })
        .toArray();
      if (docs.length) return docs.map((d) => fromMongoComment(d as CommentDoc & { _id: ObjectId }));
    } catch (err) {
      console.error("[queries] getComments — falling back to demo thread:", err);
    }
  }
  return [];
}

// ---- Profile / reading dashboard ----

export interface DashboardBookmark {
  novel: NovelView;
  chapter: number;
  total: number;
  updatedAt: Date;
  folderId: string | null;
}

export interface DashboardStats {
  streakDays: number;
  currentlyReading: number;
  chaptersRead: number;
  totalHours: number;
}

export interface DashboardData {
  stats: DashboardStats;
  continueReading: DashboardBookmark[];
  bookmarks: DashboardBookmark[];
  recommendations: NovelView[];
  folders: { id: string; name: string }[];
}

const demoDashboard: DashboardData = {
  stats: { streakDays: 18, currentlyReading: 12, chaptersRead: 2843, totalHours: 142 },
  continueReading: [],
  bookmarks: [],
  recommendations: [],
  folders: [],
};

export async function getDashboardData(userId?: string): Promise<DashboardData> {
  const all = await getAllNovels();

  if (userId && hasDb()) {
    try {
      const { bookmarks, readingProgress, novels, folders } = await collections();
      const userObjectId = new ObjectId(userId);
      const bookmarkDocs = await bookmarks.find({ userId: userObjectId }).toArray();
      const folderDocs = await folders.find({ userId: userObjectId }).sort({ name: 1 }).toArray();
      const folderList = folderDocs.map((f) => ({ id: f._id!.toString(), name: f.name }));

      if (bookmarkDocs.length === 0) {
        // Genuinely logged in, zero bookmarks yet — show REAL zeros, not the
        // demo numbers. Showing fake "18 day streak" data to a brand new
        // user is actively misleading, not just a placeholder.
        return {
          stats: { streakDays: 0, currentlyReading: 0, chaptersRead: 0, totalHours: 0 },
          continueReading: [],
          bookmarks: [],
          recommendations: all.slice(0, 6),
          folders: folderList,
        };
      }

      const progressDocs = await readingProgress.find({ userId: userObjectId }).toArray();
      const progressByNovel = new Map(progressDocs.map((p) => [p.novelId.toString(), p]));

      const novelDocs = await novels
        .find({ _id: { $in: bookmarkDocs.map((b) => b.novelId) } })
        .toArray();
      const novelViewById = new Map(novelDocs.map((d) => [d._id!.toString(), fromMongo(d as Novel & { _id: ObjectId })]));

      const list: DashboardBookmark[] = bookmarkDocs
        .map((b) => {
          const novel = novelViewById.get(b.novelId.toString());
          if (!novel) return null;
          const progress = progressByNovel.get(b.novelId.toString());
          return {
            novel,
            chapter: progress?.chapterNumber ?? 1,
            total: novel.chapterCount,
            updatedAt: progress?.updatedAt ?? b.createdAt,
            folderId: b.folderId ? b.folderId.toString() : null,
          };
        })
        .filter((x): x is DashboardBookmark => x !== null);

      const continueReading = [...list]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 4);

      return {
        stats: {
          streakDays: 0, // requires a daily-activity aggregation job — see spec Section 7b
          currentlyReading: list.filter((b) => b.chapter < b.total).length,
          chaptersRead: progressDocs.reduce((sum, p) => sum + (p.chapterNumber ?? 0), 0),
          totalHours: 0, // requires session-time tracking, not yet instrumented
        },
        continueReading,
        bookmarks: list,
        recommendations: all.filter((n) => !list.some((b) => b.novel.slug === n.slug)).slice(0, 6),
        folders: folderList,
      };
    } catch (err) {
      console.error("[queries] getDashboardData — falling back to demo dashboard:", err);
    }
  }

  // Logged out (no session) — show a populated demo dashboard so the design
  // is still visible. Logged-in users with zero data get the real empty
  // state above instead, never this.
  return {
    ...demoDashboard,
    continueReading: [
      { novel: all[0], chapter: 118, total: 180, updatedAt: new Date(Date.now() - 2 * 3600_000), folderId: null },
      { novel: all[1], chapter: 42, total: 156, updatedAt: new Date(Date.now() - 24 * 3600_000), folderId: null },
      { novel: all[2], chapter: 7, total: 210, updatedAt: new Date(Date.now() - 5 * 24 * 3600_000), folderId: null },
    ].filter((b) => b.novel),
    bookmarks: [
      { novel: all[0], chapter: 118, total: 180, updatedAt: new Date(Date.now() - 2 * 3600_000), folderId: null },
      { novel: all[3], chapter: 3301, total: 4570, updatedAt: new Date(Date.now() - 3 * 3600_000), folderId: null },
      { novel: all[2], chapter: 210, total: 210, updatedAt: new Date(Date.now() - 5 * 24 * 3600_000), folderId: null },
      { novel: all[5], chapter: 125, total: 427, updatedAt: new Date(Date.now() - 6 * 24 * 3600_000), folderId: null },
    ].filter((b) => b.novel),
    recommendations: all.slice(-3),
  };
}

export interface UserCommentView {
  id: string;
  body: string;
  novelSlug: string;
  context: string;
  timeAgo: string;
  reply: { author: string; body: string } | null;
}

export async function getUserComments(userId: string, limit = 20): Promise<UserCommentView[]> {
  if (!hasDb()) return [];
  try {
    const { comments, chapters, novels } = await collections();
    const myDocs = await comments
      .find({ authorId: new ObjectId(userId), status: "visible" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const results: UserCommentView[] = [];
    for (const doc of myDocs) {
      let novelSlug: string | null = null;
      let context = "";

      if (doc.targetType === "novel") {
        // targetId is the novel slug itself for novel-level discussion.
        novelSlug = String(doc.targetId);
        context = novelSlug;
      } else {
        // targetId is a chapter ObjectId (or a demo composite string) — resolve it back to a novel slug.
        if (ObjectId.isValid(String(doc.targetId))) {
          const chapter = await chapters.findOne({ _id: new ObjectId(String(doc.targetId)) });
          if (chapter) {
            const novel = await novels.findOne({ _id: chapter.novelId });
            if (novel) {
              novelSlug = novel.slug;
              context = `${novel.title} · Chapter ${chapter.chapterNumber}`;
            }
          }
        }
      }

      if (!novelSlug) continue;

      // First direct reply to this comment, if any, for context.
      const reply = await comments.findOne(
        { parentId: doc._id, status: "visible" },
        { sort: { createdAt: 1 } }
      );

      results.push({
        id: doc._id!.toString(),
        body: doc.body,
        novelSlug,
        context,
        timeAgo: doc.createdAt.toISOString(),
        reply: reply ? { author: reply.displayName, body: reply.body } : null,
      });
    }
    return results;
  } catch (err) {
    console.error("[queries] getUserComments — returning empty list:", err);
    return [];
  }
}

export interface ChapterListItem {
  id: string;
  chapterNumber: number;
  title: string;
  status: "published" | "draft";
}

export interface NotificationView {
  id: string;
  type: "reply" | "mention" | "chapter_update" | "announcement";
  text?: string;
  originalComment?: string;
  replyAuthor?: string;
  replyBody?: string;
  createdAt: string;
  link?: string;
  isRead: boolean;
  thumbnailUrl?: string; // chapter_update only — the novel's own cover, joined live at read time
}

// Cheap, separate from getNotificationsForUser so the navbar can show a
// badge on every page load without pulling and hydrating the full list.
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!hasDb()) return 0;
  try {
    const { notifications } = await collections();
    return await notifications.countDocuments({ userId: new ObjectId(userId), isRead: false });
  } catch (err) {
    console.error("[queries] getUnreadNotificationCount — returning 0:", err);
    return 0;
  }
}

export async function markNotificationsRead(userId: string): Promise<void> {
  if (!hasDb()) return;
  try {
    const { notifications } = await collections();
    await notifications.updateMany(
      { userId: new ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
  } catch (err) {
    console.error("[queries] markNotificationsRead — no-op:", err);
  }
}

export async function getNotificationsForUser(userId: string, limit = 20): Promise<NotificationView[]> {
  if (!hasDb()) return [];
  try {
    const { notifications, comments, announcements, novels } = await collections();

    const userNotifs = await notifications
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const results: NotificationView[] = [];
    for (const n of userNotifs) {
      if (n.type === "reply" && n.payload?.commentId) {
        const original = await comments.findOne({ _id: n.payload.commentId });
        results.push({
          id: n._id!.toString(),
          type: "reply",
          originalComment: original?.body,
          replyAuthor: n.payload.replyAuthor,
          replyBody: n.payload.message,
          createdAt: n.createdAt.toISOString(),
          link: n.payload.link,
          isRead: Boolean(n.isRead),
        });
      } else if (n.type === "mention") {
        results.push({
          id: n._id!.toString(),
          type: "mention",
          replyAuthor: n.payload?.replyAuthor,
          replyBody: n.payload?.message,
          createdAt: n.createdAt.toISOString(),
          link: n.payload?.link,
          isRead: Boolean(n.isRead),
        });
      } else if (n.type === "chapter_update") {
        let thumbnailUrl: string | undefined;
        if (n.payload?.novelId) {
          const novel = await novels.findOne(
            { _id: n.payload.novelId },
            { projection: { cover: 1 } }
          );
          thumbnailUrl = novel?.cover;
        }
        results.push({
          id: n._id!.toString(),
          type: "chapter_update",
          text: n.payload?.message,
          createdAt: n.createdAt.toISOString(),
          link: n.payload?.link,
          isRead: Boolean(n.isRead),
          thumbnailUrl,
        });
      }
    }

    // Merge in the most recent site-wide announcements — these aren't
    // fanned out per-user, just queried fresh each time.
    const recentAnnouncements = await announcements.find({}).sort({ publishedAt: -1 }).limit(3).toArray();
    for (const a of recentAnnouncements) {
      results.push({
        id: a._id!.toString(),
        type: "announcement",
        text: a.body,
        createdAt: a.publishedAt.toISOString(),
        isRead: true,
      });
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  } catch (err) {
    console.error("[queries] getNotificationsForUser — returning empty list:", err);
    return [];
  }
}

export async function getUserNovelStatus(
  userId: string | undefined,
  novelSlug: string
): Promise<{ isBookmarked: boolean; isFavorited: boolean }> {
  if (!userId || !hasDb()) return { isBookmarked: false, isFavorited: false };
  try {
    const { novels, bookmarks, favorites } = await collections();
    const novel = await novels.findOne({ slug: novelSlug });
    if (!novel) return { isBookmarked: false, isFavorited: false };

    const uid = new ObjectId(userId);
    const [bookmark, favorite] = await Promise.all([
      bookmarks.findOne({ userId: uid, novelId: novel._id }),
      favorites.findOne({ userId: uid, novelId: novel._id }),
    ]);
    return { isBookmarked: Boolean(bookmark), isFavorited: Boolean(favorite) };
  } catch (err) {
    console.error("[queries] getUserNovelStatus:", err);
    return { isBookmarked: false, isFavorited: false };
  }
}

export async function getUserFolders(userId: string): Promise<{ id: string; name: string }[]> {
  if (!hasDb()) return [];
  try {
    const { folders } = await collections();
    const docs = await folders.find({ userId: new ObjectId(userId) }).sort({ name: 1 }).toArray();
    return docs.map((d) => ({ id: d._id!.toString(), name: d.name }));
  } catch (err) {
    console.error("[queries] getUserFolders:", err);
    return [];
  }
}

// ---- Discussion board (Community page + homepage Community section) ----

export interface DiscussionView {
  id: string;
  author: string;
  title: string;
  bodyPreview: string;
  category: string | null;
  isPinned: boolean;
  novelSlug: string;
  novelTitle: string;
  novelCover: string;
  chapterNumber: number | null;
  up: number;
  down: number;
  replyCount: number;
  views: number;
  createdAt: string;
}

export async function getTopDiscussions(
  limit = 8,
  sort: "recent" | "popular" = "recent"
): Promise<DiscussionView[]> {
  if (!hasDb()) return [];
  try {
    const { comments, novels, chapters } = await collections();
    const sortSpec: Record<string, 1 | -1> = sort === "popular" ? { "votes.up": -1 } : { createdAt: -1 };

    // Novel-page discussions AND chapter comments both count as "discussions"
    // here — a chapter comment is just a discussion scoped to that chapter.
    const docs = await comments
      .find({ targetType: { $in: ["novel", "chapter"] }, parentId: null, status: "visible" })
      .sort(sortSpec)
      .limit(limit * 2) // fetch extra since some may fail to resolve to a novel below
      .toArray();

    const results: DiscussionView[] = [];
    for (const doc of docs) {
      if (results.length >= limit) break;

      let novel = null;
      let chapterNumber: number | null = null;

      if (doc.targetType === "novel") {
        novel = await novels.findOne({ slug: String(doc.targetId) });
      } else {
        const targetIdStr = String(doc.targetId);
        if (ObjectId.isValid(targetIdStr)) {
          const chapter = await chapters.findOne({ _id: new ObjectId(targetIdStr) });
          if (chapter) {
            novel = await novels.findOne({ _id: chapter.novelId });
            chapterNumber = chapter.chapterNumber;
          }
        } else {
          // Demo/no-chapter-doc fallback id looks like "{slug}-ch-{n}".
          const match = targetIdStr.match(/^(.+)-ch-(\d+)$/);
          if (match) {
            novel = await novels.findOne({ slug: match[1] });
            chapterNumber = parseInt(match[2], 10);
          }
        }
      }
      if (!novel) continue;

      const replyCount = await comments.countDocuments({ parentId: doc._id, status: "visible" });

      results.push({
        id: doc._id!.toString(),
        author: doc.displayName,
        title: doc.title || doc.body.split("\n")[0].slice(0, 80),
        bodyPreview: doc.body,
        category: doc.targetType === "chapter" ? "Chapter" : doc.category || "Discussion",
        isPinned: Boolean(doc.isPinned),
        novelSlug: novel.slug,
        novelTitle: novel.title,
        novelCover: novel.coverImageUrl || "",
        chapterNumber,
        up: doc.votes?.up ?? 0,
        down: doc.votes?.down ?? 0,
        replyCount,
        views: doc.views ?? 0,
        createdAt: doc.createdAt.toISOString(),
      });
    }
    // Pinned discussions always float to the top, regardless of sort mode.
    return results.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  } catch (err) {
    console.error("[queries] getTopDiscussions — returning empty list:", err);
    return [];
  }
}

export async function getPopularTags(limit = 12): Promise<{ tag: string; count: number }[]> {
  if (!hasDb()) return [];
  try {
    const { novels } = await collections();
    const agg = await novels
      .aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();
    return agg.map((a) => ({ tag: a._id, count: a.count }));
  } catch (err) {
    console.error("[queries] getPopularTags — returning empty list:", err);
    return [];
  }
}

export async function getTopContributors(limit = 6): Promise<{ name: string; count: number }[]> {
  if (!hasDb()) return [];
  try {
    const { comments } = await collections();
    // Includes ghost-comment display names alongside real users — from a
    // visitor's perspective they're indistinguishable anyway (that's the
    // whole point of ghost comments), so they contribute to this count too.
    const agg = await comments
      .aggregate([
        { $match: { status: "visible" } },
        { $group: { _id: "$displayName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();
    return agg.map((a) => ({ name: a._id, count: a.count }));
  } catch (err) {
    console.error("[queries] getTopContributors — returning empty list:", err);
    return [];
  }
}

export async function getMostActiveNovels(limit = 5): Promise<{ novel: NovelView; discussionCount: number }[]> {
  if (!hasDb()) return [];
  try {
    const { comments, chapters, novels } = await collections();
    const docs = await comments
      .find({ status: "visible" }, { projection: { targetType: 1, targetId: 1 } })
      .toArray();

    const countBySlug = new Map<string, number>();
    const chapterNovelCache = new Map<string, string | null>();

    for (const d of docs) {
      let slug: string | null = null;

      if (d.targetType === "novel") {
        slug = String(d.targetId);
      } else {
        const key = String(d.targetId);
        if (chapterNovelCache.has(key)) {
          slug = chapterNovelCache.get(key)!;
        } else if (ObjectId.isValid(key)) {
          const chapter = await chapters.findOne({ _id: new ObjectId(key) });
          const novelDoc = chapter ? await novels.findOne({ _id: chapter.novelId }, { projection: { slug: 1 } }) : null;
          slug = novelDoc?.slug ?? null;
          chapterNovelCache.set(key, slug);
        } else {
          const match = key.match(/^(.+)-ch-\d+$/);
          slug = match ? match[1] : null;
          chapterNovelCache.set(key, slug);
        }
      }
      if (slug) countBySlug.set(slug, (countBySlug.get(slug) ?? 0) + 1);
    }

    const sorted = [...countBySlug.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
    const results: { novel: NovelView; discussionCount: number }[] = [];
    for (const [slug, count] of sorted) {
      const doc = await novels.findOne({ slug });
      if (doc) results.push({ novel: fromMongo(doc as Novel & { _id: ObjectId }), discussionCount: count });
    }
    return results;
  } catch (err) {
    console.error("[queries] getMostActiveNovels — returning empty list:", err);
    return [];
  }
}

export async function getFeaturedSlugs(): Promise<string[]> {
  if (!hasDb()) return [];
  try {
    const { novels } = await collections();
    const docs = await novels.find({ isFeatured: true }).sort({ featuredOrder: 1 }).project({ slug: 1 }).toArray();
    return docs.map((d) => d.slug);
  } catch (err) {
    console.error("[queries] getFeaturedSlugs:", err);
    return [];
  }
}

export interface ChapterSitemapEntry {
  novelSlug: string;
  chapterNumber: number;
  updatedAt: string;
}

export async function getAllChaptersForSitemap(): Promise<ChapterSitemapEntry[]> {
  if (!hasDb()) return [];
  try {
    const { chapters, novels } = await collections();
    const novelDocs = await novels.find({}, { projection: { slug: 1 } }).toArray();
    const slugById = new Map(novelDocs.map((n) => [n._id!.toString(), n.slug]));

    const chapterDocs = await chapters
      .find({ status: "published" }, { projection: { novelId: 1, chapterNumber: 1, updatedAt: 1 } })
      .toArray();

    return chapterDocs
      .map((c) => {
        const novelSlug = slugById.get(c.novelId.toString());
        if (!novelSlug) return null;
        return { novelSlug, chapterNumber: c.chapterNumber, updatedAt: c.updatedAt.toISOString() };
      })
      .filter((c): c is ChapterSitemapEntry => c !== null);
  } catch (err) {
    console.error("[queries] getAllChaptersForSitemap — returning empty list:", err);
    return [];
  }
}

// Called on every chapter page view. Increments all four counters together
// since there's no scheduled job (yet) to reset the daily/weekly/monthly
// windows — they'll functionally track total views until that job exists.
// Documented honestly rather than pretending real time-windowed counts.
export async function incrementNovelViews(novelSlug: string): Promise<void> {
  if (!hasDb()) return;
  try {
    const { novels } = await collections();
    await novels.updateOne(
      { slug: novelSlug },
      {
        $inc: {
          "counters.viewsTotal": 1,
          "counters.viewsDaily": 1,
          "counters.viewsWeekly": 1,
          "counters.viewsMonthly": 1,
        },
      }
    );
  } catch (err) {
    console.error("[queries] incrementNovelViews:", err);
  }
}

export async function getChaptersForAdmin(slug: string): Promise<ChapterListItem[]> {
  if (!hasDb()) return [];
  try {
    const { novels, chapters } = await collections();
    const novel = await novels.findOne({ slug });
    if (!novel) return [];
    const docs = await chapters
      .find({ novelId: novel._id })
      .sort({ chapterNumber: 1 })
      .project({ content: 0 })
      .toArray();
    return docs.map((d) => ({
      id: d._id!.toString(),
      chapterNumber: d.chapterNumber,
      title: d.title,
      status: d.status,
    }));
  } catch (err) {
    console.error("[queries] getChaptersForAdmin — returning empty list:", err);
    return [];
  }
}

export interface DiscussionThread {
  root: CommentView;
  replies: CommentView[];
  novelSlug: string;
  novelTitle: string;
  status: "visible" | "hidden" | "removed";
}

export async function getDiscussionThread(discussionId: string): Promise<DiscussionThread | null> {
  if (!hasDb() || !ObjectId.isValid(discussionId)) return null;
  try {
    const { comments, novels } = await collections();
    const rootDoc = await comments.findOne({ _id: new ObjectId(discussionId) });
    if (!rootDoc || rootDoc.targetType !== "novel") return null;

    const novel = await novels.findOne({ slug: String(rootDoc.targetId) });
    if (!novel) return null;

    // All comments under this novel's discussion target, then keep only the
    // root and anything descended from it (arbitrary depth via BFS on parentId).
    const allDocs = await comments
      .find({ targetType: "novel", targetId: rootDoc.targetId })
      .toArray();

    const byId = new Map(allDocs.map((d) => [d._id.toString(), d]));
    const childrenOf = new Map<string, typeof allDocs>();
    for (const d of allDocs) {
      const pid = d.parentId ? d.parentId.toString() : null;
      if (!pid) continue;
      if (!childrenOf.has(pid)) childrenOf.set(pid, []);
      childrenOf.get(pid)!.push(d);
    }

    const replyDocs: typeof allDocs = [];
    const queue = [discussionId];
    while (queue.length) {
      const current = queue.shift()!;
      const kids = childrenOf.get(current) ?? [];
      for (const k of kids) {
        if (k.status === "visible") replyDocs.push(k);
        queue.push(k._id.toString());
      }
    }

    return {
      root: fromMongoComment(rootDoc as CommentDoc & { _id: ObjectId }),
      replies: replyDocs.map((d) => fromMongoComment(d as CommentDoc & { _id: ObjectId })),
      novelSlug: novel.slug,
      novelTitle: novel.title,
      status: rootDoc.status,
    };
  } catch (err) {
    console.error("[queries] getDiscussionThread:", err);
    return null;
  }
}

export async function getRecentCommunityActivity(limit = 4) {
  if (hasDb()) {
    try {
      const { comments } = await collections();
      const docs = await comments
        .find({ status: "visible", parentId: null })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      if (docs.length) {
        return docs.map((d) => ({
          id: d._id.toString(),
          author: d.displayName,
          body: d.body,
          likes: d.votes?.up ?? 0,
          replies: 0,
          timeAgo: "recently",
          context: "",
        }));
      }
    } catch (err) {
      console.error("[queries] getRecentCommunityActivity — falling back to demo data:", err);
    }
  }
  return demoComments;
}

// Site-wide settings — currently just the logo, stored as a single document
// so it's trivial to add more site-wide fields (favicon, seasonal theme,
// etc.) later without a schema change.
export async function getSiteLogoUrl(): Promise<string | null> {
  if (!hasDb()) return null;
  try {
    const { settings } = await collections();
    const doc = await settings.findOne({ _id: "site" as unknown as ObjectId });
    return doc?.logoUrl ?? null;
  } catch (err) {
    console.error("[queries] getSiteLogoUrl — falling back to default logo:", err);
    return null;
  }
}

export async function setSiteLogoUrl(url: string | null): Promise<void> {
  const { settings } = await collections();
  await settings.updateOne(
    { _id: "site" as unknown as ObjectId },
    { $set: { logoUrl: url } },
    { upsert: true }
  );
}

// Monetization / ad settings — one document in the same `settings`
// collection as the site logo, keyed by _id. Kept deliberately generic
// (just enabled flags) so a real ad network can be wired in later without
// touching page layouts — see AdSlot.
export interface AdSettings {
  enabled: boolean;
  pageTypes: { chapter: boolean; novel: boolean; community: boolean };
  positions: { top: boolean; middle: boolean; bottom: boolean };
}

const DEFAULT_AD_SETTINGS: AdSettings = {
  enabled: false,
  pageTypes: { chapter: true, novel: true, community: true },
  positions: { top: true, middle: true, bottom: true },
};

export async function getAdSettings(): Promise<AdSettings> {
  if (!hasDb()) return DEFAULT_AD_SETTINGS;
  try {
    const { settings } = await collections();
    const doc = await settings.findOne({ _id: "ads" as unknown as ObjectId });
    if (!doc) return DEFAULT_AD_SETTINGS;
    return {
      enabled: Boolean(doc.enabled),
      pageTypes: { ...DEFAULT_AD_SETTINGS.pageTypes, ...doc.pageTypes },
      positions: { ...DEFAULT_AD_SETTINGS.positions, ...doc.positions },
    };
  } catch (err) {
    console.error("[queries] getAdSettings — falling back to defaults (ads off):", err);
    return DEFAULT_AD_SETTINGS;
  }
}

export async function setAdSettings(settings: AdSettings): Promise<void> {
  const { settings: col } = await collections();
  await col.updateOne({ _id: "ads" as unknown as ObjectId }, { $set: settings }, { upsert: true });
}

// Editable profile fields (display name, bio, favorite genre) — kept
// separate from getDashboardData since this is specifically what the
// profile edit form reads/writes.
export interface EditableProfile {
  displayName: string;
  bio: string;
  favoriteGenre: string;
}

export async function getEditableProfile(userId: string): Promise<EditableProfile | null> {
  if (!hasDb()) return null;
  try {
    const { users } = await collections();
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return null;
    return {
      displayName: user.displayName ?? "",
      bio: user.bio ?? "",
      favoriteGenre: user.favoriteGenre ?? "",
    };
  } catch (err) {
    console.error("[queries] getEditableProfile:", err);
    return null;
  }
}

export type NotificationSettings = { reply: boolean; mention: boolean; chapter_update: boolean; announcement: boolean };

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  reply: true,
  mention: true,
  chapter_update: true,
  announcement: true,
};

export async function getNotificationSettings(userId: string): Promise<NotificationSettings> {
  if (!hasDb()) return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const { users } = await collections();
    const user = await users.findOne({ _id: new ObjectId(userId) });
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...user?.notificationSettings };
  } catch (err) {
    console.error("[queries] getNotificationSettings — defaulting to all on:", err);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

// Filters a list of user ids down to the ones who haven't opted out of a
// given notification type — missing/never-set preferences default to "on"
// so this never silently stops notifying people who've never touched the
// setting.
export async function filterUsersByNotificationPref(
  userIds: ObjectId[],
  type: keyof NotificationSettings
): Promise<ObjectId[]> {
  if (!userIds.length) return [];
  if (!hasDb()) return userIds;
  try {
    const { users } = await collections();
    const optedOut = await users
      .find({ _id: { $in: userIds }, [`notificationSettings.${type}`]: false })
      .project({ _id: 1 })
      .toArray();
    const optedOutIds = new Set(optedOut.map((u) => u._id.toString()));
    return userIds.filter((id) => !optedOutIds.has(id.toString()));
  } catch (err) {
    console.error("[queries] filterUsersByNotificationPref — notifying everyone:", err);
    return userIds;
  }
}
