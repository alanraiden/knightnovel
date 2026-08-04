"use client";

import { useMemo, useState } from "react";
import { NovelCard } from "@/components/novel/novel-card";
import { FilterDrawer, type BrowseFilters } from "@/components/browse/filter-drawer";
import { cn } from "@/lib/utils";
import type { NovelView } from "@/lib/queries";

interface InitialParams {
  genre?: string;
  tag?: string;
  status?: string;
  sort?: string;
  country?: string;
}

// "125.4K" / "2.1M" / "980" -> a real comparable number.
function parseViews(v: string): number {
  const n = parseFloat(v);
  if (v.endsWith("M")) return n * 1_000_000;
  if (v.endsWith("K")) return n * 1_000;
  return n || 0;
}

const quickFilters = [
  { label: "Trending", sort: "trending" },
  { label: "Newly Added", sort: "newest" },
  { label: "Recently Updated", sort: "updated" },
] as const;

export function BrowseClient({ novels, initialParams }: { novels: NovelView[]; initialParams?: InitialParams }) {
  const [filters, setFilters] = useState<BrowseFilters>(() => ({
    status: initialParams?.status ? [initialParams.status] : [],
    genres: initialParams?.genre ? [initialParams.genre] : [],
    tags: initialParams?.tag ? initialParams.tag.split(",") : [],
    sort: initialParams?.sort ?? "",
    country: initialParams?.country ? [initialParams.country] : [],
  }));

  const availableTags = useMemo(() => {
    const seen = new Set<string>();
    novels.forEach((n) => n.tags.forEach((t) => seen.add(t)));
    return [...seen].sort();
  }, [novels]);

  const results = useMemo(() => {
    const filtered = novels.filter((n) => {
      if (filters.status.length && !filters.status.includes(n.status)) return false;
      if (filters.genres.length && !filters.genres.some((g) => n.genres.includes(g))) return false;
      if (filters.tags.length && !filters.tags.some((t) => n.tags.includes(t))) return false;
      if (filters.country.length && !filters.country.some((c) => c.toLowerCase() === n.country)) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (filters.sort) {
      case "trending":
      case "Most popular":
        sorted.sort((a, b) => parseViews(b.views) - parseViews(a.views));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "updated":
        sorted.sort((a, b) => new Date(b.lastChapterAddedAt).getTime() - new Date(a.lastChapterAddedAt).getTime());
        break;
      case "Most rated":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "Ascending":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "Descending":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break; // no explicit sort chosen — keep catalog order
    }
    return sorted;
  }, [novels, filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-medium text-text-primary">Browse</h1>
        <div className="flex flex-wrap items-center gap-2">
          {quickFilters.map((qf) => (
            <button
              key={qf.sort}
              onClick={() =>
                setFilters((prev) => ({ ...prev, sort: prev.sort === qf.sort ? "" : qf.sort }))
              }
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5",
                filters.sort === qf.sort
                  ? "bg-accent-highlight text-[#412402] hover:brightness-110"
                  : "border border-accent-highlight/40 text-accent-highlight hover:bg-accent-highlight/10"
              )}
            >
              {qf.label}
            </button>
          ))}
          <FilterDrawer filters={filters} onChange={setFilters} availableTags={availableTags} />
        </div>
      </div>

      {results.length === 0 ? (
        <p className="py-16 text-center text-sm text-text-muted">No novels match these filters.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {results.map((n) => (
            <NovelCard key={n.slug} novel={n} />
          ))}
        </div>
      )}
    </div>
  );
}
