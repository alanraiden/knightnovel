"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  Bookmark,
  BookOpen,
  Clock,
  Circle,
} from "lucide-react";
import type { DemoNovel } from "@/lib/seed-data";
import { cn, timeAgo } from "@/lib/utils";

const STATUS_LABEL: Record<DemoNovel["status"], string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
};

const STATUS_COLOR: Record<DemoNovel["status"], string> = {
  ongoing: "bg-status-success",
  completed: "bg-accent",
  hiatus: "bg-status-warning",
};

export function HeroCarousel({ novels }: { novels: DemoNovel[] }) {
  const [index, setIndex] = useState(0);
  const novel = novels[index];

  const go = (delta: number) => setIndex((i) => (i + delta + novels.length) % novels.length);

  // A dedicated hero background (set from the admin Featured page) gets shown
  // sharp — like a game/manhwa splash banner. Without one, we fall back to a
  // blurred cover so the hero still looks intentional out of the box.
  // Always render the artwork sharp and full-bleed — like Netflix/Steam hero
  // banners — rather than the old blurred, low-opacity treatment. A custom
  // heroBackground (set from the admin Featured page) is preferred since it's
  // usually wider art meant for this; without one we fall back to the cover
  // itself, still shown sharp and edge-to-edge rather than blurred into mist.
  const backgroundSrc = novel.heroBackground || novel.cover;

  return (
    <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-card to-surface">
      {backgroundSrc && (
        <div className="absolute inset-0">
          <Image
            src={backgroundSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Light left-to-right fade only — just enough for text contrast,
              the artwork on the right stays fully visible. No full-bleed
              dark wash on top of it. */}
          <div className="absolute inset-0 bg-gradient-to-r from-base/80 via-base/30 to-transparent" />
          {/* Faint bottom fade, mobile-only, where text stacks over the image
              instead of sitting beside it. */}
          <div className="absolute inset-0 bg-gradient-to-t from-base/55 to-transparent md:hidden" />
        </div>

      )}

      {/* Single translucent, blurred container for all hero content — no
          nested opaque cards. This is intentionally low-opacity so the
          artwork reads clearly behind it. */}
      <div className="glass-hero relative m-3 flex flex-col gap-5 rounded-card p-6 md:min-h-[420px] md:flex-row md:items-center md:gap-8 md:p-10">
        {novel.cover && (
          <div className="relative hidden h-40 w-28 shrink-0 overflow-hidden rounded-card shadow-2xl sm:block md:h-64 md:w-44">
            <Image src={novel.cover} alt={novel.title} fill sizes="176px" className="object-cover" />
          </div>
        )}

        <div className="flex min-h-[200px] flex-1 flex-col justify-end md:min-h-0 md:justify-center md:max-w-xl">
          <span className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-accent-highlight drop-shadow-sm">
            ★ Featured
          </span>
          <h1 className="max-w-lg text-3xl font-medium text-text-primary drop-shadow-md md:text-4xl">
            {novel.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {novel.genres.map((g) => (
              <span
                key={g}
                className="rounded border border-white/10 bg-black/25 px-2 py-1 text-[11px] text-text-secondary backdrop-blur-sm"
              >
                {g}
              </span>
            ))}
          </div>
          <p className="mt-3 line-clamp-2 max-w-lg whitespace-pre-line text-sm text-text-secondary drop-shadow-sm">
            {novel.description}
          </p>
          <Link
            href={`/novel/${novel.slug}`}
            className="mt-1 w-fit text-xs font-medium text-accent-highlight hover:underline"
          >
            Read more →
          </Link>

          {/* Compact stats row for mobile/tablet, where the side stats column is hidden. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary md:hidden">
            <span className="flex items-center gap-1">
              <Star size={13} className="text-accent-highlight" /> {novel.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={13} /> {novel.views}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark size={13} /> {novel.bookmarks}
            </span>
            <span className="flex items-center gap-1">
              <Circle size={7} className={cn("fill-current", STATUS_COLOR[novel.status])} />
              {STATUS_LABEL[novel.status]}
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href={`/novel/${novel.slug}/chapter/1`}
              className="rounded bg-accent-highlight px-4 py-2 text-sm font-medium text-[#412402] transition hover:brightness-110"
            >
              Read Now
            </Link>
            <Link
              href={`/novel/${novel.slug}`}
              className="rounded border border-border-hover px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-card/40"
            >
              + Add to Library
            </Link>
          </div>
        </div>

        {/* Stats column — desktop/tablet only, mirrors the compact row above.
            Plain text separated by thin dividers instead of separate boxed
            cards, so it doesn't stack another opaque layer on top of the
            single glass-hero container it already sits inside. */}
        <div className="hidden shrink-0 flex-col divide-y divide-white/10 border-l border-white/10 pl-6 md:flex md:w-56">
          <div className="grid grid-cols-3 gap-2 pb-4">
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-1 text-sm font-medium text-text-primary drop-shadow-sm">
                <Star size={14} className="text-accent-highlight" /> {novel.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-text-muted">Rating</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-1 text-sm font-medium text-text-primary drop-shadow-sm">
                <Eye size={14} /> {novel.views}
              </span>
              <span className="text-[10px] text-text-muted">Views</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-1 text-sm font-medium text-text-primary drop-shadow-sm">
                <Bookmark size={14} /> {novel.bookmarks}
              </span>
              <span className="text-[10px] text-text-muted">Bookmarks</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-2 py-4 text-xs">
            <div>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Circle size={7} className={cn("fill-current", STATUS_COLOR[novel.status])} />
                Status
              </span>
              <span className="mt-0.5 block font-medium text-text-primary drop-shadow-sm">
                {STATUS_LABEL[novel.status]}
              </span>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <BookOpen size={12} /> Chapters
              </span>
              <span className="mt-0.5 block font-medium text-text-primary drop-shadow-sm">
                {novel.chapterCount}
              </span>
            </div>
            <div className="col-span-2">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Clock size={12} /> Updated
              </span>
              <span className="mt-0.5 block font-medium text-text-primary drop-shadow-sm">
                {timeAgo(novel.lastChapterAddedAt)}
              </span>
            </div>
          </div>

          {novel.author && (
            <div className="pt-4 text-xs">
              <span className="text-text-secondary">Author</span>
              <span className="mt-0.5 block truncate font-medium text-text-primary drop-shadow-sm">
                {novel.author}
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-base/70 text-text-secondary hover:text-text-primary"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-base/70 text-text-secondary hover:text-text-primary"
      >
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {novels.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-4 bg-text-primary" : "w-1.5 bg-border-hover"
            )}
          />
        ))}
      </div>
    </div>
  );
}
