"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Search, Plus, Tags, Users, TrendingUp, Flame, ChevronLeft, ChevronRight } from "lucide-react";
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

interface TabData<T> {
  items:   T[];
  total:   number;
  hasMore: boolean;
  page:    number;       // 1-based current page
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
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

// ─── Paginator ───────────────────────────────────────────────────────────────

function Paginator({
  page,
  totalPages,
  onGo,
  disabled,
}: {
  page:       number;
  totalPages: number;
  onGo:       (p: number) => void;
  disabled:   boolean;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inputVal,    setInputVal]    = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (totalPages <= 1) return null;

  // Build the page number sequence with at most one ellipsis on each side.
  // e.g. [1, "…", 4, 5, 6, "…", 12]
  const pages: (number | "…")[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(1);
  if (page > 4) pages.push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) add(p);
  if (page < totalPages - 3) pages.push("…");
  if (totalPages > 1) add(totalPages);

  const openPopover = () => {
    setInputVal(String(page));
    setPopoverOpen(true);
    setTimeout(() => inputRef.current?.select(), 30);
  };

  const commitGo = () => {
    const n = parseInt(inputVal, 10);
    if (n >= 1 && n <= totalPages && n !== page) onGo(n);
    setPopoverOpen(false);
  };

  const btnBase =
    "flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-xs font-medium transition-colors disabled:opacity-40";

  return (
    <div className="mt-6 flex items-center justify-center gap-1 text-text-secondary">
      {/* Previous */}
      <button
        onClick={() => onGo(page - 1)}
        disabled={page <= 1 || disabled}
        aria-label="Previous page"
        className={cn(btnBase, "hover:bg-surface hover:text-text-primary")}
      >
        <ChevronLeft size={14} />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "…" ? (
          <div key={`ellipsis-${i}`} className="relative">
            <button
              onClick={openPopover}
              className={cn(btnBase, "hover:bg-surface hover:text-text-primary")}
              aria-label="Jump to page"
            >
              …
            </button>
            {popoverOpen && (
              <div className="absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 rounded-card border border-border bg-surface p-3 shadow-2xl">
                <p className="mb-2 whitespace-nowrap text-[11px] text-text-muted">
                  Go to page (1–{totalPages})
                </p>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="number"
                    min={1}
                    max={totalPages}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitGo();
                      if (e.key === "Escape") setPopoverOpen(false);
                    }}
                    className="w-16 rounded border border-border bg-card px-2 py-1 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-highlight/60"
                  />
                  <button
                    onClick={commitGo}
                    className="rounded bg-accent-highlight px-2 py-1 text-xs font-medium text-[#412402]"
                  >
                    Go
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            key={p}
            onClick={() => p !== page && onGo(p as number)}
            disabled={disabled}
            className={cn(
              btnBase,
              p === page
                ? "bg-accent-highlight text-[#412402]"
                : "hover:bg-surface hover:text-text-primary"
            )}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onGo(page + 1)}
        disabled={page >= totalPages || disabled}
        aria-label="Next page"
        className={cn(btnBase, "hover:bg-surface hover:text-text-primary")}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CommunityClient({
  initialDiscussions,
  initialDiscussionsTotal,
  initialChapterComments,
  initialChapterTotal,
  initialSpoilers,
  initialSpoilersTotal,
  popularTags,
  topContributors,
  mostActiveNovels,
  trendingNovels,
  novels,
  initialTab,
  topAd,
  middleAd,
  bottomAd,
}: {
  initialDiscussions:      DiscussionView[];
  initialDiscussionsTotal: number;
  initialChapterComments:  ChapterCommentView[];
  initialChapterTotal:     number;
  initialSpoilers:         DiscussionView[];
  initialSpoilersTotal:    number;
  popularTags:             { tag: string; count: number }[];
  topContributors:         { name: string; count: number }[];
  mostActiveNovels:        { novel: NovelView; discussionCount: number }[];
  trendingNovels:          NovelView[];
  novels:                  NovelView[];
  initialTab:              Tab;
  topAd?:    React.ReactNode;
  middleAd?: React.ReactNode;
  bottomAd?: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // ── Filter state ──
  const [draft,   setDraft]   = useState<DraftState>(DEFAULT_DRAFT);
  // Applied filters (what the last fetch actually used)
  const [applied, setApplied] = useState<DraftState>(DEFAULT_DRAFT);
  const [loading, setLoading] = useState(false);

  // ── Per-tab data (items + total + page) ──
  const [discData, setDiscData] = useState<TabData<DiscussionView>>({
    items:   initialDiscussions,
    total:   initialDiscussionsTotal,
    hasMore: initialDiscussionsTotal > PAGE_SIZE,
    page:    1,
  });
  const [chapData, setChapData] = useState<TabData<ChapterCommentView>>({
    items:   initialChapterComments,
    total:   initialChapterTotal,
    hasMore: initialChapterTotal > PAGE_SIZE,
    page:    1,
  });
  const [spoilData, setSpoilData] = useState<TabData<DiscussionView>>({
    items:   initialSpoilers,
    total:   initialSpoilersTotal,
    hasMore: initialSpoilersTotal > PAGE_SIZE,
    page:    1,
  });

  // ── Modal ──
  const [createOpen, setCreateOpen] = useState(false);

  // ── URL sync helper ──
  const pushUrl = useCallback(
    (tab: Tab, page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      if (page > 1) params.set("page", String(page));
      else params.delete("page");
      router.push(`${pathname}?${params}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // ── Fetch a page (server-side) ──
  const fetchPage = useCallback(
    async (
      tab:    Tab,
      page:   number,
      filters: DraftState
    ) => {
      const offset = (page - 1) * PAGE_SIZE;
      const params = new URLSearchParams({
        tab,
        sort:   filters.sort,
        limit:  String(PAGE_SIZE),
        offset: String(offset),
      });
      if (filters.novelSlug)   params.set("novel",  filters.novelSlug);
      if (filters.search.trim()) params.set("search", filters.search.trim());

      const res = await fetch(`/api/community?${params}`);
      if (!res.ok) return null;
      return res.json() as Promise<{ items: unknown[]; total: number; hasMore: boolean }>;
    },
    []
  );

  // ── Navigate to a page within the active tab ──
  const goToPage = useCallback(
    async (tab: Tab, page: number, filters: DraftState) => {
      setLoading(true);
      try {
        const data = await fetchPage(tab, page, filters);
        if (!data) return;

        if (tab === "discussions") {
          setDiscData({ items: data.items as DiscussionView[], total: data.total, hasMore: data.hasMore, page });
        } else if (tab === "chapter") {
          setChapData({ items: data.items as ChapterCommentView[], total: data.total, hasMore: data.hasMore, page });
        } else {
          setSpoilData({ items: data.items as DiscussionView[], total: data.total, hasMore: data.hasMore, page });
        }
        pushUrl(tab, page);
      } catch {
        // Leave existing items in place on network error.
      } finally {
        setLoading(false);
      }
    },
    [fetchPage, pushUrl]
  );

  // ── Tab switch ──
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    pushUrl(tab, currentPage(tab));
  };

  // ── Apply Filters ──
  const applyFilters = async () => {
    setLoading(true);
    setApplied(draft);
    try {
      // Reset all tabs to page 1 with new filters.
      const [discRes, chapRes, spoilRes] = await Promise.all([
        fetchPage("discussions", 1, draft),
        fetchPage("chapter",     1, draft),
        fetchPage("spoilers",    1, draft),
      ]);

      if (discRes)  setDiscData ({ items: discRes.items  as DiscussionView[],      total: discRes.total,  hasMore: discRes.hasMore,  page: 1 });
      if (chapRes)  setChapData ({ items: chapRes.items  as ChapterCommentView[],   total: chapRes.total,  hasMore: chapRes.hasMore,  page: 1 });
      if (spoilRes) setSpoilData({ items: spoilRes.items as DiscussionView[],      total: spoilRes.total, hasMore: spoilRes.hasMore, page: 1 });

      pushUrl(activeTab, 1);
    } catch {
      // leave existing state
    } finally {
      setLoading(false);
    }
  };

  // ── Current tab data ──
  const currentData =
    activeTab === "chapter"  ? chapData  :
    activeTab === "spoilers" ? spoilData :
    discData;

  const currentPage = (tab: Tab) =>
    tab === "chapter"  ? chapData.page  :
    tab === "spoilers" ? spoilData.page :
    discData.page;

  const totalPages = Math.max(1, Math.ceil(currentData.total / PAGE_SIZE));

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
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
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
                  onClick={() => switchTab(tab)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === tab
                      ? "-mb-px border-b-2 border-accent-highlight text-accent-highlight"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  {TAB_LABELS[tab]}
                  {/* Live total badge */}
                  <span className="ml-1.5 text-[10px] text-text-disabled">
                    {tab === "discussions" ? discData.total
                     : tab === "chapter"  ? chapData.total
                     : spoilData.total}
                  </span>
                </button>
              ))}
            </div>

            {/* Feed — single full-width card per row on all viewports */}
            <div className={cn("mt-4 space-y-3", loading && "pointer-events-none opacity-50")}>
              {currentData.items.length === 0 ? (
                <p className="rounded-card border border-border bg-surface p-6 text-center text-sm text-text-muted">
                  {EMPTY_MSG[activeTab]}
                </p>
              ) : activeTab === "chapter" ? (
                chapData.items.map((item) => (
                  <ChapterCommentCard key={item.id} item={item} />
                ))
              ) : (
                (activeTab === "spoilers" ? spoilData.items : discData.items).map((d) => (
                  <DiscussionCard key={d.id} d={d} />
                ))
              )}
            </div>

            {/* Pagination */}
            <Paginator
              page={currentData.page}
              totalPages={totalPages}
              disabled={loading}
              onGo={(p) => goToPage(activeTab, p, applied)}
            />

            {/* Result summary */}
            {currentData.total > 0 && (
              <p className="mt-3 text-center text-[11px] text-text-muted">
                Showing {((currentData.page - 1) * PAGE_SIZE) + 1}–{Math.min(currentData.page * PAGE_SIZE, currentData.total)} of {currentData.total}
              </p>
            )}
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
