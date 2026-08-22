"use client";

import { useState } from "react";

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const publish = async () => {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, isPinned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish.");
      setStatus("saved");
      setTitle("");
      setBody("");
      setIsPinned(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish.");
      setStatus("error");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium text-text-primary">Announcements</h1>
      <div className="max-w-lg space-y-3 rounded-card border border-border bg-surface p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded border border-border bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Message"
          className="w-full rounded border border-border bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
        />
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
          Pin to top of Community page
        </label>
        {error && <p className="text-xs text-status-error">{error}</p>}
        {status === "saved" && <p className="text-xs text-status-success">Published.</p>}
        <button
          onClick={publish}
          disabled={!title || !body || status === "saving"}
          className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-[#042C53] disabled:opacity-40"
        >
          {status === "saving" ? "Publishing…" : "Publish"}
        </button>
      </div>
    </div>
  );
}
