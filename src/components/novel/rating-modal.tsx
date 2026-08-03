"use client";

import { useEffect, useState } from "react";
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
  const [hadExisting, setHadExisting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  // Load the user's existing rating (if any) so re-opening this modal is
  // obviously an edit, not a fresh addition — previously it always opened
  // blank, which made repeat-rating look like it was stacking up new ratings
  // when it was actually just overwriting the same one (the backend already
  // upserts on one rating per user, so counts were never actually wrong —
  // this was purely about making that clear).
  useEffect(() => {
    if (!open) return;
    setLoadingExisting(true);
    fetch(`/api/novels/${novelSlug}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (data.rating) {
          setRating(data.rating);
          setReviewText(data.reviewText || "");
          setHadExisting(true);
        } else {
          setHadExisting(false);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, [open, novelSlug]);

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
    setHadExisting(false);
    setStatus("idle");
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={reset} title={hadExisting ? "Update your rating" : "Rate this novel"}>
      {status === "sent" ? (
        <div>
          <p className="text-sm text-text-secondary">
            {hadExisting ? "Your rating has been updated." : "Thanks for rating!"}
          </p>
          <button onClick={reset} className="mt-3 w-full rounded bg-accent-highlight py-2 text-sm font-medium text-[#412402]">
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {hadExisting && (
            <p className="text-center text-xs text-text-muted">
              You already rated this novel — submitting again will update your existing rating,
              not add a new one.
            </p>
          )}
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
            disabled={status === "sending" || loadingExisting}
            className="w-full rounded bg-accent-highlight py-2 text-sm font-medium text-[#412402] disabled:opacity-50"
          >
            {status === "sending" ? "Submitting…" : hadExisting ? "Update rating" : "Submit rating"}
          </button>
        </div>
      )}
    </Modal>
  );
}
