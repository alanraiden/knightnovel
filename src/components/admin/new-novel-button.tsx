"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/shared/modal";
import { GENRES } from "@/lib/genres";

export function NewNovelButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [altTitles, setAltTitles] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("ongoing");
  const [country, setCountry] = useState("chinese");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const onCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCoverError("Please choose an image file.");
      return;
    }
    setCoverError("");
    setCoverPreview(URL.createObjectURL(file));
    setCoverUrl(null);
    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/uploads/cover", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverUrl(data.url);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
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
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Something went wrong.");
      setOpen(false);
      setTitle("");
      setSlug("");
      setDescription("");
      setAuthor("");
      setAltTitles("");
      setSelectedGenres([]);
      setTags("");
      setCoverPreview(null);
      setCoverUrl(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-[#042C53]"
      >
        + New novel
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="New novel">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto themed-scroll pr-1">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Cover image (Cloudinary)</label>
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-14 shrink-0 rounded bg-card">
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
                Choose image
                <input type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
              </label>
            </div>
            {coverError && <p className="mt-1 text-xs text-status-error">{coverError}</p>}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug (auto-generated from title if left blank)"
            className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
          <input
            value={altTitles}
            onChange={(e) => setAltTitles(e.target.value)}
            placeholder="Alternative names (comma separated)"
            className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />

          <div>
            <label className="mb-1 block text-xs text-text-secondary">Genres</label>
            <div className="grid max-h-32 grid-cols-2 gap-1 overflow-y-auto rounded border border-border bg-card p-2 themed-scroll sm:grid-cols-3">
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
              placeholder="Reincarnation, System, Weak to Strong…"
              className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary"
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="hiatus">Hiatus</option>
              <option value="dropped">Dropped</option>
            </select>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="flex-1 rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary"
            >
              <option value="chinese">Chinese</option>
              <option value="korean">Korean</option>
              <option value="japanese">Japanese</option>
            </select>
          </div>
          {error && <p className="text-xs text-status-error">{error}</p>}
          <button
            onClick={submit}
            disabled={!title || submitting}
            className="w-full rounded bg-accent py-2 text-sm font-medium text-[#042C53] disabled:opacity-40"
          >
            {submitting ? "Creating…" : "Create novel"}
          </button>
        </div>
      </Modal>
    </>
  );
}
