"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const LINE_HEIGHT_PX = 20;
const MAX_LINES = 18; // caps growth around 15-20 lines, then scrolls internally

export function AutoResizeTextarea({
  value,
  onChange,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = LINE_HEIGHT_PX * MAX_LINES;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      className={cn("resize-none transition-[height] duration-100", className)}
      {...rest}
    />
  );
}
