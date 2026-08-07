import type { Metadata } from "next";
import {
  getTopDiscussions,
  getPopularTags,
  getTopContributors,
  getMostActiveNovels,
  getTrending,
  getAllNovels,
} from "@/lib/queries";
import { CommunityClient } from "@/components/community/community-client";
import { AdSlot } from "@/components/ads/ad-slot";

export function generateMetadata({ searchParams }: { searchParams: { thread?: string } }): Metadata {
  return {
    title: searchParams.thread ? `${searchParams.thread} · Community` : "Community",
    description: "Browse and join real discussions with other readers on Knight Novel.",
  };
}

export default async function CommunityPage() {
  const [discussions, popularTags, topContributors, mostActiveNovels, trendingNovels, novels] = await Promise.all([
    getTopDiscussions(50, "recent"),
    getPopularTags(10),
    getTopContributors(6),
    getMostActiveNovels(5),
    getTrending(5),
    getAllNovels(),
  ]);

  return (
    <CommunityClient
      discussions={discussions}
      popularTags={popularTags}
      topContributors={topContributors}
      mostActiveNovels={mostActiveNovels}
      trendingNovels={trendingNovels}
      novels={novels}
      topAd={<AdSlot page="community" position="top" />}
      middleAd={<AdSlot page="community" position="middle" />}
      bottomAd={<AdSlot page="community" position="bottom" />}
    />
  );
}
