import { ObjectId } from "mongodb";

export type NovelStatus = "ongoing" | "completed" | "hiatus" | "dropped";
export type Country = "chinese" | "korean" | "japanese";

export interface Novel {
  _id?: ObjectId;
  slug: string;
  title: string;
  altTitles: string[];
  authors: string[];
  description: string;
  coverImageUrl: string;
  /** Optional wide cinematic art for the homepage hero slide. Falls back to a
   *  blurred coverImageUrl when unset — see fromMongo() in queries.ts. */
  heroBackgroundUrl?: string;
  genres: string[];
  tags: string[];
  status: NovelStatus;
  country: Country;
  chapterCount: number;
  wordCount: number;
  counters: {
    viewsTotal: number;
    viewsDaily: number;
    viewsWeekly: number;
    viewsMonthly: number;
    favorites: number;
    ratingAvg: number;
    ratingCount: number;
    commentCount: number;
  };
  isFeatured: boolean;
  featuredOrder?: number;
  featuredHighlight: boolean;
  relatedNovelIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastChapterAddedAt: Date;
  seo: { metaTitle: string; metaDescription: string };
}

export interface Chapter {
  _id?: ObjectId;
  novelId: ObjectId;
  chapterNumber: number;
  title: string;
  slug: string;
  content: string;
  wordCount: number;
  status: "published" | "draft";
  publishedAt: Date;
  updatedAt: Date;
  views: number;
}

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string; // max 100 chars, enforced at the API layer
  favoriteGenre?: string; // one of GENRES, from src/lib/genres.ts
  role: "user" | "moderator" | "admin";
  createdAt: Date;
  lastActiveAt: Date;
  stats: { chaptersRead: number; favoritesCount: number; commentsCount: number };
  settings: { theme: "light" | "dark" | "sepia"; fontSize: number; fontFamily: string; lineHeight: number };
  notificationSettings?: { reply: boolean; mention: boolean; chapter_update: boolean; announcement: boolean };
  status: "active" | "banned" | "suspended";
}

export interface ReadingProgress {
  _id?: ObjectId;
  userId: ObjectId;
  novelId: ObjectId;
  chapterId: ObjectId;
  chapterNumber: number;
  scrollPercent: number;
  updatedAt: Date;
}

export interface Bookmark {
  _id?: ObjectId;
  userId: ObjectId;
  novelId: ObjectId;
  folderId?: ObjectId;
  createdAt: Date;
}

// Fully independent of Bookmark — see spec Section 5/7.
export interface Favorite {
  _id?: ObjectId;
  userId: ObjectId;
  novelId: ObjectId;
  createdAt: Date;
}

export interface Folder {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  createdAt: Date;
}

export interface Comment {
  _id?: ObjectId;
  targetType: "novel" | "chapter";
  targetId: ObjectId | string; // ObjectId for chapters, slug string for novel-level discussion
  parentId?: ObjectId | null;
  authorId?: ObjectId | null; // null for ghost comments
  displayName: string;
  title?: string; // optional discussion-thread title, only meaningful for top-level novel-level posts
  category?: string; // e.g. "Discussion", "Recommendation", "Question", "Theory" — top-level novel posts only
  isPinned?: boolean;
  isLocked?: boolean; // locked discussions accept no new replies
  body: string;
  stickerUrl?: string; // user-uploaded image attached to this comment — no curated packs
  gifUrl?: string;
  isSpoiler: boolean;
  votes: { up: number; down: number };
  views?: number;
  reportCount: number;
  status: "visible" | "hidden" | "removed";
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date; // set only when the author edits the body after posting
  // Admin-only fields — must be stripped from any public API response.
  isGhost?: boolean;
  ghostCreatedBy?: ObjectId;
}
