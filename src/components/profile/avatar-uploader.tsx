"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

const PREVIEW_SIZE = 220; // px, the square crop viewport shown on screen
const OUTPUT_SIZE = 480; // px, the square image we actually upload
const MAX_ZOOM = 3;

export function AvatarUploader({
  currentUrl,
  onUploaded,
}: {
  currentUrl: string | null | undefined;
  onUploaded: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawImage, setRawImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // px, within the preview box
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const baseScale = rawImage ? Math.max(PREVIEW_SIZE / rawImage.width, PREVIEW_SIZE / rawImage.height) : 1;

  const clampPan = useCallback(
    (next: { x: number; y: number }, z: number) => {
      if (!rawImage) return next;
      const scale = baseScale * z;
      const w = rawImage.width * scale;
      const h = rawImage.height * scale;
      const maxX = Math.max(0, (w - PREVIEW_SIZE) / 2);
      const maxY = Math.max(0, (h - PREVIEW_SIZE) / 2);
      return { x: Math.min(maxX, Math.max(-maxX, next.x)), y: Math.min(maxY, Math.max(-maxY, next.y)) };
    },
    [rawImage, baseScale]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    setError("");
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setRawImage(img);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = url;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan(clampPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy }, zoom));
  };
  const onPointerUp = () => setDragging(false);

  const onZoomChange = (z: number) => {
    setZoom(z);
    setPan((p) => clampPan(p, z));
  };

  const cancel = () => {
    setRawImage(null);
    setError("");
  };

  const save = async () => {
    if (!rawImage) return;
    setUploading(true);
    setError("");
    try {
      // Replay the exact same pan/zoom transform used for the on-screen
      // preview, just at OUTPUT_SIZE instead of PREVIEW_SIZE, so what you
      // see is what gets uploaded.
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const ratio = OUTPUT_SIZE / PREVIEW_SIZE;
      const scale = baseScale * zoom * ratio;
      const w = rawImage.width * scale;
      const h = rawImage.height * scale;
      const dx = OUTPUT_SIZE / 2 - w / 2 + pan.x * ratio;
      const dy = OUTPUT_SIZE / 2 - h / 2 + pan.y * ratio;

      ctx.drawImage(rawImage, dx, dy, w, h);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
      );
      if (!blob) throw new Error("Couldn't process image");

      const form = new FormData();
      form.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onUploaded(data.url);
      setRawImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (rawImage) {
    return (
      <div className="rounded-card border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-text-primary">Position your photo</p>
        <div
          className="mx-auto overflow-hidden rounded-full border border-border bg-card"
          style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <img
            src={rawImage.src}
            alt=""
            draggable={false}
            style={{
              width: rawImage.width * baseScale * zoom,
              height: rawImage.height * baseScale * zoom,
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              maxWidth: "none",
            }}
          />
        </div>

        <div className="mx-auto mt-3 flex max-w-[220px] items-center gap-2">
          <span className="text-xs text-text-muted">Zoom</span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.05}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="flex-1"
          />
        </div>

        {error && <p className="mt-2 text-center text-xs text-status-error">{error}</p>}

        <div className="mt-3 flex justify-center gap-2">
          <button
            onClick={save}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded bg-accent-highlight px-3 py-1.5 text-xs font-medium text-[#412402] disabled:opacity-60"
          >
            {uploading && <Loader2 size={12} className="animate-spin" />}
            {uploading ? "Uploading…" : "Save photo"}
          </button>
          <button
            onClick={cancel}
            disabled={uploading}
            className="rounded border border-border px-3 py-1.5 text-xs text-text-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border bg-card">
        {currentUrl ? (
          <img src={currentUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-disabled">
            <Camera size={18} />
          </div>
        )}
      </div>
      <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded border border-border bg-card px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent-highlight/50 hover:text-text-primary">
        <Camera size={12} />
        {currentUrl ? "Change photo" : "Upload photo"}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </label>
    </div>
  );
}
