"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";

const reasons = ["Spam", "Harassment", "Spoiler without tag", "Copyright / DMCA", "Inappropriate image", "Other"];

export function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
  targetLabel,
}: {
  open: boolean;
  onClose: () => void;
  targetType: "novel" | "comment" | "review" | "user";
  targetId: string;
  targetLabel?: string;
}) {
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, targetLabel, reason, details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const reset = () => {
    setReason(reasons[0]);
    setDetails("");
    setStatus("idle");
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={reset} title={`Report ${targetType}`}>
      {status === "sent" ? (
        <div>
          <p className="text-sm text-text-secondary">Thanks — our team will take a look.</p>
          <button
            onClick={reset}
            className="mt-3 w-full rounded bg-accent py-2 text-sm font-medium text-[#042C53]"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
              placeholder="Anything that helps us review this…"
            />
          </div>
          {error && <p className="text-xs text-status-error">{error}</p>}
          <button
            onClick={submit}
            disabled={status === "sending"}
            className="w-full rounded bg-status-error py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "sending" ? "Submitting…" : "Submit report"}
          </button>
        </div>
      )}
    </Modal>
  );
}
