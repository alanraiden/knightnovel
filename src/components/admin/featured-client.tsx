"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, ArrowUp, ArrowDown, X, Loader2, RotateCcw } from "lucide-react";
import type { NovelView } from "@/lib/queries";

const MAX_FEATURED = 5;

export function FeaturedClient({
  novels,
  initialFeatured,
}: {
  novels: NovelView[];
  initialFeatured: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialFeatured);
  const [saving, setSaving] = useState(false);
  const [randomizing, setRandomizing] = useState(false);
  const [message, setMessage] = useState("");

  // Local view of each novel's hero background, keyed by slug, so uploads
  // reflect instantly without waiting on a full router.refresh().
  const [backgrounds, setBackgrounds] = useState<Record<string, string>>(() =>
    Object.fromEntries(novels.map((n) => [n.slug, n.heroBackground || ""]))
  );
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
  const [bgError, setBgError] = useState<Record<string, string>>({});

  const available = novels.filter((n) => !selected.includes(n.slug));

  const add = (slug: string) => {
    if (selected.length >= MAX_FEATURED) return;
    setSelected((prev) => [...prev, slug]);
  };
  const remove = (slug: string) => setSelected((prev) => prev.filter((s) => s !== slug));
  const move = (index: number, dir: -1 | 1) => {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: selected }),
      });
      if (!res.ok) throw new Error();
      setMessage("Saved — check the homepage hero.");
      router.refresh();
    } catch {
      setMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const randomize = async () => {
    setRandomizing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/featured/randomize", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setSelected(data.slugs);
      setMessage("Randomized — saved automatically.");
      router.refresh();
    } catch {
      setMessage("Failed to randomize.");
    } finally {
      setRandomizing(false);
    }
  };

  const saveBackground = async (slug: string, url: string) => {
    const res = await fetch("/api/admin/featured/background", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save background.");
  };

  const onBackgroundFileChange = async (slug: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setBgError((prev) => ({ ...prev, [slug]: "" }));
    setUploadingSlug(slug);
    const previewUrl = URL.createObjectURL(file);
    setBackgrounds((prev) => ({ ...prev, [slug]: previewUrl }));
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/uploads/hero-background", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      await saveBackground(slug, data.url);
      setBackgrounds((prev) => ({ ...prev, [slug]: data.url }));
      router.refresh();
    } catch (err) {
      setBgError((prev) => ({ ...prev, [slug]: err instanceof Error ? err.message : "Upload failed" }));
    } finally {
      setUploadingSlug(null);
    }
  };

  const resetBackground = async (slug: string) => {
    setBgError((prev) => ({ ...prev, [slug]: "" }));
    setUploadingSlug(slug);
    try {
      await saveBackground(slug, "");
      setBackgrounds((prev) => ({ ...prev, [slug]: "" }));
      router.refresh();
    } catch (err) {
      setBgError((prev) => ({ ...prev, [slug]: err instanceof Error ? err.message : "Failed to reset." }));
    } finally {
      setUploadingSlug(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text-primary">Featured (Homepage Hero)</h1>
          <p className="text-xs text-text-muted">
            Pick up to {MAX_FEATURED} novels for the homepage hero carousel, in order. Each slide can
            also have its own wide background image — otherwise it falls back to a blurred version of
            the cover.
          </p>
        </div>
        <button
          onClick={randomize}
          disabled={randomizing}
          className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-border-hover disabled:opacity-40"
        >
          <Shuffle size={13} /> {randomizing ? "Randomizing…" : "Randomize for me"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-text-primary">
            Selected ({selected.length}/{MAX_FEATURED})
          </p>
          <div className="space-y-3">
            {selected.length === 0 && (
              <p className="rounded-card border border-border bg-surface p-3 text-xs text-text-muted">
                Nothing selected — pick novels from the list on the right, or hit Randomize.
              </p>
            )}
            {selected.map((slug, i) => {
              const novel = novels.find((n) => n.slug === slug);
              if (!novel) return null;
              const bg = backgrounds[slug] || "";
              const isUploading = uploadingSlug === slug;
              return (
                <div key={slug} className="rounded-card border border-border bg-surface p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-xs text-text-muted">{i + 1}</span>
                    <span className="flex-1 truncate text-sm text-text-primary">{novel.title}</span>
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-text-muted disabled:opacity-30">
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === selected.length - 1}
                      className="text-text-muted disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button onClick={() => remove(slug)} className="text-status-error">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 border-t border-border pt-2.5">
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bg || novel.cover}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-base/60">
                          <Loader2 size={14} className="animate-spin text-text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="text-[11px] text-text-muted">
                        {bg ? "Custom hero background" : "Using blurred cover (no custom background set)"}
                      </span>
                      <div className="flex gap-2">
                        <label className="cursor-pointer rounded border border-border px-2 py-1 text-[11px] text-text-secondary hover:border-border-hover">
                          {bg ? "Change" : "Upload background"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => onBackgroundFileChange(slug, e)}
                          />
                        </label>
                        {bg && (
                          <button
                            onClick={() => resetBackground(slug)}
                            disabled={isUploading}
                            className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-text-secondary hover:border-border-hover disabled:opacity-40"
                          >
                            <RotateCcw size={11} /> Reset
                          </button>
                        )}
                      </div>
                      {bgError[slug] && <span className="text-[11px] text-status-error">{bgError[slug]}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-4 rounded bg-accent-highlight px-4 py-2 text-sm font-medium text-[#412402] disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save featured novels"}
          </button>
          {message && <p className="mt-2 text-xs text-status-success">{message}</p>}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text-primary">All novels</p>
          <div className="max-h-96 space-y-1 overflow-y-auto rounded-card border border-border bg-surface p-2 themed-scroll">
            {available.map((n) => (
              <button
                key={n.slug}
                onClick={() => add(n.slug)}
                disabled={selected.length >= MAX_FEATURED}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm text-text-secondary hover:bg-card disabled:opacity-40"
              >
                {n.title}
                <span className="text-xs text-accent">+ Add</span>
              </button>
            ))}
            {available.length === 0 && <p className="p-2 text-xs text-text-muted">All novels are selected.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
