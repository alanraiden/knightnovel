"use client";

import { useState, useCallback } from "react";
import { Lock, Eye, EyeOff, Trash2, Plus, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import type { NovelView } from "@/lib/queries";

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminCommentView {
  id: string;
  parentId: string | null;
  displayName: string;
  body: string;
  stickerUrl?: string;
  createdAt: string;
  status: "visible" | "hidden" | "removed";
  isGhost: boolean;
}

interface ChapterOption {
  id: string;
  chapterNumber: number;
  title: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toLocalDatetimeValue(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function buildTree(flat: AdminCommentView[]): AdminCommentView[] {
  // Return top-level comments sorted by createdAt; children are accessed via flat list
  return flat.filter((c) => c.parentId === null).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function childrenOf(id: string, flat: AdminCommentView[]): AdminCommentView[] {
  return flat
    .filter((c) => c.parentId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// ── Inline compose form ────────────────────────────────────────────────────

function ComposeForm({
  novelSlug,
  chapterId,
  parentId,
  onPosted,
  onCancel,
}: {
  novelSlug: string;
  chapterId: string;
  parentId: string | null;
  onPosted: (comment: AdminCommentView) => void;
  onCancel: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!displayName.trim() || !body.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ghost-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelSlug,
          chapterId: chapterId || undefined,
          parentId: parentId || undefined,
          displayName: displayName.trim(),
          body: body.trim(),
          createdAt: when ? new Date(when).toISOString() : new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post.");
      onPosted({
        id: data.id,
        parentId,
        displayName: displayName.trim(),
        body: body.trim(),
        createdAt: when ? new Date(when).toISOString() : new Date().toISOString(),
        status: "visible",
        isGhost: true,
      });
      setDisplayName("");
      setBody("");
      setWhen("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 rounded-card border border-accent-highlight/40 bg-surface p-3 space-y-2">
      <div className="flex gap-2">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display username"
          className="flex-1 rounded border border-border bg-card px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted"
        />
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="rounded border border-border bg-card px-2 py-1.5 text-xs text-text-primary"
          title="Timestamp (defaults to now)"
        />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Write the comment…"
        className="w-full rounded border border-border bg-card px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted"
      />
      {error && <p className="text-[11px] text-status-error">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={saving || !displayName.trim() || !body.trim()}
          className="rounded bg-accent-highlight px-3 py-1 text-xs font-medium text-[#412402] disabled:opacity-40"
        >
          {saving ? "Posting…" : "Post ghost comment"}
        </button>
        <button
          onClick={onCancel}
          className="rounded px-3 py-1 text-xs text-text-muted hover:text-text-primary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Single comment row ─────────────────────────────────────────────────────

function CommentRow({
  comment,
  novelSlug,
  chapterId,
  flat,
  depth,
  onUpdate,
  onRemove,
  onAdd,
}: {
  comment: AdminCommentView;
  novelSlug: string;
  chapterId: string;
  flat: AdminCommentView[];
  depth: number;
  onUpdate: (id: string, patch: Partial<AdminCommentView>) => void;
  onRemove: (id: string, affected: string[]) => void;
  onAdd: (comment: AdminCommentView) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [displayName, setDisplayName] = useState(comment.displayName);
  const [createdAt, setCreatedAt] = useState(toLocalDatetimeValue(comment.createdAt));
  const [savingEdit, setSavingEdit] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [composingReply, setComposingReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState("");

  const kids = childrenOf(comment.id, flat);
  const isHidden = comment.status === "hidden" || comment.status === "removed";

  const saveEdit = async () => {
    setSavingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/ghost-comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          displayName: displayName.trim(),
          createdAt: createdAt ? new Date(createdAt).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      onUpdate(comment.id, {
        body: body.trim(),
        displayName: displayName.trim(),
        createdAt: createdAt ? new Date(createdAt).toISOString() : comment.createdAt,
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleHide = async () => {
    setHiding(true);
    setError("");
    const newStatus = isHidden ? "visible" : "hidden";
    try {
      // For hide: use DELETE (default soft-hide, cascades to children)
      // For restore: use PATCH status only
      let res: Response;
      if (newStatus === "hidden") {
        res = await fetch(`/api/admin/ghost-comments/${comment.id}`, { method: "DELETE" });
      } else {
        res = await fetch(`/api/admin/ghost-comments/${comment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "visible" }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      // For hide, update affected count in local state
      if (newStatus === "hidden") {
        // Collect this comment + all descendants to update locally
        const allDescendants = collectAllDescendants(comment.id, flat);
        onRemove(comment.id, [comment.id, ...allDescendants]);
      } else {
        onUpdate(comment.id, { status: "visible" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setHiding(false);
    }
  };

  const permanentDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/ghost-comments/${comment.id}?permanent=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      const allDescendants = collectAllDescendants(comment.id, flat);
      onRemove(comment.id, [comment.id, ...allDescendants]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className={depth > 0 ? "ml-5 border-l border-border pl-3" : ""}>
      <div
        className={`rounded-card border p-2.5 text-xs ${
          isHidden
            ? "border-border bg-surface/50 opacity-60"
            : "border-border bg-surface"
        }`}
      >
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1.5">
          {kids.length > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-text-muted hover:text-text-primary"
              title={collapsed ? "Expand replies" : "Collapse replies"}
            >
              {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          {!comment.isGhost && (
            <span
              className="flex items-center gap-1 rounded bg-border px-1.5 py-0.5 text-[10px] text-text-muted"
              title="Real user comment — body cannot be edited through Thread Editor"
            >
              <Lock size={9} /> real user
            </span>
          )}

          <span className="font-medium text-text-primary">{comment.displayName}</span>
          <span className="text-text-disabled">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
          {isHidden && (
            <span className="rounded bg-status-error/15 px-1.5 py-0.5 text-[10px] text-status-error">
              {comment.status}
            </span>
          )}

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {comment.isGhost && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-accent hover:underline"
              >
                Edit
              </button>
            )}
            <button
              onClick={toggleHide}
              disabled={hiding}
              title={isHidden ? "Restore (make visible)" : "Hide (soft-remove, reversible)"}
              className="text-text-muted hover:text-text-primary disabled:opacity-40"
            >
              {hiding ? "…" : isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                title="Permanently delete this comment and all replies"
                className="text-status-error hover:opacity-80"
              >
                <Trash2 size={13} />
              </button>
            ) : (
              <span className="flex items-center gap-1">
                <AlertTriangle size={11} className="text-status-error" />
                <button
                  onClick={permanentDelete}
                  disabled={deleting}
                  className="rounded bg-status-error px-1.5 py-0.5 text-[10px] font-medium text-white disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-text-muted text-[10px] hover:text-text-primary"
                >
                  Cancel
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Edit form (ghost only) */}
        {editing && comment.isGhost ? (
          <div className="space-y-1.5 mt-1">
            <div className="flex gap-2">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Username"
                className="w-32 rounded border border-border bg-card px-1.5 py-1 text-xs text-text-primary"
              />
              <input
                type="datetime-local"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="rounded border border-border bg-card px-1.5 py-1 text-xs text-text-primary"
              />
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full rounded border border-border bg-card px-1.5 py-1 text-xs text-text-primary"
            />
            {error && <p className="text-[11px] text-status-error">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={savingEdit || !body.trim() || !displayName.trim()}
                className="rounded bg-accent px-2.5 py-1 text-[11px] font-medium text-[#042C53] disabled:opacity-40"
              >
                {savingEdit ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => {
                  setBody(comment.body);
                  setDisplayName(comment.displayName);
                  setCreatedAt(toLocalDatetimeValue(comment.createdAt));
                  setEditing(false);
                  setError("");
                }}
                className="rounded px-2.5 py-1 text-[11px] text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Read-only body */
          <p className={`whitespace-pre-wrap leading-relaxed ${comment.isGhost ? "text-text-secondary" : "text-text-muted italic"}`}>
            {comment.body}
          </p>
        )}

        {comment.stickerUrl && (
          <img
            src={comment.stickerUrl}
            alt="Attached image"
            className="mt-1.5 max-h-24 max-w-[140px] rounded border border-border object-contain"
          />
        )}

        {error && !editing && (
          <p className="mt-1 text-[11px] text-status-error">{error}</p>
        )}

        {/* Add reply button */}
        {!composingReply && !isHidden && (
          <button
            onClick={() => setComposingReply(true)}
            className="mt-2 flex items-center gap-1 text-[11px] text-accent hover:underline"
          >
            <Plus size={11} /> Add reply
          </button>
        )}
        {composingReply && (
          <ComposeForm
            novelSlug={novelSlug}
            chapterId={chapterId}
            parentId={comment.id}
            onPosted={(c) => {
              onAdd(c);
              setComposingReply(false);
            }}
            onCancel={() => setComposingReply(false)}
          />
        )}
      </div>

      {/* Nested replies */}
      {!collapsed && kids.length > 0 && (
        <div className="mt-1.5 space-y-1.5">
          {kids.map((child) => (
            <CommentRow
              key={child.id}
              comment={child}
              novelSlug={novelSlug}
              chapterId={chapterId}
              flat={flat}
              depth={depth + 1}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Collect all descendant IDs from the flat list (client-side, for local state)
function collectAllDescendants(parentId: string, flat: AdminCommentView[]): string[] {
  const result: string[] = [];
  const queue = [parentId];
  while (queue.length) {
    const current = queue.shift()!;
    const kids = flat.filter((c) => c.parentId === current);
    for (const k of kids) {
      result.push(k.id);
      queue.push(k.id);
    }
  }
  return result;
}

// ── Main panel ─────────────────────────────────────────────────────────────

export function ThreadEditorPanel({
  novelSlug,
  chapters,
  chapterId,
}: {
  novelSlug: string;
  chapters: ChapterOption[];
  chapterId: string;
}) {
  const [flat, setFlat] = useState<AdminCommentView[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [composingRoot, setComposingRoot] = useState(false);

  const loadThread = useCallback(async () => {
    if (!novelSlug) return;
    setLoading(true);
    setFetchError("");
    setLoaded(false);
    try {
      const qs = new URLSearchParams({ novelSlug });
      if (chapterId) qs.set("chapterId", chapterId);
      const res = await fetch(`/api/admin/ghost-comments/thread?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load thread.");
      setFlat(data.comments ?? []);
      setLoaded(true);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [novelSlug, chapterId]);

  const handleUpdate = useCallback((id: string, patch: Partial<AdminCommentView>) => {
    setFlat((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const handleRemove = useCallback((_id: string, affectedIds: string[]) => {
    // For soft-hide: mark as hidden in local state rather than remove,
    // so the admin can still see them and restore if needed
    setFlat((prev) =>
      prev.map((c) =>
        affectedIds.includes(c.id) ? { ...c, status: "hidden" as const } : c
      )
    );
  }, []);

  const handleAdd = useCallback((comment: AdminCommentView) => {
    setFlat((prev) => [...prev, comment]);
  }, []);

  const roots = loaded ? buildTree(flat) : [];
  const totalVisible = flat.filter((c) => c.status === "visible").length;
  const totalHidden = flat.filter((c) => c.status !== "visible").length;

  const targetLabel = chapterId
    ? `Ch.${chapters.find((c) => c.id === chapterId)?.chapterNumber ?? "?"} — ${chapters.find((c) => c.id === chapterId)?.title ?? chapterId}`
    : "Novel discussion";

  return (
    <div className="space-y-4">
      {/* Load button */}
      <div className="flex items-center gap-3">
        <button
          onClick={loadThread}
          disabled={loading || !novelSlug}
          className="rounded bg-accent-highlight px-4 py-2 text-sm font-medium text-[#412402] disabled:opacity-40"
        >
          {loading ? "Loading…" : loaded ? "Reload thread" : "Load thread"}
        </button>
        {loaded && (
          <span className="text-xs text-text-muted">
            {targetLabel} · {totalVisible} visible{totalHidden > 0 ? `, ${totalHidden} hidden` : ""}
          </span>
        )}
      </div>

      {fetchError && (
        <p className="text-xs text-status-error">{fetchError}</p>
      )}

      {loaded && (
        <div className="space-y-2">
          {/* Add root comment */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-secondary">
              {roots.length === 0 ? "No comments yet" : `${roots.length} top-level comment${roots.length !== 1 ? "s" : ""}`}
            </p>
            {!composingRoot && (
              <button
                onClick={() => setComposingRoot(true)}
                className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-[11px] text-text-secondary hover:border-border-hover hover:text-text-primary"
              >
                <Plus size={11} /> Add comment
              </button>
            )}
          </div>

          {composingRoot && (
            <ComposeForm
              novelSlug={novelSlug}
              chapterId={chapterId}
              parentId={null}
              onPosted={(c) => {
                handleAdd(c);
                setComposingRoot(false);
              }}
              onCancel={() => setComposingRoot(false)}
            />
          )}

          {/* Empty state */}
          {roots.length === 0 && !composingRoot && (
            <div className="rounded-card border border-dashed border-border p-6 text-center">
              <p className="mb-3 text-sm text-text-muted">
                No comments on this {chapterId ? "chapter" : "novel discussion"} yet.
              </p>
              <button
                onClick={() => setComposingRoot(true)}
                className="rounded bg-accent-highlight px-4 py-1.5 text-sm font-medium text-[#412402]"
              >
                Add first comment
              </button>
            </div>
          )}

          {/* Thread tree */}
          <div className="max-h-[720px] space-y-2 overflow-y-auto rounded-card border border-border bg-card p-3 themed-scroll">
            {roots.map((c) => (
              <CommentRow
                key={c.id}
                comment={c}
                novelSlug={novelSlug}
                chapterId={chapterId}
                flat={flat}
                depth={0}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                onAdd={handleAdd}
              />
            ))}
          </div>

          {/* Legend */}
          <p className="text-[11px] text-text-disabled">
            <EyeOff size={10} className="inline mr-1" />Hide = soft-hide (reversible, cascades to replies).{" "}
            <Trash2 size={10} className="inline mr-1" />Trash = permanent delete (irreversible, cascades to replies).{" "}
            <Lock size={10} className="inline mr-1" />Real user comments: status only, no body edits.
          </p>
        </div>
      )}
    </div>
  );
}
