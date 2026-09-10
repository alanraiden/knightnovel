"use client";

import { useState } from "react";

interface AnalyticsData {
  "7d": { newUsers: number; newComments: number; newFavorites: number; weeklyViews: number };
  "30d": { newUsers: number; newComments: number; newFavorites: number; monthlyViews: number };
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export function AnalyticsToggle({ analytics }: { analytics: AnalyticsData }) {
  const [period, setPeriod] = useState<"7d" | "30d">("7d");

  const d7 = analytics["7d"];
  const d30 = analytics["30d"];

  const metrics =
    period === "7d"
      ? [
          { label: "New Users", value: fmt(d7.newUsers) },
          { label: "New Comments", value: fmt(d7.newComments) },
          { label: "New Favorites", value: fmt(d7.newFavorites) },
          { label: "Weekly Views", value: fmt(d7.weeklyViews) },
        ]
      : [
          { label: "New Users", value: fmt(d30.newUsers) },
          { label: "New Comments", value: fmt(d30.newComments) },
          { label: "New Favorites", value: fmt(d30.newFavorites) },
          { label: "Monthly Views", value: fmt(d30.monthlyViews) },
        ];

  return (
    <div>
      {/* Period toggle */}
      <div className="mb-3 flex gap-1">
        {(["7d", "30d"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              period === p
                ? "bg-accent text-[#042C53]"
                : "border border-border text-text-muted hover:border-border-hover hover:text-text-secondary"
            }`}
          >
            {p === "7d" ? "Last 7 days" : "Last 30 days"}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-card border border-border bg-surface p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {m.label}
            </p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums text-text-primary">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {period === "7d" && (
        <p className="mt-2 text-[10px] text-text-disabled">
          Weekly Views reflects the running sum of <code>counters.viewsWeekly</code> across all
          novels — reset by a nightly job when configured.
        </p>
      )}
      {period === "30d" && (
        <p className="mt-2 text-[10px] text-text-disabled">
          Monthly Views reflects the running sum of <code>counters.viewsMonthly</code> across all
          novels — reset by a nightly job when configured.
        </p>
      )}
    </div>
  );
}
