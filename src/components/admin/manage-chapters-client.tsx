"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChapterListItem } from "@/lib/queries";

function ChapterRow({
  chapter,
  onDeleted,
}: {
  chapter: ChapterListItem;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const openEditor = async () => {
    setEditing(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chapters/${chapter.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load chapter.");
      setTitle(data.title);
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chapter.");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/chapters/${chapter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete Chapter ${chapter.chapterNumber} — "${chapter.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/chapters/${chapter.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      onDeleted(chapter.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="rounded border border-border-hover bg-card p-2">
        {loading ? (
          <p className="p-2 text-xs text-text-muted">Loading…</p>
        ) : (
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-border bg-surface px-2 py-1.5 text-xs text-text-primary"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full rounded border border-border bg-surface px-2 py-1.5 text-xs text-text-primary"
            />
            {error && <p className="text-xs text-status-error">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="rounded bg-accent px-2.5 py-1 text-xs font-medium text-[#042C53] disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="rounded px-2.5 py-1 text-xs text-text-muted">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded px-2 py-1.5 text-xs text-text-secondary hover:bg-card">
      <span className="truncate">
        Ch.{chapter.chapterNumber} — {chapter.title}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-text-muted">{chapter.status}</span>
        <button onClick={openEditor} className="text-accent">
          Edit
        </button>
        <button onClick={remove} disabled={deleting} className="text-status-error disabled:opacity-40">
          {deleting ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export function ManageChaptersClient({
  novelSlug,
  chapters: initialChapters,
}: {
  novelSlug: string;
  chapters: ChapterListItem[];
}) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initialChapters);
  useEffect(() => setChapters(initialChapters), [initialChapters]);
  const [tab, setTab] = useState<"single" | "bulk">("single");

  // Single-chapter form
  const [num, setNum] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Bulk-paste form — chapters separated by a line of exactly "---",
  // each block's first line is the title, the rest is the content.
  // Chapter numbers are assigned sequentially starting from the field below.
  const [bulkStart, setBulkStart] = useState("1");
  const [bulkText, setBulkText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const submitSingle = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/novels/${novelSlug}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterNumber: Number(num), title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add chapter.");
      setMessage({ type: "ok", text: `Chapter ${num} saved.` });
      setNum("");
      setTitle("");
      setContent("");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to add chapter." });
    } finally {
      setSubmitting(false);
    }
  };

  const submitBulk = async () => {
    const blocks = bulkText.split(/\n---\n/).map((b) => b.trim()).filter(Boolean);
    if (blocks.length === 0) {
      setMessage({ type: "error", text: "Nothing to import — paste chapters separated by a line with just ---" });
      return;
    }
    const startNum = Number(bulkStart) || 1;
    const payload = blocks.map((block, i) => {
      const [firstLine, ...rest] = block.split("\n");
      return { chapterNumber: startNum + i, title: firstLine.trim(), content: rest.join("\n").trim() };
    });

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/novels/${novelSlug}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import chapters.");
      setMessage({ type: "ok", text: `Imported ${data.added} chapters (${data.totalChapters} total now).` });
      setBulkText("");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to import chapters." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => setTab("single")}
            className={`rounded px-3 py-1.5 text-xs ${tab === "single" ? "bg-accent text-[#042C53]" : "border border-border text-text-secondary"}`}
          >
            Add one chapter
          </button>
          <button
            onClick={() => setTab("bulk")}
            className={`rounded px-3 py-1.5 text-xs ${tab === "bulk" ? "bg-accent text-[#042C53]" : "border border-border text-text-secondary"}`}
          >
            Bulk paste
          </button>
        </div>

        {tab === "single" ? (
          <div className="space-y-3 rounded-card border border-border bg-surface p-4">
            <input
              type="number"
              value={num}
              onChange={(e) => setNum(e.target.value)}
              placeholder="Chapter number"
              className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chapter title"
              className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Chapter content…"
              className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
            />
            <button
              onClick={submitSingle}
              disabled={!num || !title || !content || submitting}
              className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-[#042C53] disabled:opacity-40"
            >
              {submitting ? "Saving…" : "Save chapter"}
            </button>
          </div>
        ) : (
          <div className="space-y-3 rounded-card border border-border bg-surface p-4">
            <div>
              <label className="mb-1 block text-xs text-text-secondary">Starting chapter number</label>
              <input
                type="number"
                value={bulkStart}
                onChange={(e) => setBulkStart(e.target.value)}
                className="w-32 rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-secondary">
                Paste chapters — first line of each block is the title, separate chapters with a
                line containing only <code>---</code>
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={14}
                placeholder={"Chapter One Title\nChapter content goes here...\n---\nChapter Two Title\nMore content..."}
                className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>
            <button
              onClick={submitBulk}
              disabled={!bulkText || submitting}
              className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-[#042C53] disabled:opacity-40"
            >
              {submitting ? "Importing…" : "Import chapters"}
            </button>
            <p className="text-[11px] text-text-muted">
              For real .docx/.txt/.csv file uploads, that parsing layer isn't built yet — paste
              the text content here in the meantime.
            </p>
          </div>
        )}

        {message && (
          <p className={`mt-3 text-xs ${message.type === "ok" ? "text-status-success" : "text-status-error"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-text-primary">Existing chapters ({chapters.length})</p>
        <div className="max-h-[480px] space-y-1 overflow-y-auto rounded-card border border-border bg-surface p-2 themed-scroll">
          {chapters.length === 0 ? (
            <p className="p-2 text-xs text-text-muted">No chapters yet.</p>
          ) : (
            chapters.map((c) => (
              <ChapterRow
                key={c.id}
                chapter={c}
                onDeleted={(id) => setChapters((prev) => prev.filter((ch) => ch.id !== id))}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
