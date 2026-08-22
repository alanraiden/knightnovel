import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNovelBySlug, getNovelSlugs, getAllNovels, getCommentsPage, getUserNovelStatus, incrementNovelViews } from "@/lib/queries";
import { NovelActions } from "@/components/novel/novel-actions";
import { TagList } from "@/components/novel/tag-list";
import { ChapterList } from "@/components/novel/chapter-list";
import { AdSlot } from "@/components/ads/ad-slot";
import { CommentThread } from "@/components/novel/comment-thread";
import { NovelCard } from "@/components/novel/novel-card";
import { DescriptionCollapse } from "@/components/novel/description-collapse";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knightnovel.com";

export async function generateStaticParams() {
  const slugs = await getNovelSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Builds a clean, unique meta description for a novel page.
// Rules (applied in order):
//  1. Strip common leading markdown / HTML noise from the raw description.
//  2. Use the first non-empty paragraph only (descriptions are often multi-paragraph).
//  3. Trim to a word boundary at ≤ 155 characters and append "…".
//  4. When the description is absent or too short to be useful, synthesise a
//     unique fallback from structured fields — guaranteeing every novel page
//     gets a distinct description even without editorial copy.
function buildNovelDescription(novel: { title: string; author: string; description: string; genres: string[]; chapterCount: number }): string {
  const MAX = 155;

  let text = novel.description ?? "";

  // Strip leading markdown/HTML artefacts that sometimes appear in scraped descriptions.
  text = text
    .replace(/^#{1,6}\s+/, "")   // # Heading
    .replace(/^\*{1,2}/, "")     // *bold* or **bold**
    .replace(/^_{1,2}/, "")      // _italic_
    .replace(/^<[^>]+>/, "")     // <tag>
    .trim();

  // Take the first paragraph (split on blank line or \n\n).
  const firstPara = text.split(/\n\s*\n/)[0].replace(/\n/g, " ").trim();

  if (firstPara.length >= 40) {
    if (firstPara.length <= MAX) return firstPara;
    // Trim to word boundary.
    const cut = firstPara.slice(0, MAX);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut) + "…";
  }

  // Unique structured fallback — always distinct per novel.
  const genre = novel.genres[0] ?? "web novel";
  const chapters = novel.chapterCount > 0 ? ` — ${novel.chapterCount} chapters` : "";
  return `Read ${novel.title}${chapters} of ${genre} by ${novel.author} on Knight Novel.`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const novel = await getNovelBySlug(params.slug);
  if (!novel) return {};
  const url = `${siteUrl}/novel/${novel.slug}`;
  const description = buildNovelDescription(novel);
  return {
    title: novel.title,
    description,
    keywords: [...novel.genres, ...novel.tags],
    alternates: { canonical: url },
    openGraph: {
      title: novel.title,
      description,
      type: "book",
      url,
      images: novel.cover ? [{ url: novel.cover }] : undefined,
    },
  };
}

// Tag-overlap related novels (see spec Section 11). In production this
// should be precomputed on a schedule and cached as relatedNovelIds on the
// novel document — this inline scoring is fine for a catalog this size but
// won't scale to a large one without that batch job.
function relatedByTagOverlap(novel: NonNullable<Awaited<ReturnType<typeof getNovelBySlug>>>, all: Awaited<ReturnType<typeof getAllNovels>>) {
  return all
    .filter((n) => n.slug !== novel.slug)
    .map((n) => ({ n, score: n.tags.filter((t) => novel.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.n);
}

export default async function NovelPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [novel, allNovels] = await Promise.all([getNovelBySlug(params.slug), getAllNovels()]);
  if (!novel) notFound();

  // Fire-and-forget, same pattern as the chapter page — a view counter
  // failing shouldn't block the page, and there's no reason to wait on it.
  incrementNovelViews(novel.slug).catch(() => {});

  const [related, commentsPage, { isBookmarked, isFavorited }] = await Promise.all([
    Promise.resolve(relatedByTagOverlap(novel, allNovels)),
    getCommentsPage("novel", novel.slug, { sort: "top", offset: 0, limit: 20 }),
    getUserNovelStatus(userId, novel.slug),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: novel.title,
    author: { "@type": "Person", name: novel.author },
    genre: novel.genres,
    image: novel.cover || undefined,
    aggregateRating:
      novel.rating > 0
        ? { "@type": "AggregateRating", ratingValue: novel.rating, reviewCount: 1 }
        : undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Browse", item: `${siteUrl}/browse` },
      { "@type": "ListItem", position: 3, name: novel.title, item: `${siteUrl}/novel/${novel.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mb-4">
        <AdSlot page="novel" position="top" />
      </div>

      <div className="relative overflow-hidden rounded-card">
        {novel.cover && (
          <div className="absolute inset-0">
            <Image src={novel.cover} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-30 blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-base via-base/80 to-base/40" />
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(10,15,28,0.5) 100%)" }}
            />
          </div>
        )}

        <div className="relative flex gap-4 p-4 sm:gap-6 sm:p-6">
          <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-card bg-card sm:h-56 sm:w-40 md:h-64 md:w-48">
            {novel.cover ? (
              <Image
                src={novel.cover}
                alt={novel.title}
                fill
                sizes="(max-width: 640px) 112px, (max-width: 768px) 160px, 192px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-text-disabled">cover</div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-medium text-text-primary sm:text-2xl">{novel.title}</h1>
            <p className="mt-1 text-sm text-text-secondary">{novel.author}</p>
            <p className="text-xs text-text-muted">Alt names: {novel.altTitles.join(" / ")}</p>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <span className="capitalize text-status-success">Status: {novel.status}</span>
              <span className="flex items-center gap-1 text-accent-highlight">
                ★ {novel.rating > 0 ? novel.rating.toFixed(1) : "Not yet rated"}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
              <span>{novel.views} views</span>
              <span>{novel.chapterCount} chapters</span>
            </div>
            {novel.genres.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {novel.genres.map((g) => (
                  <Link
                    key={g}
                    href={`/browse?genre=${encodeURIComponent(g)}`}
                    className="rounded bg-card px-2 py-0.5 text-[11px] text-text-secondary transition-all duration-200 hover:border-accent-highlight/60 hover:text-text-primary border border-transparent"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <NovelActions
          novelSlug={novel.slug}
          novelTitle={novel.title}
          initialBookmarked={isBookmarked}
          initialFavorited={isFavorited}
        />
      </div>

      <div className="mt-4">
        <TagList tags={novel.tags} />
      </div>

      <DescriptionCollapse text={novel.description} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div className="space-y-8">
          <ChapterList slug={novel.slug} chapterCount={novel.chapterCount} />

          <AdSlot page="novel" position="middle" />

          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">Ratings & reviews</p>
            <div className="rounded-card border border-border bg-surface p-3 text-sm text-text-muted">
              No reviews yet — be the first to review this novel.
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">Discussion</p>
            <CommentThread
              targetType="novel"
              targetId={novel.slug}
              initialComments={commentsPage.comments}
              totalTopLevel={commentsPage.totalTopLevel}
              totalAll={commentsPage.totalAll}
              hasMore={commentsPage.hasMore}
            />
          </div>
        </div>

        <aside>
          <p className="mb-2 text-sm font-medium text-text-primary">Related novels</p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 lg:gap-3">
            {related.map((n) => (
              <NovelCard key={n.slug} novel={n} />
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <AdSlot page="novel" position="bottom" />
      </div>
    </div>
  );
}
