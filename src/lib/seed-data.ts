// Lightweight in-memory demo data so the UI renders immediately without a
// populated database. Real pages should fetch from /api/* once MONGODB_URI
// is configured and `npm run seed` has been run — see scripts/seed.ts.

export interface DemoNovel {
  slug: string;
  title: string;
  altTitles: string[];
  author: string;
  cover: string;
  genres: string[];
  tags: string[];
  status: "ongoing" | "completed" | "hiatus";
  country: "chinese" | "korean" | "japanese";
  rating: number;
  chapterCount: number;
  description: string;
  views: string;
  createdAt: string; // ISO string, kept simple for the demo fallback
  lastChapterAddedAt: string;
}

export const demoNovels: DemoNovel[] = [
  {
    slug: "lord-of-mysteries",
    title: "Lord of Mysteries",
    altTitles: ["Kong Bai Zhi Shen", "The Lord of Mysteries"],
    author: "Cuttlefish That Loves Diving",
    cover: "/covers/lord-of-mysteries.jpg",
    genres: ["Fantasy", "Mystery", "Steampunk"],
    tags: ["Reincarnation", "System", "Weak to Strong", "Occult", "Detective"],
    status: "completed",
    country: "chinese",
    rating: 4.9,
    chapterCount: 1420,
    description:
      "A clandestine legend rises in a world of guns, potions, and supernatural secrets.",
    views: "125.4K",
    createdAt: new Date(Date.now() - 10 * 24 * 3600_000).toISOString(),
    lastChapterAddedAt: new Date(Date.now() - 1 * 3600_000).toISOString(),
  },
  {
    slug: "shadow-slave",
    title: "Shadow Slave",
    altTitles: ["Shadow's Slave"],
    author: "Guiltythree",
    cover: "/covers/shadow-slave.jpg",
    genres: ["Action", "Adventure"],
    tags: ["Nightmare", "Weak to Strong", "System"],
    status: "ongoing",
    country: "korean",
    rating: 4.8,
    chapterCount: 542,
    description: "Every night, Sunny becomes someone else — a Shadow, hunted through a nightmare realm.",
    views: "98.7K",
    createdAt: new Date(Date.now() - 20 * 24 * 3600_000).toISOString(),
    lastChapterAddedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    slug: "omniscient-readers-viewpoint",
    title: "Omniscient Reader's Viewpoint",
    altTitles: ["ORV"],
    author: "Sing Shong",
    cover: "/covers/orv.jpg",
    genres: ["Sci-Fi", "Action"],
    tags: ["Regression", "Apocalypse", "System"],
    status: "completed",
    country: "korean",
    rating: 4.9,
    chapterCount: 551,
    description: "The only reader of a webnovel finds himself living inside its ending.",
    views: "87.1K",
    createdAt: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(),
    lastChapterAddedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
  {
    slug: "martial-peak",
    title: "Martial Peak",
    altTitles: ["Wu Dong Qian Kun"],
    author: "Momo",
    cover: "/covers/martial-peak.jpg",
    genres: ["Xianxia", "Action"],
    tags: ["Cultivation", "Harem", "Weak to Strong"],
    status: "ongoing",
    country: "chinese",
    rating: 4.7,
    chapterCount: 6304,
    description: "The journey to the martial peak is a long, solitary and treacherous one.",
    views: "125.4K",
    createdAt: new Date(Date.now() - 30 * 24 * 3600_000).toISOString(),
    lastChapterAddedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    slug: "reverend-insanity",
    title: "Reverend Insanity",
    altTitles: ["Kuang Shi Zhi Nu"],
    author: "Gu Zhen Ren",
    cover: "/covers/reverend-insanity.jpg",
    genres: ["Xianxia", "Adventure"],
    tags: ["Anti-hero", "Cultivation", "Reincarnation"],
    status: "completed",
    country: "chinese",
    rating: 4.7,
    chapterCount: 2334,
    description: "A cunning and ruthless cultivator schemes his way to immortality.",
    views: "76.3K",
    createdAt: new Date(Date.now() - 15 * 24 * 3600_000).toISOString(),
    lastChapterAddedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
  },
  {
    slug: "the-beginning-after-the-end",
    title: "The Beginning After the End",
    altTitles: ["TBATE"],
    author: "TurtleMe",
    cover: "/covers/tbate.jpg",
    genres: ["Fantasy", "Adventure"],
    tags: ["Reincarnation", "Magic", "Kingdom Building"],
    status: "ongoing",
    country: "korean",
    rating: 4.6,
    chapterCount: 427,
    description: "King Grey reigned supreme, but solitude clouded his victories. Reborn, he's given a second life.",
    views: "65.2K",
    createdAt: new Date(Date.now() - 8 * 24 * 3600_000).toISOString(),
    lastChapterAddedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
];

export const demoGenres = [
  "Fantasy", "Action", "Adventure", "Romance", "Xianxia", "Sci-Fi",
  "Mystery", "Comedy", "Drama", "Slice of Life", "GameLit", "Horror",
];

export const demoTags = [
  "Reincarnation", "System", "Weak to Strong", "Regression", "Revenge",
  "Reverse Harem", "Cultivation", "Apocalypse", "Nightmare", "Anti-hero",
  "Magic", "Kingdom Building", "Occult", "Detective", "Harem",
  // ...70+ in production, truncated for demo
];

export const demoComments = [
  {
    id: "c1",
    author: "Alice",
    body: "What do you think about the latest chapter of LOTM? That twist was insane!",
    likes: 32,
    replies: 26,
    timeAgo: "2m ago",
    context: "Lord of Mysteries · Chapter 1183",
  },
  {
    id: "c2",
    author: "Ethereal",
    body: "Just caught up with Shadow Slave... Sunny's new ability is incredible.",
    likes: 15,
    replies: 8,
    timeAgo: "15m ago",
    context: "Shadow Slave · Chapter 542",
  },
];
