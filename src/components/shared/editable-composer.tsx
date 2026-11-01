"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LINE_HEIGHT_PX = 20;
const MAX_LINES = 18;

/**
 * A contenteditable-based text composer, not a <textarea>.
 *
 * Why contenteditable: Android's Gboard only offers its GIF/sticker picker to
 * elements it considers a "rich" input target. A plain <textarea>/<input>
 * receives "This app does not support image here" when the user taps the GIF
 * button, because Gboard checks the focused element before handing over image
 * content. A <div contentEditable> is what makes the picker available at all.
 *
 * How Gboard delivers images (confirmed Web platform behaviour):
 *   • The GIF/sticker is delivered as a `beforeinput` event with
 *     inputType === "insertContent" (Chrome 75+, Android Chrome via Gboard).
 *   • event.dataTransfer?.items contains the image blob (commonly image/gif,
 *     image/webp, or image/png depending on keyboard version).
 *   • This is NOT a clipboard paste — onPaste never fires for keyboard GIF
 *     insertion. The beforeinput handler is the only correct interception
 *     point on Android Chrome.
 *   • Desktop Chrome clipboard paste arrives as onPaste, covered separately.
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

  // ── Clipboard paste (desktop + Android copy-paste) ──────────────────────
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

  // ── Gboard / IME image insertion (Android Chrome) ────────────────────────
  // Gboard delivers GIFs via beforeinput with inputType === "insertContent".
  // event.dataTransfer contains the image blob. This fires BEFORE the element
  // content changes, so we can cancel it and handle the file ourselves.
  // We must attach this with addEventListener (not React's synthetic event
  // system) because React does not expose the non-cancelable InputEvent
  // dataTransfer on the synthetic wrapper in all versions.
  useEffect(() => {
    const el = ref.current;
    if (!el || !onImagePaste) return;

    const handler = (e: Event) => {
      const ie = e as InputEvent;
      if (ie.inputType !== "insertContent") return;

      const dt = ie.dataTransfer;
      if (!dt) return;

      const items = Array.from(dt.items ?? []);
      const imageItem = items.find(
        (item) => item.kind === "file" && item.type.startsWith("image/")
      );
      if (!imageItem) return;

      // Cancel the browser's default insertion of the image as an <img>
      // inside the contenteditable — we handle it ourselves via R2 upload.
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) onImagePaste(file);
    };

    el.addEventListener("beforeinput", handler);
    return () => el.removeEventListener("beforeinput", handler);
  }, [onImagePaste]);

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
        // `enterkeyhint` and `inputmode` tell Android keyboards this is a
        // multi-line text input, which unlocks Gboard's emoji/GIF shelf.
        // Without inputmode the shelf may still show but image insertion
        // is gated behind the beforeinput check above.
        enterKeyHint="enter"
        inputMode="text"
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
