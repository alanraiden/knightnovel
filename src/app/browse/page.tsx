import type { Metadata } from "next";
import { getAllNovels } from "@/lib/queries";
import { BrowseClient } from "@/components/browse/browse-client";

type SearchParams = { genre?: string; tag?: string; status?: string; sort?: string; country?: string };

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const parts: string[] = [];
  if (searchParams.genre) parts.push(searchParams.genre);
  if (searchParams.tag) parts.push(searchParams.tag);
  if (searchParams.status) parts.push(searchParams.status);
  if (searchParams.country) parts.push(searchParams.country);

  const title = parts.length ? `${parts.join(" · ")} Novels` : "Browse Novels";
  const description = parts.length
    ? `Browse ${parts.join(", ")} web novels on Knight Novel.`
    : "Browse web novels by genre, tag, status, and country on Knight Novel.";

  return { title, description };
}

// Server Component: the full novel list is fetched and rendered into the
// initial HTML (SEO-safe), then handed to a client component that owns the
// interactive filter state. No client-side data fetching involved.
export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const novels = await getAllNovels();
  return <BrowseClient novels={novels} initialParams={searchParams} />;
}
