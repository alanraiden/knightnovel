"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, Heart, Star, Flag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RatingModal } from "@/components/novel/rating-modal";
import { ReportModal } from "@/components/shared/report-modal";

export function NovelActions({
  novelSlug,
  novelTitle,
  initialBookmarked = false,
  initialFavorited = false,
}: {
  novelSlug: string;
  novelTitle: string;
  initialBookmarked?: boolean;
  initialFavorited?: boolean;
}) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const toggleBookmark = async () => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setSavingBookmark(true);
    const next = !bookmarked;
    setBookmarked(next); // optimistic
    try {
      const res = await fetch(`/api/bookmarks/${novelSlug}`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) setBookmarked(!next); // revert on failure
    } catch {
      setBookmarked(!next);
    } finally {
      setSavingBookmark(false);
    }
  };

  const toggleFavorite = async () => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setSavingFavorite(true);
    const next = !favorited;
    setFavorited(next);
    try {
      const res = await fetch(`/api/favorites/${novelSlug}`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) setFavorited(!next);
    } catch {
      setFavorited(!next);
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={toggleBookmark}
          disabled={savingBookmark}
          className={cn(
            "flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs transition-colors disabled:opacity-60",
            bookmarked
              ? "border-accent bg-accent/15 text-accent"
              : "border-border text-text-secondary hover:border-border-hover"
          )}
        >
          {savingBookmark ? <Loader2 size={13} className="animate-spin" /> : <Bookmark size={13} className={bookmarked ? "fill-current" : ""} />}
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>

        <button
          onClick={toggleFavorite}
          disabled={savingFavorite}
          className={cn(
            "flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs transition-colors disabled:opacity-60",
            favorited
              ? "border-status-error bg-status-error/15 text-status-error"
              : "border-border text-text-secondary hover:border-border-hover"
          )}
        >
          {savingFavorite ? <Loader2 size={13} className="animate-spin" /> : <Heart size={13} className={favorited ? "fill-current" : ""} />}
          {favorited ? "Favorited" : "Favorite"}
        </button>

        <button
          onClick={() => setRateOpen(true)}
          className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-border-hover"
        >
          <Star size={13} />
          Rate
        </button>

        <button
          onClick={() => setReportOpen(true)}
          className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-border-hover"
        >
          <Flag size={13} />
          Report
        </button>
      </div>

      <RatingModal open={rateOpen} onClose={() => setRateOpen(false)} novelSlug={novelSlug} />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="novel"
        targetId={novelSlug}
        targetLabel={novelTitle}
      />
    </>
  );
}
