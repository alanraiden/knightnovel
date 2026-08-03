"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, LayoutGrid, List } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

const PAGE_SIZE = 30;
const MAX_PAGE_BUTTONS = 5;

interface ChapterEntry {
  chapterNumber: number;
  publishedAt: string | null; // null when running on demo data with no real chapter docs
}

export function ChapterList({ slug, chapterCount }: { slug: string; chapterCount: number }) {
  const [page, setPage] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [entries, setEntries] = useState<ChapterEntry[] | null>(null);

  // Grid by default on desktop, List by default on mobile — user can still
  // switch manually afterward, this only sets the initial value.
  useEffect(() => {
    setView(window.innerWidth < 640 ? "list" : "grid");
  }, []);

  const totalPages = Math.max(1, Math.ceil(chapterCount / PAGE_SIZE));
  const start = page * PAGE_SIZE + 1;
  const end = Math.min(chapterCount, start + PAGE_SIZE - 1);

  // Real chapter data (with publish dates) when available; falls back to
  // synthetic numbering (no date shown) so demo mode still renders fine.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/novels/${slug}/chapters?page=${page + 1}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.chapters) && data.chapters.length) {
          setEntries(
            data.chapters.map((c: { chapterNumber: number; publishedAt: string }) => ({
              chapterNumber: c.chapterNumber,
              publishedAt: c.publishedAt,
            }))
          );
        } else {
          setEntries(null);
        }
      })
      .catch(() => setEntries(null));
    return () => {
      cancelled = true;
    };
  }, [slug, page]);

  const chapters: ChapterEntry[] =
    entries ??
    Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => ({
      chapterNumber: start + i,
      publishedAt: null,
    }));

  // Windowed page numbers: current page ± 2, so this stays readable even
  // with hundreds of pages (500+ chapter novels).
  const half = Math.floor(MAX_PAGE_BUTTONS / 2);
  let windowStart = Math.max(0, page - half);
  const windowEnd = Math.min(totalPages, windowStart + MAX_PAGE_BUTTONS);
  windowStart = Math.max(0, windowEnd - MAX_PAGE_BUTTONS);
  const pageNumbers = Array.from({ length: windowEnd - windowStart }, (_, i) => windowStart + i);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">
          Chapters {start}–{end}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-text-muted">{chapterCount} total</p>
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

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {chapters.map((c) => (
            <Link
              key={c.chapterNumber}
              href={`/novel/${slug}/chapter/${c.chapterNumber}`}
              className="rounded border border-border px-2.5 py-1.5 text-xs text-text-secondary hover:border-border-hover hover:text-text-primary"
            >
              <span className="block truncate">Ch.{c.chapterNumber}</span>
              {c.publishedAt && <span className="block text-[10px] text-text-disabled">{timeAgo(c.publishedAt)}</span>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-card border border-border">
          {chapters.map((c) => (
            <Link
              key={c.chapterNumber}
              href={`/novel/${slug}/chapter/${c.chapterNumber}`}
              className="flex items-center justify-between px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              <span>Chapter {c.chapterNumber}</span>
              <span className="flex items-center gap-2">
                {c.publishedAt && <span className="text-xs text-text-disabled">{timeAgo(c.publishedAt)}</span>}
                <ChevronRight size={14} className="text-text-muted" />
              </span>
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
