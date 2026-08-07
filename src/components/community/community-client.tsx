"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Search, Plus, Tags, Users, TrendingUp, Flame } from "lucide-react";
import { DiscussionCard } from "@/components/community/discussion-card";
import { CreateDiscussionModal } from "@/components/community/create-discussion-modal";
import { cn } from "@/lib/utils";
import type { DiscussionView, NovelView } from "@/lib/queries";

const sortOptions = ["Recent", "Popular"] as const;

export function CommunityClient({
  discussions,
  popularTags,
  topContributors,
  mostActiveNovels,
  trendingNovels,
  novels,
  topAd,
  middleAd,
  bottomAd,
}: {
  discussions: DiscussionView[];
  popularTags: { tag: string; count: number }[];
  topContributors: { name: string; count: number }[];
  mostActiveNovels: { novel: NovelView; discussionCount: number }[];
  trendingNovels: NovelView[];
  novels: NovelView[];
  topAd?: React.ReactNode;
  middleAd?: React.ReactNode;
  bottomAd?: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("Recent");
  const [novelFilter, setNovelFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const novelOptions = useMemo(() => {
    const seen = new Map<string, string>();
    discussions.forEach((d) => seen.set(d.novelSlug, d.novelTitle));
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [discussions]);

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    discussions.forEach((d) => d.category && seen.add(d.category));
    return [...seen].sort();
  }, [discussions]);

  const filtered = useMemo(() => {
    let list = discussions;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) => d.title.toLowerCase().includes(q) || d.novelTitle.toLowerCase().includes(q)
      );
    }
    if (novelFilter) list = list.filter((d) => d.novelSlug === novelFilter);
    if (categoryFilter) list = list.filter((d) => d.category === categoryFilter);
    return [...list].sort((a, b) =>
      sort === "Popular" ? b.up - a.up : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [discussions, query, sort, novelFilter, categoryFilter]);

  // Separate content sections rather than one merged feed — novel-page
  // discussion threads vs. per-chapter comments read very differently.
  const communityDiscussions = filtered.filter((d) => d.chapterNumber === null);
  const chapterComments = filtered.filter((d) => d.chapterNumber !== null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Search + filter bar. Sticky on sm+ only, where it's a single compact
          row — on mobile it stacks into 4 rows (search / sort / novel /
          category), so keeping it sticky there pinned nearly half the
          screen permanently, unlike Browse's non-sticky filter bar. */}
      <div className="glass sm:sticky sm:top-14 z-20 -mx-4 mb-6 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <h1 className="hidden text-lg font-medium text-text-primary sm:block">Community</h1>
        <div className="flex flex-1 items-center gap-2 rounded border border-border bg-card/60 px-3 py-2 sm:max-w-sm">
          <Search size={15} className="text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search discussions or novels…"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {sortOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition-colors",
                s === sort ? "bg-accent-highlight text-[#412402]" : "border border-border text-text-secondary"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={novelFilter}
          onChange={(e) => setNovelFilter(e.target.value)}
          className="rounded border border-border bg-card/60 px-2 py-1.5 text-xs text-text-secondary"
        >
          <option value="">All novels</option>
          {novelOptions.map(([slug, title]) => (
            <option key={slug} value={slug}>
              {title}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border border-border bg-card/60 px-2 py-1.5 text-xs text-text-secondary"
        >
          <option value="">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCreateOpen(true)}
          className="hidden shrink-0 items-center gap-1.5 rounded bg-accent-highlight px-3 py-2 text-xs font-medium text-[#412402] transition-transform hover:scale-[1.03] sm:flex"
        >
          <Plus size={14} /> New discussion
        </button>
      </div>

      {topAd && <div className="mb-6">{topAd}</div>}

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-10">
          {/* Section: Most Active Novels — horizontal cover strip */}
          <section>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-text-primary">
              <Flame size={14} className="text-accent-highlight" /> Most Active Novels
            </p>
            {mostActiveNovels.length === 0 ? (
              <p className="text-xs text-text-muted">No activity yet.</p>
            ) : (
              <div className="themed-scroll flex gap-3 overflow-x-auto pb-1">
                {mostActiveNovels.map(({ novel, discussionCount }) => (
                  <Link
                    key={novel.slug}
                    href={`/novel/${novel.slug}`}
                    className="group glass flex w-28 shrink-0 flex-col items-center rounded-card p-2 text-center shadow-md transition-all duration-200 hover:-translate-y-1.5 hover:border-accent-highlight/60 hover:shadow-2xl"
                  >
                    <div className="relative h-20 w-16 overflow-hidden rounded bg-card">
                      {novel.cover && (
                        <Image
                          src={novel.cover}
                          alt={novel.title}
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[11px] text-text-primary">{novel.title}</p>
                    <p className="text-[10px] text-accent-highlight">{discussionCount} discussions</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Section: Community Discussions — novel-page threads */}
          <section>
            <p className="mb-3 text-sm font-medium text-text-primary">Community Discussions</p>
            {communityDiscussions.length === 0 ? (
              <p className="rounded-card border border-border bg-surface p-6 text-center text-sm text-text-muted">
                No novel-page discussions yet — be the first to start one.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {communityDiscussions.map((d) => (
                  <DiscussionCard key={d.id} d={d} />
                ))}
              </div>
            )}
          </section>

          {middleAd && <div>{middleAd}</div>}

          {/* Section: Latest Chapter Comments */}
          <section>
            <p className="mb-3 text-sm font-medium text-text-primary">Latest Chapter Comments</p>
            {chapterComments.length === 0 ? (
              <p className="rounded-card border border-border bg-surface p-6 text-center text-sm text-text-muted">
                No chapter comments yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {chapterComments.map((d) => (
                  <DiscussionCard key={d.id} d={d} />
                ))}
              </div>
            )}
          </section>

          {bottomAd && <div>{bottomAd}</div>}
        </div>

        <aside className="hidden space-y-6 lg:block">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-primary">
              <TrendingUp size={14} className="text-accent-highlight" /> Trending Novels
            </p>
            <div className="space-y-2">
              {trendingNovels.map((n) => (
                <Link
                  key={n.slug}
                  href={`/novel/${n.slug}`}
                  className="block truncate rounded px-2 py-1.5 text-xs text-text-secondary hover:bg-surface hover:text-text-primary"
                >
                  {n.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-primary">
              <Tags size={14} className="text-accent-highlight" /> Popular Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {popularTags.map((t) => (
                <Link
                  key={t.tag}
                  href={`/browse?tag=${encodeURIComponent(t.tag)}`}
                  className="rounded border border-border px-2 py-1 text-[11px] text-text-secondary transition-all duration-200 hover:border-accent-highlight/60 hover:text-text-primary"
                >
                  {t.tag}
                </Link>
              ))}
              {popularTags.length === 0 && <p className="text-xs text-text-muted">No tags yet.</p>}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-primary">
              <Users size={14} className="text-accent-highlight" /> Top Contributors
            </p>
            <div className="space-y-1.5">
              {topContributors.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{c.name}</span>
                  <span className="text-text-muted">{c.count}</span>
                </div>
              ))}
              {topContributors.length === 0 && <p className="text-xs text-text-muted">No activity yet.</p>}
            </div>
          </div>
        </aside>
      </div>

      {/* Floating action button — mobile only */}
      <button
        onClick={() => setCreateOpen(true)}
        aria-label="New discussion"
        className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-accent-highlight text-[#412402] shadow-2xl transition-transform hover:scale-105 sm:hidden"
      >
        <Plus size={22} />
      </button>

      <CreateDiscussionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        novels={novels}
        isLoggedIn={Boolean(session)}
      />
    </div>
  );
}
