"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RotateCcw, Upload } from "lucide-react";

export function SettingsClient({ initialLogoUrl }: { initialLogoUrl: string | null }) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setError("");
    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setLogoUrl(previewUrl);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/settings/logo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setLogoUrl(data.url);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setLogoUrl(initialLogoUrl);
    } finally {
      setUploading(false);
    }
  };

  const resetLogo = async () => {
    setError("");
    setUploading(true);
    try {
      const res = await fetch("/api/admin/settings/logo", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setLogoUrl(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-lg font-medium text-text-primary">Settings</h1>
      <p className="mb-6 text-sm text-text-muted">
        Site-wide branding. Swaps instantly for everyone — no redeploy needed.
      </p>

      <div className="rounded-card border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-text-primary">Site logo</p>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card border border-border bg-card">
            {logoUrl ? (
              <div className="relative h-9 w-9">
                <Image src={logoUrl} alt="" fill sizes="36px" className="object-contain" />
              </div>
            ) : (
              <ShieldBookMark />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded border border-border bg-card px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent-highlight/50 hover:text-text-primary">
                <Upload size={12} />
                {logoUrl ? "Change" : "Upload logo"}
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
              </label>
              {logoUrl && (
                <button
                  onClick={resetLogo}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-status-error/50 hover:text-status-error"
                >
                  <RotateCcw size={11} /> Reset to default
                </button>
              )}
            </div>
            <p className="text-[11px] text-text-muted">
              {logoUrl ? "Custom logo active" : "Using the default shield mark"} · PNG/SVG with a
              transparent background works best, under 2MB
            </p>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-status-error">{error}</p>}
      </div>
    </div>
  );
}

function ShieldBookMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 3 5v6c0 5 3.8 8.7 9 11 5.2-2.3 9-6 9-11V5l-9-3Z"
        stroke="#D4A35F"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="#D4A35F" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
