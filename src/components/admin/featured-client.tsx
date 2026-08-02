"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, ArrowUp, ArrowDown, X } from "lucide-react";
import type { NovelView } from "@/lib/queries";

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

  const available = novels.filter((n) => !selected.includes(n.slug));

  const add = (slug: string) => {
    if (selected.length >= 3) return;
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text-primary">Featured (Homepage Hero)</h1>
          <p className="text-xs text-text-muted">Pick up to 3 novels for the homepage hero carousel, in order.</p>
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
          <p className="mb-2 text-sm font-medium text-text-primary">Selected ({selected.length}/3)</p>
          <div className="space-y-2">
            {selected.length === 0 && (
              <p className="rounded-card border border-border bg-surface p-3 text-xs text-text-muted">
                Nothing selected — pick novels from the list on the right, or hit Randomize.
              </p>
            )}
            {selected.map((slug, i) => {
              const novel = novels.find((n) => n.slug === slug);
              if (!novel) return null;
              return (
                <div key={slug} className="flex items-center gap-2 rounded-card border border-border bg-surface p-2.5">
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
              );
            })}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-[#042C53] disabled:opacity-40"
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
                disabled={selected.length >= 3}
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
