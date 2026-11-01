import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getDiscussionFeed,
  getChapterCommentFeed,
  getPopularTags,
  getTopContributors,
  getMostActiveNovels,
  getTrending,
  getAllNovels,
} from "@/lib/queries";
import { CommunityClient } from "@/components/community/community-client";
import { AdSlot } from "@/components/ads/ad-slot";

const VALID_TABS = new Set(["discussions", "chapter", "spoilers"]);

type Tab = "discussions" | "chapter" | "spoilers";

interface PageProps {
  searchParams: { thread?: string; tab?: string; page?: string };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  return {
    title: searchParams.thread ? `${searchParams.thread} · Community` : "Community",
    description: "Browse and join real discussions with other readers on Knight Novel.",
  };
}

async function CommunityPageInner({ searchParams }: PageProps) {
  const rawTab = searchParams.tab ?? "discussions";
  const initialTab: Tab = VALID_TABS.has(rawTab) ? (rawTab as Tab) : "discussions";

  const [
    discussionsFeed,
    chapterFeed,
    spoilersFeed,
    popularTags,
    topContributors,
    mostActiveNovels,
    trendingNovels,
    novels,
  ] = await Promise.all([
    getDiscussionFeed({ limit: 10 }),
    getChapterCommentFeed({ limit: 10 }),
    getDiscussionFeed({ limit: 10, isSpoiler: true }),
    getPopularTags(10),
    getTopContributors(6),
    getMostActiveNovels(3),
    getTrending(5),
    getAllNovels(),
  ]);

  return (
    <CommunityClient
      initialDiscussions={discussionsFeed.items}
      initialDiscussionsTotal={discussionsFeed.total}
      initialChapterComments={chapterFeed.items}
      initialChapterTotal={chapterFeed.total}
      initialSpoilers={spoilersFeed.items}
      initialSpoilersTotal={spoilersFeed.total}
      popularTags={popularTags}
      topContributors={topContributors}
      mostActiveNovels={mostActiveNovels}
      trendingNovels={trendingNovels}
      novels={novels}
      initialTab={initialTab}
      topAd={<AdSlot page="community" position="top" />}
      middleAd={<AdSlot page="community" position="middle" />}
      bottomAd={<AdSlot page="community" position="bottom" />}
    />
  );
}

export default function CommunityPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-6 text-sm text-text-muted">Loading community…</div>}>
      <CommunityPageInner {...props} />
    </Suspense>
  );
}
