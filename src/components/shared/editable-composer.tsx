"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LINE_HEIGHT_PX = 20;
const MAX_LINES = 18;

/**
 * A contenteditable-based text composer, not a <textarea>.
 *
 * Why: Android's Gboard only offers its sticker/GIF picker to elements it
 * considers "rich" input targets — a plain <textarea>/<input> gets rejected
 * with "this app does not support image here" the moment you tap a sticker,
 * because Gboard checks whether the focused element is contenteditable
 * before it'll hand over image content at all. Switching to a real
 * contenteditable div is what makes the sticker/GIF picker available in the
 * keyboard in the first place — the paste handler below is what actually
 * receives what gets picked.
 *
 * Typed text still behaves like a plain-text field: paste is intercepted
 * and forced to plain text (no rich HTML), and content is read back via
 * `innerText` so multi-line text round-trips correctly.
 */
export function EditableComposer({
  value,
  onValueChange,
  onImagePaste,
  placeholder,
  rows = 3,
  className,
  disabled,
}: {
  value: string;
  onValueChange: (text: string) => void;
  onImagePaste?: (file: File) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastSynced = useRef(value);
  const [focused, setFocused] = useState(false);

  // Keep the DOM in sync with external value changes (e.g. clearing the
  // box after posting) without clobbering what the user is mid-typing —
  // only pushes the value in when it didn't originate from this element's
  // own onInput.
  useEffect(() => {
    const el = ref.current;
    if (!el || value === lastSynced.current) return;
    el.innerText = value;
    lastSynced.current = value;
  }, [value]);

  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    const next = el.innerText;
    lastSynced.current = next;
    onValueChange(next);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of Array.from(items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file && onImagePaste) onImagePaste(file);
          return;
        }
      }
    }

    // Plain text only — never let rich HTML/formatting get pasted in.
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    if (document.queryCommandSupported?.("insertText")) {
      document.execCommand("insertText", false, text);
    } else {
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
    }
    handleInput();
  };

  return (
    <div className="relative">
      {!value && placeholder && (
        <span className="pointer-events-none absolute left-2.5 top-2 text-sm text-text-muted">
          {placeholder}
        </span>
      )}
      <div
        ref={ref}
        contentEditable={!disabled}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        suppressContentEditableWarning
        style={{
          minHeight: LINE_HEIGHT_PX * rows,
          maxHeight: LINE_HEIGHT_PX * MAX_LINES,
        }}
        className={cn(
          "overflow-y-auto whitespace-pre-wrap break-words outline-none",
          focused && "ring-1 ring-accent-highlight/40",
          className
        )}
      />
    </div>
  );
}
