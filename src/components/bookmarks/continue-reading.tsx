import Link from "next/link";
import { ProgressBar } from "@/components/novel/progress-bar";
import { timeAgo } from "@/lib/utils";
import type { DashboardBookmark } from "@/lib/queries";

export function ContinueReadingRow({ items }: { items: DashboardBookmark[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-text-muted">Nothing in progress yet — start reading something!</p>;
  }

  return (
    <div className="themed-scroll flex gap-3 overflow-x-auto pb-2">
      {items.map(({ novel, chapter, total, updatedAt }) => {
        const newChapters = Math.max(0, total - chapter);
        return (
          <div key={novel.slug} className="w-32 shrink-0 rounded-card bg-surface p-2.5">
            <div className="relative">
              <div className="aspect-[2/3] w-full rounded bg-card" />
              {newChapters > 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-status-special/90 px-1.5 py-0.5 text-[9px] text-[#04342C]">
                  {newChapters} New
                </span>
              )}
            </div>
            <p className="mt-2 truncate text-xs text-text-primary">{novel.title}</p>
            <p className="text-[10px] text-text-muted">Ch.{chapter}</p>
            <div className="my-1.5">
              <ProgressBar current={chapter} total={total} />
            </div>
            <p className="mb-1.5 text-[9px] text-text-disabled">Last read • {timeAgo(updatedAt)}</p>
            <Link
              href={`/novel/${novel.slug}/chapter/${chapter}`}
              className="block rounded bg-accent py-1.5 text-center text-[11px] font-medium text-[#042C53]"
            >
              Continue
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export function ContinueReadingHighlight({ items }: { items: DashboardBookmark[] }) {
  if (items.length === 0) return null;
  const { novel, chapter, total } = items[0];
  const nextChapter = chapter + 1;
  const newChapters = Math.max(0, total - chapter);

  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-card border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="h-14 w-11 shrink-0 rounded bg-card" />
        <div>
          <p className="text-xs text-text-muted">Continue Reading</p>
          <p className="text-sm font-medium text-text-primary">{novel.title}</p>
          <p className="text-xs text-text-secondary">You stopped at Chapter {chapter}</p>
          {newChapters > 0 && (
            <p className="text-xs text-status-special">{newChapters} new chapters available</p>
          )}
        </div>
      </div>
      {/* Skips the novel page entirely — goes straight to the next chapter. */}
      <Link
        href={`/novel/${novel.slug}/chapter/${nextChapter}`}
        className="w-full shrink-0 rounded bg-accent px-4 py-2 text-center text-sm font-medium text-[#042C53] sm:w-auto"
      >
        Continue →
      </Link>
    </div>
  );
}
