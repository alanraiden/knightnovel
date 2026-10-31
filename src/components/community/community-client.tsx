"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Search, Plus, Tags, Users, TrendingUp, Flame } from "lucide-react";
import { DiscussionCard } from "@/components/community/discussion-card";
import { ChapterCommentCard } from "@/components/community/chapter-comment-card";
import { CreateDiscussionModal } from "@/components/community/create-discussion-modal";
import { cn } from "@/lib/utils";
import type { DiscussionView, ChapterCommentView, NovelView } from "@/lib/queries";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab     = "discussions" | "chapter" | "spoilers";
type SortOpt = "newest" | "oldest" | "popular";

interface DraftState {
  search:    string;
  novelSlug: string;
  sort:      SortOpt;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS: Tab[] = ["discussions", "chapter", "spoilers"];

const TAB_LABELS: Record<Tab, string> = {
  discussions: "Discussions",
  chapter:     "Chapter Comments",
  spoilers:    "Spoilers",
};

const EMPTY_MSG: Record<Tab, string> = {
  discussions: "No discussions yet — be the first to start one.",
  chapter:     "No chapter comments yet.",
  spoilers:    "No spoiler discussions yet.",
};

const DEFAULT_DRAFT: DraftState = { search: "", novelSlug: "", sort: "newest" };

// ─── Component ───────────────────────────────────────────────────────────────

export function CommunityClient({
  initialDiscussions,
  initialChapterComments,
  initialSpoilers,
  popularTags,
  topContributors,
  mostActiveNovels,
  trendingNovels,
  novels,
  topAd,
  middleAd,
  bottomAd,
}: {
  initialDiscussions:     DiscussionView[];
  initialChapterComments: ChapterCommentView[];
  initialSpoilers:        DiscussionView[];
  popularTags:            { tag: string; count: number }[];
  topContributors:        { name: string; count: number }[];
  mostActiveNovels:       { novel: NovelView; discussionCount: number }[];
  trendingNovels:         NovelView[];
  novels:                 NovelView[];
  topAd?:    React.ReactNode;
  middleAd?: React.ReactNode;
  bottomAd?: React.ReactNode;
}) {
  const { data: session } = useSession();

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<Tab>("discussions");

  // ── Filter state ──
  // `draft` = what is currently shown in the input controls.
  // Changes to draft do NOT trigger any request.
  // Only Apply Filters fires a request and persists the fetch.
  const [draft, setDraft] = useState<DraftState>(DEFAULT_DRAFT);
  const [loading, setLoading] = useState(false);

  // ── Per-tab item lists (SSR-initialised, replaced by Apply Filters) ──
  const [discussionItems,  setDiscussionItems]  = useState<DiscussionView[]>(initialDiscussions);
  const [chapterItems,     setChapterItems]     = useState<ChapterCommentView[]>(initialChapterComments);
  const [spoilerItems,     setSpoilerItems]     = useState<DiscussionView[]>(initialSpoilers);

  // ── Modal ──
  const [createOpen, setCreateOpen] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ tab: activeTab, sort: draft.sort });
      if (draft.novelSlug)   params.set("novel",  draft.novelSlug);
      if (draft.search.trim()) params.set("search", draft.search.trim());

      const res = await fetch(`/api/community?${params}`);
      if (!res.ok) return;

      const data = await res.json() as { items: unknown[] };
      if (activeTab === "discussions") setDiscussionItems(data.items as DiscussionView[]);
      else if (activeTab === "chapter") setChapterItems(data.items as ChapterCommentView[]);
      else setSpoilerItems(data.items as DiscussionView[]);
    } catch {
      // Network error — leave existing items in place.
    } finally {
      setLoading(false);
    }
  };

  // The items for whichever tab is visible right now.
  const currentItems =
    activeTab === "chapter"  ? chapterItems :
    activeTab === "spoilers" ? spoilerItems :
    discussionItems;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">

      {/* ── Filter bar ──────────────────────────────────────────────────────
          Sticky on sm+ (where it collapses to a single compact row).
          On mobile it stacks, so sticky is deliberately omitted to avoid
          permanently consuming half the screen. */}
      <div className="glass sm:sticky sm:top-14 z-20 -mx-4 mb-6 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <h1 className="hidden text-lg font-medium text-text-primary sm:block">Community</h1>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded border border-border bg-card/60 px-3 py-2 sm:max-w-sm">
          <Search size={15} className="shrink-0 text-text-muted" />
          <input
            value={draft.search}
            onChange={(e) => setDraft((p) => ({ ...p, search: e.target.value }))}
            placeholder="Search discussions or novels…"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>

        {/* Sort dropdown */}
        <select
          value={draft.sort}
          onChange={(e) => setDraft((p) => ({ ...p, sort: e.target.value as SortOpt }))}
          className="rounded border border-border bg-card/60 px-2 py-1.5 text-xs text-text-secondary"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Popular</option>
        </select>

        {/* Novel filter — uses the full novel list, not just what is in the feed */}
        <select
          value={draft.novelSlug}
          onChange={(e) => setDraft((p) => ({ ...p, novelSlug: e.target.value }))}
          className="rounded border border-border bg-card/60 px-2 py-1.5 text-xs text-text-secondary"
        >
          <option value="">All novels</option>
          {novels.map((n) => (
            <option key={n.slug} value={n.slug}>{n.title}</option>
          ))}
        </select>

        {/* Apply Filters — the ONLY action that fires a request */}
        <button
          onClick={applyFilters}
          disabled={loading}
          className="rounded border border-accent-highlight/60 px-3 py-1.5 text-xs font-medium text-accent-highlight transition-colors hover:bg-accent-highlight/10 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Apply Filters"}
        </button>

        {/* New discussion button — desktop only */}
        <button
          onClick={() => setCreateOpen(true)}
          className="hidden shrink-0 items-center gap-1.5 rounded bg-accent-highlight px-3 py-2 text-xs font-medium text-[#412402] transition-transform hover:scale-[1.03] sm:flex"
        >
          <Plus size={14} /> New discussion
        </button>
      </div>

      {topAd && <div className="mb-6">{topAd}</div>}

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-8">

          {/* ── Most Active Novels — horizontal cover strip ────────────────── */}
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

          {/* ── Tabs + Feed ───────────────────────────────────────────────── */}
          <section>
            {/* Tab strip */}
            <div className="flex border-b border-border">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === tab
                      ? "-mb-px border-b-2 border-accent-highlight text-accent-highlight"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Feed — single full-width card per row on all viewports */}
            <div className={cn("mt-4 space-y-3", loading && "pointer-events-none opacity-50")}>
              {currentItems.length === 0 ? (
                <p className="rounded-card border border-border bg-surface p-6 text-center text-sm text-text-muted">
                  {EMPTY_MSG[activeTab]}
                </p>
              ) : activeTab === "chapter" ? (
                chapterItems.map((item) => (
                  <ChapterCommentCard key={item.id} item={item} />
                ))
              ) : (
                (activeTab === "spoilers" ? spoilerItems : discussionItems).map((d) => (
                  <DiscussionCard key={d.id} d={d} />
                ))
              )}
            </div>
          </section>

          {middleAd && <div>{middleAd}</div>}
          {bottomAd && <div>{bottomAd}</div>}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
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
              {trendingNovels.length === 0 && (
                <p className="text-xs text-text-muted">No trending novels yet.</p>
              )}
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
              {topContributors.length === 0 && (
                <p className="text-xs text-text-muted">No activity yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile FAB ──────────────────────────────────────────────────────── */}
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
