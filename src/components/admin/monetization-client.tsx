"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdSettings } from "@/lib/queries";

const PAGE_TYPES: { key: keyof AdSettings["pageTypes"]; label: string }[] = [
  { key: "chapter", label: "Chapter pages" },
  { key: "novel", label: "Novel pages" },
  { key: "community", label: "Community pages" },
];

const POSITIONS: { key: keyof AdSettings["positions"]; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "middle", label: "Middle" },
  { key: "bottom", label: "Bottom" },
];

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
        checked ? "bg-accent-highlight" : "bg-card"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-base transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function MonetizationClient({ initialSettings }: { initialSettings: AdSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async (next: AdSettings) => {
    setSettings(next);
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/monetization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-lg font-medium text-text-primary">Monetization</h1>
      <p className="mb-6 text-sm text-text-muted">
        Controls where ad slots can appear. Nothing here talks to Google AdSense or any ad
        network yet — this just decides whether the ad slot placeholders render at all. Changes
        apply immediately, no redeploy needed.
      </p>

      <div className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Ads enabled</p>
            <p className="text-xs text-text-muted">Master switch — off means no ad slots render anywhere, regardless of the settings below.</p>
          </div>
          <Toggle checked={settings.enabled} onChange={(v) => save({ ...settings, enabled: v })} disabled={saving} />
        </div>
      </div>

      <div className={`mt-4 rounded-card border border-border bg-surface p-4 ${!settings.enabled ? "opacity-50" : ""}`}>
        <p className="mb-3 text-sm font-medium text-text-primary">Page types</p>
        <div className="space-y-3">
          {PAGE_TYPES.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{label}</span>
              <Toggle
                checked={settings.pageTypes[key]}
                disabled={saving || !settings.enabled}
                onChange={(v) => save({ ...settings, pageTypes: { ...settings.pageTypes, [key]: v } })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-4 rounded-card border border-border bg-surface p-4 ${!settings.enabled ? "opacity-50" : ""}`}>
        <p className="mb-3 text-sm font-medium text-text-primary">Positions</p>
        <div className="space-y-3">
          {POSITIONS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{label}</span>
              <Toggle
                checked={settings.positions[key]}
                disabled={saving || !settings.enabled}
                onChange={(v) => save({ ...settings, positions: { ...settings.positions, [key]: v } })}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-text-muted">
          A slot only renders when its page type AND its position are both on — e.g. disabling
          &quot;Middle&quot; here removes the mid-page slot from every page type at once.
        </p>
      </div>

      {error && <p className="mt-3 text-xs text-status-error">{error}</p>}
      {saved && !saving && <p className="mt-3 text-xs text-status-success">Saved.</p>}

      <div className="mt-6 rounded-card border border-border-hover bg-card p-4 text-xs text-text-muted">
        <p className="mb-1 font-medium text-text-secondary">Adding a real ad network later</p>
        <p>
          Every ad slot on the site renders through one shared <code>&lt;AdSlot /&gt;</code>{" "}
          component. When you&apos;re ready for AdSense (or anything else), that component is the
          only place that needs real ad-network code — every page that already places a slot
          keeps working without changes.
        </p>
      </div>
    </div>
  );
}
