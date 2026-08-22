"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { GENRES } from "@/lib/genres";
import type { NovelView } from "@/lib/queries";

export function EditNovelClient({ novel }: { novel: NovelView }) {
  const router = useRouter();
  const [title, setTitle] = useState(novel.title);
  const [author, setAuthor] = useState(novel.author);
  const [altTitles, setAltTitles] = useState(novel.altTitles.join(", "));
  const [description, setDescription] = useState(novel.description);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(novel.genres);
  const [tags, setTags] = useState(novel.tags.join(", "));
  const [status, setStatus] = useState(novel.status);
  const [country, setCountry] = useState(novel.country);
  const [coverPreview, setCoverPreview] = useState<string | null>(novel.cover || null);
  const [coverUrl, setCoverUrl] = useState<string | null>(novel.cover || null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const onCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/uploads/cover", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverUrl(data.url);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploadingCover(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/novels/${novel.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          authors: author ? [author] : [],
          altTitles: altTitles.split(",").map((t) => t.trim()).filter(Boolean),
          genres: selectedGenres,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          status,
          country,
          coverImageUrl: coverUrl || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setMessage({ type: "ok", text: "Saved." });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${novel.title}" and all its chapters? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/novels/${novel.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      router.push("/kn-x9b4/novels");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete." });
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-lg space-y-3">
      <div>
        <label className="mb-1 block text-xs text-text-secondary">Cover image (Cloudinary)</label>
        <div className="flex items-center gap-3">
          <div className="relative h-24 w-16 shrink-0 rounded bg-card">
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPreview} alt="" className="h-full w-full rounded object-cover" />
            )}
            {uploadingCover && (
              <div className="absolute inset-0 flex items-center justify-center rounded bg-base/60">
                <Loader2 size={14} className="animate-spin text-text-primary" />
              </div>
            )}
          </div>
          <label className="cursor-pointer rounded border border-border px-2.5 py-1.5 text-xs text-text-secondary hover:border-border-hover">
            Change image
            <input type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
          </label>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full rounded border border-border bg-surface px-2.5 py-2 text-sm text-text-primary"
      />
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author"
        className="w-full rounded border border-border bg-surface px-2.5 py-2 text-sm text-text-primary"
      />
      <input
        value={altTitles}
        onChange={(e) => setAltTitles(e.target.value)}
        placeholder="Alternative names (comma separated)"
        className="w-full rounded border border-border bg-surface px-2.5 py-2 text-sm text-text-primary"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Description"
        className="w-full rounded border border-border bg-surface px-2.5 py-2 text-sm text-text-primary"
      />

      <div>
        <label className="mb-1 block text-xs text-text-secondary">Genres</label>
        <div className="grid max-h-32 grid-cols-2 gap-1 overflow-y-auto rounded border border-border bg-surface p-2 themed-scroll sm:grid-cols-3">
          {GENRES.map((g) => (
            <label key={g} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <input type="checkbox" checked={selectedGenres.includes(g)} onChange={() => toggleGenre(g)} />
              {g}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-text-secondary">Tags (comma separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded border border-border bg-surface px-2.5 py-2 text-sm text-text-primary"
        />
      </div>

      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="flex-1 rounded border border-border bg-surface px-2.5 py-2 text-sm text-text-primary"
        >
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">Hiatus</option>
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as typeof country)}
          className="flex-1 rounded border border-border bg-surface px-2.5 py-2 text-sm text-text-primary"
        >
          <option value="chinese">Chinese</option>
          <option value="korean">Korean</option>
          <option value="japanese">Japanese</option>
        </select>
      </div>

      {message && (
        <p className={`text-xs ${message.type === "ok" ? "text-status-success" : "text-status-error"}`}>
          {message.text}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={save}
          disabled={!title || saving}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-[#042C53] disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={remove}
          disabled={deleting}
          className="rounded border border-status-error px-4 py-2 text-sm text-status-error disabled:opacity-40"
        >
          {deleting ? "Deleting…" : "Delete novel"}
        </button>
      </div>
    </div>
  );
}
