import type { MetadataRoute } from "next";
import { getAllNovels, getAllChaptersForSitemap } from "@/lib/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knightnovel.com";

// Fully dynamic — pulls every novel and every published chapter straight
// from MongoDB (with the usual demo-data fallback when no DB is
// configured), so new novels/chapters show up here automatically with no
// manual edits. If the catalog grows very large (tens of thousands of
// chapters), split this into a sitemap index via Next's `generateSitemaps`
// API — noted here rather than built now since it adds real complexity
// this catalog doesn't need yet.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [novels, chapters] = await Promise.all([getAllNovels(), getAllChaptersForSitemap()]);

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

  return [...staticPages, ...novelPages, ...chapterPages];
}
