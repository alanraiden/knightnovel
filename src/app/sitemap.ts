import type { MetadataRoute } from "next";
import { getNovelsForSitemap, getAllChaptersForSitemap, getDiscussionsForSitemap } from "@/lib/queries";

// force-dynamic + revalidate=0: never let Next.js cache this route.
// Without these, the App Router may serve a stale, build-time-generated
// sitemap.xml even after novels or chapters have been hard-deleted from
// MongoDB — causing invalid URLs like /novel/shadow-slave/chapter/9999 to
// persist until the next full redeployment.
//
// With force-dynamic every request to /sitemap.xml runs the sitemap()
// function live against the database, so the sitemap always matches the
// current state of the collection with no manual intervention required.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knightnovel.com";

// Fully dynamic — pulls every novel and every published chapter straight
// from MongoDB. New novels/chapters show up here automatically and deleted
// ones disappear immediately on the next request — no manual edits or
// redeployments needed. If the catalog grows very large (tens of thousands
// of chapters), split this into a sitemap index via Next's `generateSitemaps`
// API — noted here rather than built now since it adds real complexity this
// catalog doesn't need yet.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [novels, chapters, discussions] = await Promise.all([
    getNovelsForSitemap(),
    getAllChaptersForSitemap(),
    getDiscussionsForSitemap(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/browse`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/rankings`, changeFrequency: "daily", priority: 0.6 },
    { url: `${siteUrl}/community`, changeFrequency: "hourly", priority: 0.6 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/dmca`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const novelPages: MetadataRoute.Sitemap = novels.map((n) => ({
    url: `${siteUrl}/novel/${n.slug}`,
    lastModified: new Date(n.lastChapterAddedAt),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const chapterPages: MetadataRoute.Sitemap = chapters.map((c) => ({
    url: `${siteUrl}/novel/${c.novelSlug}/chapter/${c.chapterNumber}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Eligible community discussions: visible, root-level, novel-scoped.
  // Hidden / removed discussions are excluded by getDiscussionsForSitemap.
  const discussionPages: MetadataRoute.Sitemap = discussions.map((d) => ({
    url: `${siteUrl}/community/discussion/${d.id}`,
    lastModified: new Date(d.updatedAt),
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticPages, ...novelPages, ...chapterPages, ...discussionPages];
}
