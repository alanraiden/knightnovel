"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { NovelAnalytics } from "@/lib/queries";

// ---------- helpers ----------------------------------------------------------

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function relDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------- Novel selector ---------------------------------------------------

export function NovelSelector({
  novels,
  selectedSlug,
}: {
  novels: { slug: string; title: string }[];
  selectedSlug: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return novels;
    return novels.filter((n) => n.title.toLowerCase().includes(q));
  }, [novels, query]);

  const select = useCallback(
    (slug: string) => {
      if (slug === selectedSlug) {
        router.push("/kn-x9b4/analytics");
      } else {
        router.push(`/kn-x9b4/analytics?novel=${slug}`);
      }
    },
    [router, selectedSlug]
  );

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-disabled"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${novels.length} novel${novels.length !== 1 ? "s" : ""}…`}
          className="w-full rounded border border-border bg-surface py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-border-hover focus:outline-none sm:w-72"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-muted"
          >
            ✕
          </button>
        )}
      </div>

      {/* Pill list */}
      {filtered.length === 0 ? (
        <p className="text-xs text-text-muted">No novels match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map((n) => {
            const isSelected = n.slug === selectedSlug;
            return (
              <button
                key={n.slug}
                onClick={() => select(n.slug)}
                className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-text-muted hover:border-border-hover hover:text-text-secondary"
                }`}
              >
                {n.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Sub-components ---------------------------------------------------

function StatRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="tabular-nums text-text-primary">
        {value}
        {note && <span className="ml-1.5 text-[10px] text-text-disabled">{note}</span>}
      </span>
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-disabled">
      {children}
    </p>
  );
}

// ---------- Top chapters lazy panel -----------------------------------------

function TopChaptersPanel({ novelSlug }: { novelSlug: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<
    { chapterNumber: number; title: string; views: number }[] | null
  >(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (data !== null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/novels/${novelSlug}/top-chapters`);
      const json = await res.json();
      setData(res.ok ? json.chapters : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const hasData = data && data.length > 0 && data.some((c) => c.views > 0);

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <span>Top chapters by views</span>
        <span className="text-text-disabled">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {loading && <p className="text-xs text-text-muted">Loading…</p>}

          {/* No data at all */}
          {!loading && (!data || data.length === 0) && (
            <p className="text-xs text-text-muted">No chapters found for this novel.</p>
          )}

          {/* Data but all zeros — tracking just started */}
          {!loading && data && data.length > 0 && !hasData && (
            <p className="text-xs text-text-muted">
              All chapters show 0 views — this is expected. Chapter-level view tracking was
              recently enabled and has no historical data. Counts will accumulate from new
              visits.
            </p>
          )}

          {/* Real ranked data */}
          {!loading && hasData && (
            <ol className="space-y-1">
              {data.map((c, i) => (
                <li key={c.chapterNumber} className="flex items-center gap-3 text-xs">
                  <span className="w-5 shrink-0 text-right tabular-nums text-text-disabled">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-text-secondary">
                    Ch.{c.chapterNumber} — {c.title}
                  </span>
                  <span className="shrink-0 tabular-nums text-text-muted">
                    {c.views.toLocaleString()} views
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Main panel -------------------------------------------------------

// The date chapter-level view tracking was wired up (chapters.views $inc on
// each chapter page visit). Views before this date were never recorded.
// Update this constant when the tracking was actually deployed.
const CHAPTER_TRACKING_SINCE = "Sep 11, 2026";

export function NovelAnalyticsPanel({ novel }: { novel: NovelAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Novel header */}
      <div className="flex items-start gap-4">
        {novel.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={novel.cover} alt="" className="h-20 w-14 shrink-0 rounded object-cover" />
        ) : (
          <div className="h-20 w-14 shrink-0 rounded bg-card" />
        )}
        <div>
          <h2 className="text-base font-semibold text-text-primary">{novel.title}</h2>
          <p className="mt-0.5 text-xs capitalize text-text-muted">
            {novel.status} · {novel.chapterCount} chapters
          </p>
          <p className="mt-1 text-[10px] text-text-disabled">
            Added {relDate(novel.createdAt)} · Last chapter {relDate(novel.lastChapterAddedAt)}
          </p>
        </div>
      </div>

      {/* ── Novel-level counters ── */}
      <div>
        <p className="mb-2 text-xs font-medium text-text-secondary">Novel-level counters</p>
        <p className="mb-3 text-[10px] text-text-disabled">
          These counters increment on every visit to the novel page <em>and</em> every chapter page.
          They are not chapter-specific.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-card border border-border bg-surface p-4">
            <CardLabel>All-time views</CardLabel>
            <p className="text-2xl font-semibold tabular-nums text-text-primary">
              {fmt(novel.viewsTotal)}
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <CardLabel>Weekly counter</CardLabel>
            <p className="text-2xl font-semibold tabular-nums text-text-primary">
              {fmt(novel.viewsWeekly)}
            </p>
            <p className="mt-1 text-[10px] text-text-disabled">reset by cron</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <CardLabel>Monthly counter</CardLabel>
            <p className="text-2xl font-semibold tabular-nums text-text-primary">
              {fmt(novel.viewsMonthly)}
            </p>
            <p className="mt-1 text-[10px] text-text-disabled">reset by cron</p>
          </div>
        </div>
      </div>

      {/* ── Engagement + Content ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-4">
          <CardLabel>Engagement</CardLabel>
          <div className="divide-y divide-border">
            <StatRow label="Favorites" value={fmt(novel.favorites)} />
            <StatRow
              label="Rating"
              value={novel.ratingCount > 0 ? `${novel.ratingAvg.toFixed(1)} / 5` : "—"}
              note={novel.ratingCount > 0 ? `${novel.ratingCount} ratings` : undefined}
            />
            <StatRow label="Comments" value={fmt(novel.commentCount)} />
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-4">
          <CardLabel>Content</CardLabel>
          <div className="divide-y divide-border">
            <StatRow label="Published chapters" value={fmt(novel.chapterCount)} />
            <StatRow
              label="Total words"
              value={fmt(novel.wordCount)}
            />
            <StatRow
              label="Avg words / chapter"
              value={
                novel.chapterCount > 0 && novel.wordCount > 0
                  ? `~${Math.round(novel.wordCount / novel.chapterCount).toLocaleString()}`
                  : "—"
              }
            />
          </div>
        </div>
      </div>

      {/* ── Chapter-level view tracking ── */}
      <div>
        <p className="mb-1 text-xs font-medium text-text-secondary">
          Chapter-level view tracking
        </p>
        <p className="mb-3 text-[10px] text-text-disabled">
          Tracks views per individual chapter. Only counts visits recorded since tracking was
          enabled ({CHAPTER_TRACKING_SINCE}). Historical data before this date is not available
          and has not been backfilled.
        </p>
        <TopChaptersPanel novelSlug={novel.slug} />
      </div>
    </div>
  );
}
