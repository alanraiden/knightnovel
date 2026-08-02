"use client";

import { useState } from "react";
import Image from "next/image";
import type { NovelView } from "@/lib/queries";
import { cn } from "@/lib/utils";

const periods = ["Day", "Week", "Month"] as const;
type Period = (typeof periods)[number];

export function RankingsClient({
  day,
  week,
  month,
  initialPeriod,
}: {
  day: NovelView[];
  week: NovelView[];
  month: NovelView[];
  initialPeriod?: string;
}) {
  const toTitleCase = (p?: string): Period =>
    p === "week" ? "Week" : p === "month" ? "Month" : "Day";
  const [period, setPeriod] = useState<Period>(toTitleCase(initialPeriod));
  const lists: Record<Period, NovelView[]> = { Day: day, Week: week, Month: month };
  const active = lists[period];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-lg font-medium text-text-primary">Rankings</h1>
      <div className="mb-4 flex gap-2">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "rounded px-3 py-1.5 text-xs",
              p === period ? "bg-accent text-[#042C53]" : "border border-border text-text-secondary"
            )}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="rounded-card border border-border bg-surface p-2">
        {active.map((n, i) => (
          <a
            key={n.slug}
            href={`/novel/${n.slug}`}
            className="flex items-center gap-3 rounded px-2 py-2 text-sm hover:bg-card"
          >
            <span className="w-5 text-text-muted">{i + 1}</span>
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-card">
              {n.cover && <Image src={n.cover} alt={n.title} fill sizes="32px" className="object-cover" />}
            </div>
            <span className="flex-1 truncate text-text-primary">{n.title}</span>
            <span className="text-accent-highlight">★ {n.rating}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
