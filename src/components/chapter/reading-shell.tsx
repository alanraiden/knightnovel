"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, ChevronDown, Bookmark, ChevronLeft, ChevronRight, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NovelCard } from "@/components/novel/novel-card";
import { CommentThread } from "@/components/novel/comment-thread";
import type { DemoNovel } from "@/lib/seed-data";
import type { CommentView } from "@/lib/queries";

type Theme = "dark" | "light" | "sepia";

const fontOptions = [
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Monospace", value: "'Courier New', Courier, monospace" },
] as const;

const themeClasses: Record<Theme, string> = {
  dark: "reading-theme-dark",
  light: "reading-theme-light",
  sepia: "reading-theme-sepia",
};

const placeholderContent = `The rain fell steadily over the city as Klein pulled his coat tighter. Somewhere in the fog-wrapped streets ahead, an answer waited — one that would either confirm his worst fears or free him from them entirely.

He had learned, over the past several months, that mysteries in this world rarely resolved themselves cleanly. Every answer birthed three new questions, and every door he opened seemed to lead to a longer hallway.

Still, he walked on.

— This is placeholder text. Real chapter content will appear here once it's added via the admin panel (manual entry or bulk import) and MONGODB_URI is configured.`;

export function ReadingShell({
  novel,
  chapterNumber,
  chapterCount,
  chapterContent,
  suggestions,
  commentTargetId,
  initialComments,
  totalTopLevel,
  totalAll,
  hasMore,
  topAd,
  middleAd,
  bottomAd,
}: {
  novel: DemoNovel;
  chapterNumber: number;
  chapterCount: number;
  chapterContent: string | null;
  suggestions: DemoNovel[];
  commentTargetId: string;
  initialComments: CommentView[];
  totalTopLevel: number;
  totalAll: number;
  hasMore: boolean;
  topAd?: React.ReactNode;
  middleAd?: React.ReactNode;
  bottomAd?: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<Theme>("dark");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState<string>(fontOptions[0].value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);

  const prev = chapterNumber > 1 ? chapterNumber - 1 : null;
  const next = chapterNumber < chapterCount ? chapterNumber + 1 : null;

  useEffect(() => {
    function onScroll() {
      setShowFloatingNav(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const saveProgress = async () => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelSlug: novel.slug, chapterNumber }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // no-op — button just won't confirm
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("min-h-screen transition-colors", themeClasses[theme])}>
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-3">
        {topAd && <div className="mb-3">{topAd}</div>}
        <div className="mb-2 flex items-center justify-between text-sm">
          <Link href={`/novel/${novel.slug}`} aria-label="Back to novel" className="opacity-70 hover:opacity-100">
            <ArrowLeft size={18} />
          </Link>
          <button className="flex items-center gap-1 opacity-90">
            Chapter {chapterNumber} <ChevronDown size={14} />
          </button>
          <div className="flex items-center gap-3 opacity-70">
            <button onClick={saveProgress} disabled={saving} aria-label="Save reading progress">
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Bookmark size={17} className={saved ? "fill-current text-accent" : ""} />
              )}
            </button>
          </div>
        </div>
        {saved && <p className="mb-2 text-right text-[11px] text-status-success">Progress saved</p>}

        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-current/10 pb-3 text-xs opacity-80">
          <ThemeSwatch active={theme === "light"} bg="#FFFFFF" onClick={() => setTheme("light")} />
          <ThemeSwatch active={theme === "dark"} bg="#0A0F1C" ring onClick={() => setTheme("dark")} />
          <ThemeSwatch active={theme === "sepia"} bg="#F4ECD8" onClick={() => setTheme("sepia")} />
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="rounded border border-current/15 bg-transparent px-1.5 py-1 text-[11px]"
          >
            {fontOptions.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setFontSize((s) => Math.max(13, s - 1))}>A-</button>
            <button onClick={() => setFontSize(16)}>A</button>
            <button onClick={() => setFontSize((s) => Math.min(22, s + 1))}>A+</button>
          </div>
        </div>

        <article
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8, fontFamily }}
          className="whitespace-pre-line opacity-95"
        >
          {chapterContent ?? placeholderContent}
        </article>

        <div className="my-6 h-1 w-full rounded-full bg-current/10">
          <div className="h-1 w-3/5 rounded-full bg-accent" />
        </div>

        <div className="flex gap-2">
          {prev ? (
            <Link
              href={`/novel/${novel.slug}/chapter/${prev}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-card border border-current/15 py-3 text-sm font-medium"
            >
              <ChevronLeft size={16} /> Previous
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          <Link
            href={`/novel/${novel.slug}`}
            aria-label="Chapter index"
            className="flex items-center justify-center rounded-card border border-current/15 px-4 py-3"
          >
            <List size={16} />
          </Link>
          {next ? (
            <Link
              href={`/novel/${novel.slug}/chapter/${next}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-card border border-current/15 py-3 text-sm font-medium"
            >
              Next <ChevronRight size={16} />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {middleAd && <div className="mt-6">{middleAd}</div>}

        <section className="mt-8">
          <p className="mb-2 text-sm font-medium opacity-90">You might also like</p>
          <div className="grid grid-cols-3 gap-3">
            {suggestions.map((n) => (
              <NovelCard key={n.slug} novel={n} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <CommentThread
            targetType="chapter"
            targetId={commentTargetId}
            initialComments={initialComments}
            totalTopLevel={totalTopLevel}
            totalAll={totalAll}
            hasMore={hasMore}
          />
        </section>

        {bottomAd && <div className="mt-8">{bottomAd}</div>}
      </div>

      {/* Floating nav — appears once the reader has scrolled past the top controls */}
      <div
        className={cn(
          "glass fixed inset-x-0 bottom-4 z-30 mx-auto flex w-fit items-center gap-1 rounded-full p-1.5 shadow-2xl transition-all",
          showFloatingNav ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        {prev ? (
          <Link
            href={`/novel/${novel.slug}/chapter/${prev}`}
            aria-label="Previous chapter"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-primary hover:bg-card/60"
          >
            <ChevronLeft size={18} />
          </Link>
        ) : (
          <div className="h-9 w-9" />
        )}
        <Link
          href={`/novel/${novel.slug}`}
          aria-label="Chapter index"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-primary hover:bg-card/60"
        >
          <List size={16} />
        </Link>
        {next ? (
          <Link
            href={`/novel/${novel.slug}/chapter/${next}`}
            aria-label="Next chapter"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-primary hover:bg-card/60"
          >
            <ChevronRight size={18} />
          </Link>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>
    </div>
  );
}

function ThemeSwatch({
  bg,
  active,
  ring,
  onClick,
}: {
  bg: string;
  active: boolean;
  ring?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Switch theme to ${bg}`}
      className={cn(
        "h-5 w-5 rounded-full border",
        active ? "border-accent ring-2 ring-accent/40" : "border-current/20"
      )}
      style={{ backgroundColor: bg }}
    />
  );
}
