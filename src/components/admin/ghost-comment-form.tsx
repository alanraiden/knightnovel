"use client";

import { useEffect, useState } from "react";
import type { NovelView } from "@/lib/queries";
import { BulkGhostImport } from "@/components/admin/bulk-ghost-import";

interface ChapterOption {
  id: string;
  chapterNumber: number;
  title: string;
}

export function GhostCommentForm({ novels }: { novels: NovelView[] }) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [novelSlug, setNovelSlug] = useState(novels[0]?.slug ?? "");
  const [chapters, setChapters] = useState<ChapterOption[]>([]);
  const [chapterId, setChapterId] = useState(""); // "" = novel-level comment
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [category, setCategory] = useState("Discussion");
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setChapterId("");
    if (!novelSlug) return;
    fetch(`/api/admin/novels/${novelSlug}/chapters`)
      .then((r) => r.json())
      .then((data) => setChapters(data.chapters ?? []))
      .catch(() => setChapters([]));
  }, [novelSlug]);

  const submit = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/ghost-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelSlug,
          chapterId: chapterId || undefined,
          displayName,
          title: !chapterId ? discussionTitle || undefined : undefined,
          category: !chapterId ? category : undefined,
          body,
          createdAt: when || new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post.");
      setStatus("saved");
      setDisplayName("");
      setBody("");
      setWhen("");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to post.");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-medium text-text-primary">Ghost comments</h1>
      <p className="mt-1 text-xs text-text-muted">
        Admin only · invisible to visitors. Posts a comment that renders identically to a normal
        reader comment — no admin origin is ever exposed through the public API.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setMode("single")}
          className={`rounded px-3 py-1.5 text-xs ${mode === "single" ? "bg-accent-highlight text-[#412402]" : "border border-border text-text-secondary"}`}
        >
          Single comment
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`rounded px-3 py-1.5 text-xs ${mode === "bulk" ? "bg-accent-highlight text-[#412402]" : "border border-border text-text-secondary"}`}
        >
          Bulk import
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Novel</label>
          <select
            value={novelSlug}
            onChange={(e) => setNovelSlug(e.target.value)}
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          >
            {novels.length === 0 && <option value="">No novels yet — add one under Admin → Novels</option>}
            {novels.map((n) => (
              <option key={n.slug} value={n.slug}>
                {n.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-text-secondary">
            Chapter <span className="text-text-disabled">(optional — leave as "Novel page" to post on the novel's discussion instead)</span>
          </label>
          <select
            value={chapterId}
            onChange={(e) => setChapterId(e.target.value)}
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          >
            <option value="">Novel page (discussion)</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                Ch.{c.chapterNumber} — {c.title}
              </option>
            ))}
          </select>
          {novelSlug && chapters.length === 0 && (
            <p className="mt-1 text-[11px] text-text-muted">
              No chapters found for this novel yet — it'll post as a novel-page comment.
            </p>
          )}
        </div>

        {mode === "single" ? (
          <>
            {!chapterId && (
              <>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Discussion title <span className="text-text-disabled">(shown on the Community page)</span>
                  </label>
                  <input
                    value={discussionTitle}
                    onChange={(e) => setDiscussionTitle(e.target.value)}
                    placeholder="e.g. What did you think of the ending?"
                    className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                  >
                    {["Discussion", "Recommendation", "Question", "Theory", "Meme"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="mb-1 block text-xs text-text-secondary">Display username</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. NovelFan42"
                className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-text-secondary">Date and time (optional — defaults to now)</label>
              <input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-text-secondary">Comment</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
                placeholder="Write the comment as it should appear to visitors…"
              />
            </div>

            <button
              onClick={submit}
              disabled={!novelSlug || !displayName || !body || status === "saving"}
              className="rounded bg-accent-highlight px-4 py-2 text-sm font-medium text-[#412402] disabled:opacity-40"
            >
              {status === "saving" ? "Posting…" : "Post ghost comment"}
            </button>
            {status === "saved" && <p className="text-xs text-status-success">Posted.</p>}
            {status === "error" && (
              <p className="text-xs text-status-error">
                {errorMessage}
                {errorMessage.toLowerCase().includes("not found") &&
                  " — this novel doesn't exist in your database yet. Create it under Admin → Novels."}
              </p>
            )}
          </>
        ) : (
          <BulkGhostImport novelSlug={novelSlug} chapterId={chapterId} />
        )}
      </div>
    </div>
  );
}
