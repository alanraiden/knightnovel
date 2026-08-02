"use client";

import { useState, useMemo } from "react";
import { NovelCard } from "@/components/novel/novel-card";
import type { NovelView } from "@/lib/queries";

export function SearchClient({ novels }: { novels: NovelView[] }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q) return [];
    const query = q.toLowerCase();
    return novels.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.altTitles.some((a) => a.toLowerCase().includes(query)) ||
        n.author.toLowerCase().includes(query) ||
        n.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [novels, q]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search titles, alt titles, authors, tags…"
        className="w-full rounded border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
      />
      {q && (
        <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
          {results.map((n) => (
            <NovelCard key={n.slug} novel={n} />
          ))}
          {results.length === 0 && <p className="col-span-full text-sm text-text-muted">No results.</p>}
        </div>
      )}
    </div>
  );
}
