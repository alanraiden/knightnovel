"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Modal } from "@/components/shared/modal";

export function RatingModal({
  open,
  onClose,
  novelSlug,
}: {
  open: boolean;
  onClose: () => void;
  novelSlug: string;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    if (rating === 0) {
      setError("Pick a rating first.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(`/api/novels/${novelSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, reviewText }),
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
    setRating(0);
    setHover(0);
    setReviewText("");
    setStatus("idle");
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={reset} title="Rate this novel">
      {status === "sent" ? (
        <div>
          <p className="text-sm text-text-secondary">Thanks for rating!</p>
          <button onClick={reset} className="mt-3 w-full rounded bg-accent py-2 text-sm font-medium text-[#042C53]">
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <Star
                  size={26}
                  className={(hover || rating) >= n ? "fill-accent-highlight text-accent-highlight" : "text-border-hover"}
                />
              </button>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={3}
            placeholder="Write a review (optional)…"
            className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
          {error && <p className="text-xs text-status-error">{error}</p>}
          <button
            onClick={submit}
            disabled={status === "sending"}
            className="w-full rounded bg-accent py-2 text-sm font-medium text-[#042C53] disabled:opacity-50"
          >
            {status === "sending" ? "Submitting…" : "Submit rating"}
          </button>
        </div>
      )}
    </Modal>
  );
}
