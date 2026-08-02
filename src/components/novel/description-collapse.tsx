"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function DescriptionCollapse({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const lineCount = text.split("\n").length;
  const isLong = lineCount > 18 || text.length > 900;

  return (
    <div className="mt-4 max-w-3xl">
      <p
        className={cn(
          "whitespace-pre-line text-sm leading-relaxed text-text-secondary",
          !expanded && isLong && "line-clamp-[18]"
        )}
      >
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-medium text-accent-highlight hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
