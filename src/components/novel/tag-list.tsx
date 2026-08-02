"use client";

import { useState } from "react";

export function TagList({ tags }: { tags: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? tags : tags.slice(0, 5);
  const hiddenCount = tags.length - 5;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((t) => (
        <span key={t} className="rounded border border-border px-2 py-0.5 text-[11px] text-text-secondary">
          {t}
        </span>
      ))}
      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="rounded border border-border-hover px-2 py-0.5 text-[11px] text-accent"
        >
          +{hiddenCount} more
        </button>
      )}
    </div>
  );
}
