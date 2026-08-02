"use client";

import { useEffect, useState } from "react";

interface ReportItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string;
  reporterEmail: string;
  createdAt: string;
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ReportItem[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/moderation/reports");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load reports.");
      setReports(data.reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id: string, action: "dismiss" | "remove") => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/moderation/reports/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to resolve report.");
      setReports((prev) => prev?.filter((r) => r.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve report.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-lg font-medium text-text-primary">Moderation</h1>
      <p className="mb-4 text-xs text-text-muted">
        Reported comments, reviews, and sticker uploads land here for review.
      </p>

      {error && <p className="mb-3 text-xs text-status-error">{error}</p>}

      {reports === null ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-text-muted">No open reports. 🎉</p>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-card border border-border bg-surface p-3 text-sm">
              <div className="min-w-0">
                <p className="text-text-primary">
                  {r.targetType} <span className="text-text-muted">· {r.reason}</span>
                </p>
                {r.details && <p className="mt-0.5 truncate text-xs text-text-secondary">{r.details}</p>}
                <p className="mt-0.5 text-[10px] text-text-disabled">Reported by {r.reporterEmail}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => resolve(r.id, "dismiss")}
                  disabled={busyId === r.id}
                  className="rounded border border-border px-2.5 py-1 text-xs text-text-secondary disabled:opacity-40"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => resolve(r.id, "remove")}
                  disabled={busyId === r.id}
                  className="rounded bg-status-error px-2.5 py-1 text-xs text-white disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
