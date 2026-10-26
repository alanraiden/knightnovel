"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;
const MAX_PAGE_BUTTONS = 5;

// ─── API shape from /api/novels/[slug]/chapters ───────────────────────────────
interface ApiChapter {
  chapterNumber: number;
  title: string;
}

interface ApiResponse {
  chapters: ApiChapter[];
  totalChapters: number;
  hasMore: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * Renders a paginated list of published chapter links.
 *
 * Previously this component received only a `chapterCount` number and built a
 * synthetic [1 … chapterCount] array of links — never querying which chapters
 * actually exist. That caused two bugs:
 *   1. `chapterCount` could be inflated by duplicate DB documents (e.g. 418
 *      when the real highest published chapter is 413), generating broken links.
 *   2. Gaps in the chapter sequence (deleted or skipped numbers) would produce
 *      links that 404.
 *
 * The fix: fetch real chapter numbers from /api/novels/[slug]/chapters, which
 * filters by status:"published" and returns actual records. The `chapterCount`
 * prop is kept only for the display badge and as a fallback before the first
 * fetch completes.
 */
export function ChapterList({ slug, chapterCount }: { slug: string; chapterCount: number }) {
  const [page, setPage] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Grid by default on desktop, List by default on mobile — user can still
  // switch manually afterward, this only sets the initial value.
  useEffect(() => {
    setView(window.innerWidth < 640 ? "list" : "grid");
  }, []);

  // ── Fetch published chapter numbers from the API ──────────────────────────
  // The API already paginates at PAGE_SIZE=30 and returns only published
  // chapters, so we forward the current page index directly.
  const [chapters, setChapters] = useState<number[]>([]);
  const [totalPublished, setTotalPublished] = useState<number>(chapterCount);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const apiPage = page + 1; // API is 1-indexed
    fetch(`/api/novels/${slug}/chapters?page=${apiPage}`)
      .then((r) => r.json())
      .then((data: ApiResponse) => {
        setChapters(data.chapters.map((c) => c.chapterNumber));
        setTotalPublished(data.totalChapters);
      })
      .catch(() => {
        // On error fall back to a synthetic range so the UI isn't blank.
        // The links may 404 but that is no worse than the previous behaviour.
        const start = page * PAGE_SIZE + 1;
        const end = Math.min(chapterCount, start + PAGE_SIZE - 1);
        setChapters(Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i));
      })
      .finally(() => setLoading(false));
  }, [slug, page, chapterCount]);

  // ── Pagination maths ──────────────────────────────────────────────────────
  // Drive pagination from the live totalPublished count (not the stale prop).
  const totalPages = Math.max(1, Math.ceil(totalPublished / PAGE_SIZE));

  const half = Math.floor(MAX_PAGE_BUTTONS / 2);
  let windowStart = Math.max(0, page - half);
  const windowEnd = Math.min(totalPages, windowStart + MAX_PAGE_BUTTONS);
  windowStart = Math.max(0, windowEnd - MAX_PAGE_BUTTONS);
  const pageNumbers = Array.from({ length: windowEnd - windowStart }, (_, i) => windowStart + i);

  // Range label — use actual fetched numbers when available.
  const firstNum = chapters[0] ?? page * PAGE_SIZE + 1;
  const lastNum  = chapters[chapters.length - 1] ?? Math.min(totalPublished, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">
          {loading ? "Loading…" : `Chapters ${firstNum}–${lastNum}`}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-text-muted">{totalPublished} total</p>
          <div className="flex overflow-hidden rounded border border-border">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={cn("px-1.5 py-1", view === "grid" ? "bg-accent-highlight text-[#412402]" : "text-text-muted")}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={cn("px-1.5 py-1", view === "list" ? "bg-accent-highlight text-[#412402]" : "text-text-muted")}
            >
              <List size={13} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-20 items-center justify-center text-xs text-text-muted">Loading chapters…</div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {chapters.map((c) => (
            <Link
              key={c}
              href={`/novel/${slug}/chapter/${c}`}
              className="truncate rounded border border-border px-2.5 py-1.5 text-xs text-text-secondary hover:border-border-hover hover:text-text-primary"
            >
              Ch.{c}
            </Link>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-card border border-border">
          {chapters.map((c) => (
            <Link
              key={c}
              href={`/novel/${slug}/chapter/${c}`}
              className="flex items-center justify-between px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              <span>Chapter {c}</span>
              <ChevronRight size={14} className="text-text-muted" />
            </Link>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary disabled:opacity-30"
        >
          <ChevronLeft size={14} /> Previous
        </button>

        {windowStart > 0 && (
          <>
            <PageButton n={1} active={page === 0} onClick={() => setPage(0)} />
            {windowStart > 1 && <span className="px-1 text-xs text-text-disabled">…</span>}
          </>
        )}

        {pageNumbers.map((p) => (
          <PageButton key={p} n={p + 1} active={page === p} onClick={() => setPage(p)} />
        ))}

        {windowEnd < totalPages && (
          <>
            {windowEnd < totalPages - 1 && <span className="px-1 text-xs text-text-disabled">…</span>}
            <PageButton n={totalPages} active={page === totalPages - 1} onClick={() => setPage(totalPages - 1)} />
          </>
        )}

        <button
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          className="flex items-center gap-1 px-2 py-1 text-xs text-accent-highlight disabled:opacity-30 disabled:text-text-secondary"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function PageButton({ n, active, onClick }: { n: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-w-[26px] rounded px-1.5 py-1 text-xs",
        active ? "bg-accent-highlight text-[#412402]" : "text-text-secondary hover:bg-surface"
      )}
    >
      {n}
    </button>
  );
}
