"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DemoNovel } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

export function HeroCarousel({ novels }: { novels: DemoNovel[] }) {
  const [index, setIndex] = useState(0);
  const novel = novels[index];

  const go = (delta: number) => setIndex((i) => (i + delta + novels.length) % novels.length);

  return (
    <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-card to-surface">
      {/* Cinematic blurred cover backdrop */}
      {novel.cover && (
        <div className="absolute inset-0">
          <Image
            src={novel.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-110 object-cover opacity-40 blur-2xl"
          />
          {/* Dark gradient so text stays readable regardless of cover brightness */}
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/70 to-base/30" />
          {/* Soft vignette for depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(10,15,28,0.55) 100%)",
            }}
          />
        </div>
      )}

      <div className="glass relative m-3 flex flex-col gap-5 rounded-card p-6 sm:flex-row sm:items-end md:p-10">
        {novel.cover && (
          <div className="relative hidden h-40 w-28 shrink-0 overflow-hidden rounded-card shadow-2xl sm:block md:h-52 md:w-36">
            <Image src={novel.cover} alt={novel.title} fill sizes="144px" className="object-cover" />
          </div>
        )}
        <div className="flex min-h-[200px] flex-1 flex-col justify-end md:min-h-[280px]">
          <span className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-accent-highlight">
            ★ Featured
          </span>
          <h1 className="max-w-lg text-3xl font-medium text-text-primary md:text-4xl">{novel.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {novel.genres.map((g) => (
              <span key={g} className="rounded bg-base/60 px-2 py-1 text-[11px] text-text-secondary">
                {g}
              </span>
            ))}
          </div>
          <p className="mt-3 line-clamp-3 max-w-lg whitespace-pre-line text-sm text-text-secondary">
            {novel.description}
          </p>
          <div className="mt-5 flex gap-3">
            <Link
              href={`/novel/${novel.slug}/chapter/1`}
              className="rounded bg-accent-highlight px-4 py-2 text-sm font-medium text-[#412402] transition hover:brightness-110"
            >
              Read Now
            </Link>
            <Link
              href={`/novel/${novel.slug}`}
              className="rounded border border-border-hover px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-card"
            >
              + Add to Library
            </Link>
          </div>
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
