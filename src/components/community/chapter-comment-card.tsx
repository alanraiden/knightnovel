"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ThumbsUp, MessageSquare } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { ChapterCommentView } from "@/lib/queries";

export function ChapterCommentCard({ item }: { item: ChapterCommentView }) {
  const href = `/novel/${item.novelSlug}/chapter/${item.chapterNumber}#comment-${item.id}`;

  return (
    <Link
      href={href}
      className="glass group flex flex-col rounded-card border border-transparent p-3 shadow-md transition-all duration-200 ease-out hover:-translate-y-1.5 hover:border-accent-highlight/60 hover:shadow-2xl"
    >
      <div className="flex gap-2.5">
        {/* Novel cover thumbnail */}
        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-card">
          {item.novelCover ? (
            <Image
              src={item.novelCover}
              alt={item.novelTitle}
              fill
              sizes="40px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full bg-card" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Author + timestamp */}
          <div className="mb-1 flex items-center gap-1.5 text-xs text-text-muted">
            <div className="h-4 w-4 shrink-0 rounded-full bg-card" />
            <span className="truncate text-text-secondary">{item.author}</span>
            <span className="shrink-0">·</span>
            <span suppressHydrationWarning className="shrink-0">
              {timeAgo(item.createdAt)}
            </span>
          </div>

          {/* Body preview — hidden for spoilers */}
          {item.isSpoiler ? (
            <p className="text-[13px] italic text-status-warning/80">
              ⚠ Spoiler — click to open
            </p>
          ) : (
            <p className="line-clamp-2 text-[13px] leading-snug text-text-primary">
              {item.body}
            </p>
          )}
        </div>
      </div>

      {/* Attached image (non-spoiler only) */}
      {item.stickerUrl && !item.isSpoiler && (
        <div className="ml-[52px] mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.stickerUrl}
            alt="Attached image"
            className="max-h-16 max-w-[80px] rounded border border-border object-contain"
          />
        </div>
      )}

      {/* Novel + chapter breadcrumb */}
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-accent-highlight">
        <BookOpen size={11} className="shrink-0" />
        <span className="truncate">{item.novelTitle}</span>
        <span className="shrink-0 text-text-muted">· Ch.{item.chapterNumber}</span>
      </div>

      {/* Stats row */}
      <div className="mt-auto flex items-center gap-3 pt-2 text-[11px] text-text-muted">
        <span className="flex items-center gap-1">
          <ThumbsUp size={11} />
          {item.up}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={11} />
          {item.replyCount}
        </span>
      </div>
    </Link>
  );
}
