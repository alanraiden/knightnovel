"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { GENRES } from "@/lib/genres";
import type { EditableProfile, NotificationSettings } from "@/lib/queries";

const NOTIF_LABELS: { key: keyof NotificationSettings; label: string }[] = [
  { key: "reply", label: "Someone replies to your comment" },
  { key: "mention", label: "Someone @mentions you" },
  { key: "chapter_update", label: "New chapters on novels you've bookmarked" },
  { key: "announcement", label: "Site announcements" },
];

const MAX_BIO = 100;

export function ProfileFieldsEditor({
  initialProfile,
  initialNotificationSettings,
  currentName,
  onNameSaved,
}: {
  initialProfile: EditableProfile;
  initialNotificationSettings: NotificationSettings;
  currentName: string;
  onNameSaved: (name: string) => void;
}) {
  const [displayName, setDisplayName] = useState(initialProfile.displayName || currentName);
  const [bio, setBio] = useState(initialProfile.bio);
  const [favoriteGenre, setFavoriteGenre] = useState(initialProfile.favoriteGenre);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [notifSettings, setNotifSettings] = useState(initialNotificationSettings);
  const [notifSaving, setNotifSaving] = useState<string | null>(null);

  const saveProfile = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, favoriteGenre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onNameSaved(displayName);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = async (key: keyof NotificationSettings, value: boolean) => {
    const next = { ...notifSettings, [key]: value };
    setNotifSettings(next);
    setNotifSaving(key);
    try {
      await fetch("/api/profile/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } finally {
      setNotifSaving(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-card border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-text-primary">Profile</p>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs text-text-muted">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-sm text-text-primary focus:outline-none"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 flex items-center justify-between text-xs text-text-muted">
            <span>Bio</span>
            <span className={bio.length > MAX_BIO ? "text-status-error" : ""}>{bio.length}/{MAX_BIO}</span>
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
            rows={2}
            className="w-full resize-none rounded border border-border bg-card px-2.5 py-1.5 text-sm text-text-primary focus:outline-none"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs text-text-muted">Favorite genre</span>
          <select
            value={favoriteGenre}
            onChange={(e) => setFavoriteGenre(e.target.value)}
            className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-sm text-text-primary focus:outline-none"
          >
            <option value="">None selected</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="mb-2 text-xs text-status-error">{error}</p>}

        <button
          onClick={saveProfile}
          disabled={saving || !displayName.trim()}
          className="flex items-center gap-1.5 rounded bg-accent-highlight px-3 py-1.5 text-xs font-medium text-[#412402] disabled:opacity-60"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : null}
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-text-primary">Notifications</p>
        <div className="space-y-3">
          {NOTIF_LABELS.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between gap-3 text-sm text-text-secondary">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={notifSettings[key]}
                disabled={notifSaving === key}
                onChange={(e) => toggleNotif(key, e.target.checked)}
                className="h-4 w-4 accent-accent-highlight"
              />
            </label>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-text-muted">Saves automatically as you toggle these.</p>
      </div>
    </div>
  );
}
