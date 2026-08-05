"use client";

import { useEffect, useState } from "react";
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

  // Auto-advance every 8s (within the requested 7–10s range). Depending on
  // `index` re-arms the timer on every navigation — manual or automatic —
  // so a click right before the interval would've fired doesn't get
  // immediately followed by another auto-advance a moment later.
  useEffect(() => {
    if (novels.length <= 1) return;
    const id = setInterval(() => go(1), 8000);
    return () => clearInterval(id);
  }, [index, novels.length]);

  // A dedicated hero background (set from the admin Featured page) gets shown
  // sharp with a readability gradient over it, like a game/manhwa splash
  // banner. Without one, we fall back to the novel's own cover, zoomed in and
  // shown just as sharp — the glass content panel handles legibility, so
  // nothing here gets blurred.
  const hasCustomBackground = Boolean(novel.heroBackground);
  const backgroundSrc = novel.heroBackground || novel.cover;

  return (
    <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-card to-surface">
      <div className="hidden md:block">
        {backgroundSrc && (
          <div className="absolute inset-0">
            <Image
              src={backgroundSrc}
              alt=""
              fill
              priority
              sizes="100vw"
              className={cn(
                "object-cover",
                hasCustomBackground ? "object-[70%_center]" : "object-[center_15%]"
              )}
            />
            {/* Sharp, fully visible art — legibility now comes from the glass
                content panel itself (backdrop-blur + semi-opaque fill), not
                from darkening the background. Just a light bottom fade so
                the arrows/dots stay readable at the edges. */}
            <div className="absolute inset-0 bg-gradient-to-t from-base/50 via-transparent to-transparent" />
          </div>
        )}

        <div className="glass relative m-3 flex flex-col gap-5 rounded-card p-6 md:min-h-[420px] md:flex-row md:items-center md:gap-8 md:p-10">
          {novel.cover && (
            <div className="relative hidden h-40 w-28 shrink-0 overflow-hidden rounded-card shadow-2xl sm:block md:h-64 md:w-44">
              <Image src={novel.cover} alt={novel.title} fill sizes="176px" className="object-cover" />
            </div>
          )}

          <div className="flex min-h-[200px] flex-1 flex-col justify-end md:min-h-0 md:justify-center md:max-w-xl">
            <span className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-accent-highlight">
              ★ Featured
            </span>
            <h1 className="max-w-lg text-3xl font-medium text-text-primary md:text-4xl">{novel.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {novel.genres.map((g) => (
                <span
                  key={g}
                  className="rounded border border-transparent bg-base/60 px-2 py-1 text-[11px] text-text-secondary transition-all duration-200 hover:border-accent-highlight/50 hover:text-text-primary"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-3 line-clamp-2 max-w-lg whitespace-pre-line text-sm text-text-secondary">
              {novel.description}
            </p>
            <Link
              href={`/novel/${novel.slug}`}
              className="mt-1 w-fit text-xs font-medium text-accent-highlight hover:underline"
            >
              Read more →
            </Link>

            <div className="mt-5 flex gap-3">
              <Link
                href={`/novel/${novel.slug}/chapter/1`}
                className="rounded bg-accent-highlight px-4 py-2 text-sm font-medium text-[#412402] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-black/20"
              >
                Read Now
              </Link>
              <Link
                href={`/novel/${novel.slug}`}
                className="rounded border border-border-hover px-4 py-2 text-sm font-medium text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-highlight/50 hover:bg-card"
              >
                + Add to Library
              </Link>
            </div>
          </div>

          {/* Stats panel — desktop/tablet only, mirrors the compact row above. */}
          <div className="hidden shrink-0 flex-col gap-3 md:flex md:w-60">
            <div className="glass grid grid-cols-3 divide-x divide-border rounded-card">
              <div className="flex flex-col items-center gap-1 px-2 py-3">
                <span className="flex items-center gap-1 text-sm font-medium text-text-primary">
                  <Star size={14} className="text-accent-highlight" /> {novel.rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-text-muted">Rating</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-2 py-3">
                <span className="flex items-center gap-1 text-sm font-medium text-text-primary">
                  <Eye size={14} /> {novel.views}
                </span>
                <span className="text-[10px] text-text-muted">Views</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-2 py-3">
                <span className="flex items-center gap-1 text-sm font-medium text-text-primary">
                  <Bookmark size={14} /> {novel.bookmarks}
                </span>
                <span className="text-[10px] text-text-muted">Bookmarks</span>
              </div>
            </div>

            <div className="glass grid grid-cols-2 gap-x-2 rounded-card p-3 text-xs">
              <div>
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Circle size={7} className={cn("fill-current", STATUS_COLOR[novel.status])} />
                  Status
                </span>
                <span className="mt-0.5 block font-medium text-text-primary">{STATUS_LABEL[novel.status]}</span>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <BookOpen size={12} /> Chapters
                </span>
                <span className="mt-0.5 block font-medium text-text-primary">{novel.chapterCount}</span>
              </div>
              <div className="col-span-2 mt-2 border-t border-border pt-2">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Clock size={12} /> Updated
                </span>
                <span className="mt-0.5 block font-medium text-text-primary">
                  {timeAgo(novel.lastChapterAddedAt)}
                </span>
              </div>
            </div>

            {novel.author && (
              <div className="glass rounded-card p-3 text-xs">
                <span className="text-text-secondary">Author</span>
                <span className="mt-0.5 block truncate font-medium text-text-primary">{novel.author}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated mobile hero — compact (~300px), full-bleed sharp artwork,
          background only (no cover thumbnail), no description/author/extra
          metadata, single primary action, so Highlights is reachable with
          barely any scroll. Carousel state/logic above is untouched. */}
      <div className="relative h-[300px] w-full md:hidden">
        {backgroundSrc && (
          <>
            <Image
              src={backgroundSrc}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_25%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-base via-base/75 to-base/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-base/50 via-transparent to-transparent" />
          </>
        )}

        <div className="relative z-[1] flex h-full flex-col justify-end gap-3 px-4 pb-8 pt-4">
          <Link href={`/novel/${novel.slug}`} className="block min-w-0">
            <span className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-accent-highlight">
              ★ Featured
            </span>
            <h1 className="line-clamp-2 text-lg font-semibold leading-snug text-text-primary">
              {novel.title}
            </h1>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {novel.genres.slice(0, 3).map((g) => (
                <span key={g} className="rounded bg-base/60 px-1.5 py-0.5 text-[10px] text-text-secondary">
                  {g}
                </span>
              ))}
            </div>
          </Link>

          <div className="flex items-center gap-3.5 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Star size={13} className="text-accent-highlight" /> {novel.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Circle size={7} className={cn("fill-current", STATUS_COLOR[novel.status])} />
              {STATUS_LABEL[novel.status]}
            </span>
          </div>

          <Link
            href={`/novel/${novel.slug}/chapter/1`}
            className="mt-0.5 w-fit rounded bg-accent-highlight px-4 py-2 text-sm font-medium text-[#412402] transition active:brightness-110"
          >
            Read Now
          </Link>
        </div>
      </div>

      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-base/70 text-text-secondary transition-all duration-200 hover:scale-110 hover:bg-base/90 hover:text-text-primary"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-base/70 text-text-secondary transition-all duration-200 hover:scale-110 hover:bg-base/90 hover:text-text-primary"
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
