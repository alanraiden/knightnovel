import Link from "next/link";
import Image from "next/image";
import { BookOpen, ThumbsUp, MessageSquare, Eye } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { DiscussionView } from "@/lib/queries";

export function DiscussionCard({ d, compact = false }: { d: DiscussionView; compact?: boolean }) {
  const href = d.chapterNumber
    ? `/novel/${d.novelSlug}/chapter/${d.chapterNumber}#comment-${d.id}`
    : `/community/discussion/${d.id}`;

  return (
    <Link
      href={href}
      className="glass group flex h-full flex-col rounded-card border border-transparent p-3 shadow-md transition-all duration-200 ease-out hover:-translate-y-1.5 hover:border-accent-highlight/60 hover:shadow-2xl"
    >
      <div className="flex gap-2.5">
        {/* Novel cover — users recognize covers instantly, faster than reading a title */}
        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-card">
          {d.novelCover && (
            <Image
              src={d.novelCover}
              alt={d.novelTitle}
              fill
              sizes="40px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs text-text-muted">
            <div className="h-5 w-5 shrink-0 rounded-full bg-card" />
            <span className="truncate text-text-secondary">{d.author}</span>
            <span className="shrink-0">· {timeAgo(d.createdAt)}</span>
          </div>

          {(d.category || d.isPinned) && (
            <div className="mb-1 flex items-center gap-1.5">
              {d.isPinned && (
                <span className="rounded-full bg-status-warning/15 px-2 py-0.5 text-[10px] font-medium text-status-warning">
                  📌 Pinned
                </span>
              )}
              {d.category && (
                <span className="inline-block rounded-full bg-accent-highlight/15 px-2 py-0.5 text-[10px] font-medium text-accent-highlight">
                  {d.category}
                </span>
              )}
            </div>
          )}

          <p
            className={
              compact
                ? "line-clamp-2 text-[13px] text-text-primary"
                : "line-clamp-2 text-[15px] font-medium text-text-primary"
            }
          >
            {d.title}
          </p>
        </div>
      </div>

      {!compact && d.bodyPreview !== d.title && (
        <p className="mt-2 line-clamp-2 text-xs text-text-secondary">{d.bodyPreview}</p>
      )}

      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-accent-highlight">
        <BookOpen size={12} className="shrink-0" />
        <span className="truncate">{d.novelTitle}</span>
        {d.chapterNumber && <span className="shrink-0 text-text-muted">· Ch.{d.chapterNumber}</span>}
      </div>

      <div className="mt-auto flex items-center gap-3 pt-2 text-[11px] text-text-muted">
        <span className="flex items-center gap-1">
          <ThumbsUp size={12} /> {d.up}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={12} /> {d.replyCount}
        </span>
        {!compact && (
          <span className="flex items-center gap-1">
            <Eye size={12} /> {d.views}
          </span>
        )}
      </div>
    </Link>
  );
}
