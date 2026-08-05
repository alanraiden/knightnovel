"use client";

import { useState } from "react";
import Link from "next/link";

export function TagList({ tags }: { tags: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? tags : tags.slice(0, 5);
  const hiddenCount = tags.length - 5;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((t) => (
        <Link
          key={t}
          href={`/browse?tag=${encodeURIComponent(t)}`}
          className="rounded border border-border px-2 py-0.5 text-[11px] text-text-secondary transition-all duration-200 hover:border-accent-highlight/60 hover:text-text-primary"
        >
          {t}
        </Link>
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
