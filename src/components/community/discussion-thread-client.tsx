"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Share2, Pin, Lock, EyeOff, Trash2, Pencil, Check } from "lucide-react";
import { CommentItem } from "@/components/novel/comment-thread";
import type { CommentView } from "@/lib/queries";

export function DiscussionThreadClient({
  discussionId,
  novelSlug,
  initialRoot,
  initialReplies,
  initialStatus,
}: {
  discussionId: string;
  novelSlug: string;
  initialRoot: CommentView;
  initialReplies: CommentView[];
  initialStatus: "visible" | "hidden" | "removed";
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "admin";

  const [comments, setComments] = useState<CommentView[]>([initialRoot, ...initialReplies]);
  const [status, setStatus] = useState(initialStatus);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(initialRoot.title ?? "");
  const [editBody, setEditBody] = useState(initialRoot.body);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const root = comments.find((c) => c.id === discussionId) ?? initialRoot;
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);
  const handlePosted = (c: CommentView) => setComments((prev) => [...prev, c]);
  const handleVoteUpdate = (id: string, up: number, down: number) =>
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, up, down } : c)));

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: root.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled share sheet — ignore
    }
  };

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/discussions/${discussionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
      return res.ok;
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    const ok = await patch({ title: editTitle, body: editBody });
    setSaving(false);
    if (ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === discussionId ? { ...c, title: editTitle, body: editBody } : c))
      );
      setEditing(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this discussion and all its replies? This can't be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/discussions/${discussionId}`, { method: "DELETE" });
      if (res.ok) router.push(`/novel/${novelSlug}`);
    } finally {
      setBusy(false);
    }
  };

  if (status === "hidden" && !isAdmin) {
    return <p className="text-sm text-text-muted">This discussion has been hidden by a moderator.</p>;
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-card border border-status-warning/40 bg-status-warning/5 px-3 py-2">
          <span className="text-[11px] text-status-warning">Admin controls:</span>
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-text-secondary hover:bg-card"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={() => patch({ isPinned: !root.isPinned })}
            disabled={busy}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-text-secondary hover:bg-card disabled:opacity-40"
          >
            <Pin size={12} /> {root.isPinned ? "Unpin" : "Pin"}
          </button>
          <button
            onClick={() => patch({ isLocked: !root.isLocked })}
            disabled={busy}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-text-secondary hover:bg-card disabled:opacity-40"
          >
            <Lock size={12} /> {root.isLocked ? "Unlock" : "Lock"}
          </button>
          <button
            onClick={async () => {
              const next = status === "hidden" ? "visible" : "hidden";
              const ok = await patch({ status: next });
              if (ok) setStatus(next);
            }}
            disabled={busy}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-text-secondary hover:bg-card disabled:opacity-40"
          >
            <EyeOff size={12} /> {status === "hidden" ? "Unhide" : "Hide"}
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs text-status-error hover:bg-card disabled:opacity-40"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}

      {status === "hidden" && isAdmin && (
        <p className="mb-3 text-xs text-status-warning">
          This discussion is hidden from visitors — only admins can see it right now.
        </p>
      )}

      <div className="mb-4 flex items-start justify-between gap-3">
        {editing ? (
          <div className="flex-1 space-y-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-lg font-medium text-text-primary"
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex items-center gap-1 rounded bg-accent-highlight px-3 py-1.5 text-xs font-medium text-[#412402] disabled:opacity-40"
              >
                <Check size={13} /> {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="rounded px-3 py-1.5 text-xs text-text-muted">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {root.isPinned && (
              <span className="mb-1 inline-block rounded-full bg-status-warning/15 px-2 py-0.5 text-[10px] font-medium text-status-warning">
                📌 Pinned
              </span>
            )}
            {root.category && (
              <span className="mb-1 ml-1.5 inline-block rounded-full bg-accent-highlight/15 px-2 py-0.5 text-[10px] font-medium text-accent-highlight">
                {root.category}
              </span>
            )}
            <h1 className="text-xl font-medium text-text-primary">{root.title}</h1>
          </div>
        )}
        <button
          onClick={share}
          className="flex shrink-0 items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-border-hover"
        >
          <Share2 size={13} /> {copied ? "Copied!" : "Share"}
        </button>
      </div>

      {root.isLocked && (
        <p className="mb-3 rounded-card border border-border bg-surface px-3 py-2 text-xs text-text-muted">
          🔒 This discussion is locked — no new replies.
        </p>
      )}

      <CommentItem
        comment={root}
        repliesOf={repliesOf}
        targetType="novel"
        targetId={novelSlug}
        onPosted={handlePosted}
        onVoteUpdate={handleVoteUpdate}
        locked={root.isLocked}
      />
    </div>
  );
}
