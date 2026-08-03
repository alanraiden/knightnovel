import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNovelBySlug, getAllNovels, getChapterContent, getCommentsPage, incrementNovelViews } from "@/lib/queries";
import { ReadingShell } from "@/components/chapter/reading-shell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knightnovel.com";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; chapterNumber: string };
}): Promise<Metadata> {
  const novel = await getNovelBySlug(params.slug);
  if (!novel) return {};
  const url = `${siteUrl}/novel/${params.slug}/chapter/${params.chapterNumber}`;
  const title = `Chapter ${params.chapterNumber} — ${novel.title}`;
  return {
    title,
    alternates: { canonical: url },
    openGraph: {
      title,
      type: "article",
      url,
      images: novel.cover ? [{ url: novel.cover }] : undefined,
    },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; chapterNumber: string };
}) {
  const chapterNumber = Number(params.chapterNumber);
  if (Number.isNaN(chapterNumber)) notFound();

  const [novel, allNovels] = await Promise.all([getNovelBySlug(params.slug), getAllNovels()]);
  if (!novel) notFound();

  // Fire-and-forget — a view counter failing shouldn't ever block the page
  // from rendering, and there's no reason to make the reader wait on it.
  incrementNovelViews(novel.slug).catch(() => {});

  const chapterDoc = await getChapterContent(params.slug, chapterNumber);
  // Real chapter id when available (DB-backed), otherwise a stable
  // composite string so comments still have a consistent target to attach to.
  const commentTargetId = chapterDoc?.id ?? `${novel.slug}-ch-${chapterNumber}`;
  const commentsPage = await getCommentsPage("chapter", commentTargetId, { sort: "top", offset: 0, limit: 20 });

  // "You might also like" — random sample, distinct from tag-overlap related novels.
  const suggestions = [...allNovels]
    .filter((n) => n.slug !== novel.slug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: novel.title, item: `${siteUrl}/novel/${novel.slug}` },
      {
        "@type": "ListItem",
        position: 3,
        name: `Chapter ${chapterNumber}`,
        item: `${siteUrl}/novel/${novel.slug}/chapter/${chapterNumber}`,
      },
    ],
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ReadingShell
        novel={novel}
        chapterNumber={chapterNumber}
        chapterCount={novel.chapterCount}
        chapterContent={chapterDoc?.content ?? null}
        suggestions={suggestions}
        commentTargetId={commentTargetId}
        initialComments={commentsPage.comments}
        totalTopLevel={commentsPage.totalTopLevel}
        totalAll={commentsPage.totalAll}
        hasMore={commentsPage.hasMore}
      />
    </>
  );
}
