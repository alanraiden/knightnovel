import type { Metadata } from "next";
import { getAllNovels } from "@/lib/queries";
import { SearchClient } from "@/components/browse/search-client";

export function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Metadata {
  return {
    title: searchParams.q ? `Search: ${searchParams.q}` : "Search",
    robots: { index: false, follow: true }, // search results pages aren't worth indexing, but let bots follow links from here
  };
}

export default async function SearchPage() {
  const novels = await getAllNovels();
  return <SearchClient novels={novels} />;
}
