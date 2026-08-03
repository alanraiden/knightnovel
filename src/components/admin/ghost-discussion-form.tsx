"use client";

import { useState } from "react";
import { BulkGhostImport } from "@/components/admin/bulk-ghost-import";
import type { NovelView } from "@/lib/queries";

const categories = ["Discussion", "Recommendation", "Question", "Theory", "Meme"];

export function GhostDiscussionForm({ novels }: { novels: NovelView[] }) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [novelSlug, setNovelSlug] = useState(novels[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/ghost-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelSlug,
          displayName,
          title,
          category,
          body,
          createdAt: when || new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post.");
      setStatus("saved");
      setTitle("");
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
      <h1 className="text-lg font-medium text-text-primary">Ghost Discussions</h1>
      <p className="mt-1 text-xs text-text-muted">
        Admin only · invisible to visitors. Creates a Community Discussion (a novel-page thread with
        a title and category) that renders identically to one posted by a real reader — useful for
        migrating discussion threads from another site.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setMode("single")}
          className={`rounded px-3 py-1.5 text-xs ${mode === "single" ? "bg-accent-highlight text-[#412402]" : "border border-border text-text-secondary"}`}
        >
          Single discussion
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

        {mode === "single" ? (
          <>
            <div>
              <label className="mb-1 block text-xs text-text-secondary">Discussion title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
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
              <label className="mb-1 block text-xs text-text-secondary">Post body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
                placeholder="Write the discussion post as it should appear to visitors…"
              />
            </div>
            <button
              onClick={submit}
              disabled={!novelSlug || !title || !displayName || !body || status === "saving"}
              className="rounded bg-accent-highlight px-4 py-2 text-sm font-medium text-[#412402] disabled:opacity-40"
            >
              {status === "saving" ? "Posting…" : "Post discussion"}
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
          <BulkGhostImport novelSlug={novelSlug} chapterId="" />
        )}
      </div>
    </div>
  );
}
