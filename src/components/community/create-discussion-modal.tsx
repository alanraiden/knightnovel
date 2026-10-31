"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/shared/modal";
import type { NovelView } from "@/lib/queries";

const categories = ["Discussion", "Recommendation", "Question", "Theory", "Meme"];

export function CreateDiscussionModal({
  open,
  onClose,
  novels,
  isLoggedIn,
}: {
  open: boolean;
  onClose: () => void;
  novels: NovelView[];
  isLoggedIn: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [novelSlug, setNovelSlug] = useState(novels[0]?.slug ?? "");
  const [category, setCategory] = useState(categories[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    setPosting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "novel",
          targetId: novelSlug,
          displayName: session?.user?.name || "You",
          title,
          category,
          body,
          isSpoiler,
          parentId: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to post.");
      setTitle("");
      setBody("");
      setIsSpoiler(false);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New discussion">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Novel</label>
          <select
            value={novelSlug}
            onChange={(e) => setNovelSlug(e.target.value)}
            className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary"
          >
            {novels.map((n) => (
              <option key={n.slug} value={n.slug}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Discussion title"
          className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="What&apos;s on your mind?"
          className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
        />

        {/* Spoiler toggle */}
        <label
          htmlFor="spoiler-toggle"
          className="flex cursor-pointer items-center gap-2.5 select-none"
        >
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              id="spoiler-toggle"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
                isSpoiler
                  ? "border-status-warning bg-status-warning"
                  : "border-border bg-transparent"
              }`}
            >
              {isSpoiler && (
                <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5L4 7.5L8.5 2.5"
                    stroke="#0a0f1c"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-text-secondary">Mark as spoiler</span>
        </label>

        {isSpoiler && (
          <p className="rounded border border-status-warning/40 bg-status-warning/10 px-3 py-2 text-xs text-status-warning">
            ⚠ This post will appear in the <strong>Spoilers</strong> tab. The
            body will be hidden behind a reveal prompt on the card.
          </p>
        )}

        {error && <p className="text-xs text-status-error">{error}</p>}
        <button
          onClick={submit}
          disabled={!novelSlug || !title || !body || posting}
          className="w-full rounded bg-accent-highlight py-2 text-sm font-medium text-[#412402] disabled:opacity-40"
        >
          {posting ? "Posting…" : isLoggedIn ? "Post discussion" : "Log in to post"}
        </button>
      </div>
    </Modal>
  );
}
