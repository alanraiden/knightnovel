import Image from "next/image";
import { HeroCarousel } from "@/components/novel/hero-carousel";
import { NovelCard } from "@/components/novel/novel-card";
import { SectionHeader } from "@/components/layout/section-header";
import { DiscussionCard } from "@/components/community/discussion-card";
import { timeAgo } from "@/lib/utils";
import {
  getFeatured,
  getAllNovels,
  getTrending,
  getRankingsForPeriod,
  getNewlyAdded,
  getRecentlyUpdated,
  getTopDiscussions,
} from "@/lib/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knightnovel.com";

export const metadata = {
  title: "Knight Novel — Read Web Novels, Together",
  description:
    "Discover, read, and discuss web novels on Knight Novel — browse by genre, track your reading progress, and join real discussions with a community that isn't built around gamification.",
  alternates: { canonical: siteUrl },
};

export default async function HomePage() {
  const [featured, highlights, trending, rankings, newlyAdded, recentlyUpdated, discussions] =
    await Promise.all([
      getFeatured(5),
      getAllNovels(),
      getTrending(5),
      getRankingsForPeriod("day", 5),
      getNewlyAdded(5),
      getRecentlyUpdated(5),
      getTopDiscussions(8, "recent"),
    ]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Knight Novel",
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Knight Novel",
      url: siteUrl,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroCarousel novels={featured} />

      <section>
        <SectionHeader title="Highlights" href="/browse" />
        <div className="themed-scroll flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible md:grid-cols-6">
          {highlights.map((n, i) => (
            <div key={n.slug} className="w-24 shrink-0 sm:w-auto sm:shrink">
              <NovelCard novel={n} rank={i + 1} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="🔥 Trending" href="/browse?sort=trending" />
        <div className="themed-scroll flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible">
          {trending.map((n) => (
            <div key={n.slug} className="w-24 shrink-0 sm:w-auto sm:shrink">
              <NovelCard novel={n} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="🏆 Rankings" href="/rankings" />
        <div className="rounded-card border border-border bg-surface p-2">
          {rankings.map((n, i) => (
            <a
              key={n.slug}
              href={`/novel/${n.slug}`}
              className="flex items-center gap-3 rounded px-2 py-2 text-sm hover:bg-card"
            >
              <span className="w-4 text-text-muted">{i + 1}</span>
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-card">
                {n.cover && (
                  <Image src={n.cover} alt="" fill sizes="32px" className="object-cover" />
                )}
              </div>
              <span className="flex-1 truncate text-text-primary">{n.title}</span>
              <span className="text-accent-highlight">★ {n.rating}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <SectionHeader title="Newly Added" href="/browse?sort=newest" />
          <ul className="space-y-3">
            {newlyAdded.map((n) => (
              <li key={n.slug} className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-card">
                  {n.cover && (
                    <Image src={n.cover} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <a href={`/novel/${n.slug}`} className="block truncate text-sm text-text-primary">
                    {n.title}
                  </a>
                  <p className="truncate text-xs text-text-muted">{n.genres.join(" · ")}</p>
                </div>
                <span className="shrink-0 text-xs text-text-muted">{timeAgo(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeader title="Recently Updated" href="/browse?sort=updated" />
          <ul className="space-y-3">
            {recentlyUpdated.map((n) => (
              <li key={n.slug} className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-card">
                  {n.cover && (
                    <Image src={n.cover} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <a href={`/novel/${n.slug}`} className="block truncate text-sm text-text-primary">
                    {n.title}
                  </a>
                  <p className="truncate text-xs text-text-muted">Ch.{n.chapterCount}</p>
                </div>
                <span className="shrink-0 text-xs text-text-muted">{timeAgo(n.lastChapterAddedAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <SectionHeader title="Community" href="/community" linkText="View All Discussions →" />
        {discussions.length === 0 ? (
          <p className="rounded-card border border-border bg-surface p-4 text-sm text-text-muted">
            No discussions yet — be the first to start one.
          </p>
        ) : (
          <div className="themed-scroll flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4">
            {discussions.map((d) => (
              <div key={d.id} className="w-56 shrink-0 sm:w-auto sm:shrink">
                <DiscussionCard d={d} compact />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
