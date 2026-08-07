"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, MessageCircle, Flag, Eye, Image as ImageIcon, Loader2, Pencil, Check, X } from "lucide-react";
import { ReportModal } from "@/components/shared/report-modal";
import { AutoResizeTextarea } from "@/components/shared/auto-resize-textarea";
import { cn, timeAgo } from "@/lib/utils";
import type { CommentView, CommentSort } from "@/lib/queries";

const MENTION_RE = /@([a-zA-Z0-9_]{3,20})/g;

// Highlights @username mentions inline — no link target exists yet (no
// public profile-by-username page), so this is styling only for now.
function renderWithMentions(text: string) {
  const parts = text.split(MENTION_RE);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-medium text-accent-highlight">
        @{part}
      </span>
    ) : (
      part
    )
  );
}

interface Props {
  targetType: "novel" | "chapter";
  targetId: string;
  initialComments?: CommentView[];
  totalTopLevel?: number;
  totalAll?: number;
  hasMore?: boolean;
}

const sortOptions: { label: string; value: CommentSort }[] = [
  { label: "Top", value: "top" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Liked", value: "most_liked" },
];

export function CommentThread({
  targetType,
  targetId,
  initialComments,
  totalTopLevel = 0,
  totalAll = 0,
  hasMore: initialHasMore = false,
}: Props) {
  const [sort, setSort] = useState<CommentSort>("top");
  const [comments, setComments] = useState<CommentView[]>(initialComments ?? []);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadedTopLevel, setLoadedTopLevel] = useState(initialComments?.filter((c) => !c.parentId).length ?? 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [changingSort, setChangingSort] = useState(false);

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  const handlePosted = (comment: CommentView) => {
    setComments((prev) => [comment, ...prev]);
    if (!comment.parentId) setLoadedTopLevel((n) => n + 1);
  };
  const handleVoteUpdate = (id: string, up: number, down: number) =>
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, up, down } : c)));
  const handleEdited = (id: string, body: string, editedAt: string) =>
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, body, editedAt } : c)));

  const fetchPage = async (nextSort: CommentSort, offset: number) => {
    const params = new URLSearchParams({
      targetType,
      targetId,
      sort: nextSort,
      offset: String(offset),
      limit: "20",
    });
    const res = await fetch(`/api/comments?${params}`);
    if (!res.ok) return null;
    return res.json() as Promise<{ comments: CommentView[]; totalTopLevel: number; totalAll: number; hasMore: boolean }>;
  };

  const changeSort = async (next: CommentSort) => {
    if (next === sort) return;
    setSort(next);
    setChangingSort(true);
    const page = await fetchPage(next, 0);
    if (page) {
      setComments(page.comments);
      setLoadedTopLevel(page.comments.filter((c) => !c.parentId).length);
      setHasMore(page.hasMore);
    }
    setChangingSort(false);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const page = await fetchPage(sort, loadedTopLevel);
    if (page) {
      // Merge in new comments without duplicating any already-loaded ones.
      setComments((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        return [...prev, ...page.comments.filter((c) => !existingIds.has(c.id))];
      });
      setLoadedTopLevel((n) => n + page.comments.filter((c) => !c.parentId).length);
      setHasMore(page.hasMore);
    }
    setLoadingMore(false);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-text-primary">
          Comments <span className="font-normal text-text-muted">({totalAll || comments.length})</span>
        </p>
        <div className="flex gap-3 text-xs">
          {sortOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => changeSort(s.value)}
              className={s.value === sort ? "font-medium text-accent-highlight" : "text-text-muted"}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <CommentComposer targetType={targetType} targetId={targetId} onPosted={handlePosted} />

      <div className={cn("mt-4 space-y-3", changingSort && "opacity-50")}>
        {topLevel.length === 0 ? (
          <p className="rounded-card border border-border bg-surface p-3 text-sm text-text-muted">
            No comments yet — be the first to say something.
          </p>
        ) : (
          topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              repliesOf={repliesOf}
              targetType={targetType}
              targetId={targetId}
              onPosted={handlePosted}
              onVoteUpdate={handleVoteUpdate}
              onEdited={handleEdited}
            />
          ))
        )}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-4 w-full rounded-card border border-border py-2 text-xs text-text-secondary hover:border-border-hover disabled:opacity-50"
        >
          {loadingMore
            ? "Loading…"
            : `Load more comments (${totalTopLevel - loadedTopLevel} remaining)`}
        </button>
      )}
    </div>
  );
}

export function CommentComposer({
  targetType,
  targetId,
  onPosted,
  parentId = null,
  compact = false,
  onDone,
}: {
  targetType: "novel" | "chapter";
  targetId: string;
  onPosted: (c: CommentView) => void;
  parentId?: string | null;
  compact?: boolean;
  onDone?: () => void;
}) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [stickerPreview, setStickerPreview] = useState<string | null>(null);
  const [stickerUrl, setStickerUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Stickers must be under 2MB.");
      return;
    }

    setUploadError(null);
    setStickerPreview(URL.createObjectURL(file));
    setStickerUrl(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads/sticker", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setStickerUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeSticker = () => {
    setStickerPreview(null);
    setStickerUrl(null);
    setUploadError(null);
  };

  const submit = async () => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setPosting(true);
    const optimistic: CommentView = {
      id: `local-${Date.now()}`,
      author: session.user?.name || "You",
      body: text,
      up: 0,
      down: 0,
      stickerUrl: stickerUrl ?? undefined,
      parentId,
    };
    onPosted(optimistic);
    setText("");
    removeSticker();
    onDone?.();

    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          displayName: optimistic.author,
          body: optimistic.body,
          stickerUrl: optimistic.stickerUrl,
          isSpoiler: false,
          parentId,
        }),
      });
    } catch {
      // Optimistic comment already shown — real persistence needs MONGODB_URI configured.
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className={compact ? "" : "rounded-card border border-border bg-surface p-3"}>
      <AutoResizeTextarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={compact ? "Write a reply…" : "Join the discussion…"}
        rows={5}
        className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
      />

      {stickerPreview && (
        <div className="relative mt-2 w-fit">
          <img src={stickerPreview} alt="Sticker preview" className="h-16 w-16 rounded object-cover" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded bg-base/60">
              <Loader2 size={16} className="animate-spin text-text-primary" />
            </div>
          )}
          <button
            onClick={removeSticker}
            className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-error text-[9px] text-white"
            aria-label="Remove sticker"
          >
            ×
          </button>
        </div>
      )}
      {uploadError && <p className="mt-1 text-xs text-status-error">{uploadError}</p>}

      <div className="mt-2 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary">
          <ImageIcon size={14} />
          Upload sticker
          <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        </label>
        <div className="flex gap-2">
          {compact && onDone && (
            <button onClick={onDone} className="rounded px-2 py-1.5 text-xs text-text-muted">
              Cancel
            </button>
          )}
          <button
            onClick={submit}
            disabled={(!text && !stickerPreview) || uploading || posting}
            className="rounded bg-accent-highlight px-3 py-1.5 text-xs font-medium text-[#412402] disabled:opacity-40"
          >
            {posting ? "Posting…" : session ? "Post" : "Log in to post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommentItem({
  comment,
  repliesOf,
  targetType,
  targetId,
  onPosted,
  onVoteUpdate,
  onEdited,
  locked = false,
}: {
  comment: CommentView;
  repliesOf: (id: string) => CommentView[];
  targetType: "novel" | "chapter";
  targetId: string;
  onPosted: (c: CommentView) => void;
  onVoteUpdate: (id: string, up: number, down: number) => void;
  onEdited: (id: string, body: string, editedAt: string) => void;
  locked?: boolean;
}) {
  const { data: session } = useSession();
  const [revealed, setRevealed] = useState(!comment.isSpoiler);
  const [expanded, setExpanded] = useState(false);
  const [replying, setReplying] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [voting, setVoting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const replies = repliesOf(comment.id);
  const isLong = comment.body.length > 140;
  const displayBody = expanded || !isLong ? comment.body : comment.body.slice(0, 140) + "…";
  const isOwn = Boolean(session?.user && (session.user as { id?: string }).id === comment.authorId);

  const saveEdit = async () => {
    const trimmed = editBody.trim();
    if (!trimmed || savingEdit) return;
    setSavingEdit(true);
    setEditError("");
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save edit");
      onEdited(comment.id, trimmed, data.editedAt);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Couldn't save edit");
    } finally {
      setSavingEdit(false);
    }
  };

  const vote = async (direction: "up" | "down") => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    if (voting) return;
    setVoting(true);
    // Optimistic bump so it feels instant even before the request resolves.
    onVoteUpdate(comment.id, direction === "up" ? comment.up + 1 : comment.up, direction === "down" ? comment.down + 1 : comment.down);
    try {
      const res = await fetch(`/api/comments/${comment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (res.ok) {
        const data = await res.json();
        onVoteUpdate(comment.id, data.up, data.down);
      }
    } catch {
      // leave optimistic value in place
    } finally {
      setVoting(false);
    }
  };

  return (
    <div id={`comment-${comment.id}`} className="scroll-mt-20">
      <div className="rounded-card border border-border bg-surface p-3">
        <div className="mb-1.5 flex items-center gap-2 text-xs text-text-muted">
          <div className="h-6 w-6 rounded-full bg-card" />
          <span className="text-text-secondary">{comment.author}</span>
          {comment.createdAt && (
            <>
              <span className="text-text-disabled">·</span>
              <span suppressHydrationWarning title={new Date(comment.createdAt).toLocaleString()}>
                {timeAgo(comment.createdAt)}
              </span>
            </>
          )}
          {comment.editedAt && (
            <span suppressHydrationWarning title={new Date(comment.editedAt).toLocaleString()}>
              · Edited {timeAgo(comment.editedAt)}
            </span>
          )}
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="rounded bg-status-warning/15 px-2 py-1 text-[11px] text-status-warning"
          >
            <Eye size={11} className="mr-1 inline" /> Spoiler — tap to reveal
          </button>
        ) : editing ? (
          <div>
            <AutoResizeTextarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              className="w-full rounded border border-border bg-card px-2.5 py-2 text-sm text-text-primary focus:outline-none"
            />
            {editError && <p className="mt-1 text-xs text-status-error">{editError}</p>}
            <div className="mt-1.5 flex gap-2">
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="flex items-center gap-1 rounded bg-accent-highlight px-2.5 py-1 text-xs font-medium text-[#412402] disabled:opacity-60"
              >
                <Check size={12} /> Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditBody(comment.body);
                  setEditError("");
                }}
                className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-text-secondary"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {comment.body && <p className="text-sm text-text-secondary">{renderWithMentions(displayBody)}</p>}
            {isLong && (
              <button onClick={() => setExpanded((v) => !v)} className="mt-1 text-xs text-accent">
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
            {comment.stickerUrl && (
              <img src={comment.stickerUrl} alt="Sticker" className="mt-2 h-16 w-16 rounded object-cover" />
            )}
          </>
        )}

        <div className="mt-2 flex items-center gap-4 text-text-muted">
          <button onClick={() => vote("up")} className="flex items-center gap-1 text-xs hover:text-status-success">
            <ThumbsUp size={13} /> {comment.up}
          </button>
          <button onClick={() => vote("down")} className="flex items-center gap-1 text-xs hover:text-status-error">
            <ThumbsDown size={13} /> {comment.down}
          </button>
          {!locked && (
            <button
              onClick={() => setReplying((v) => !v)}
              className="flex items-center gap-1 text-xs hover:text-text-secondary"
            >
              <MessageCircle size={13} /> Reply
            </button>
          )}
          {isOwn && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs hover:text-text-secondary"
            >
              <Pencil size={12} /> Edit
            </button>
          )}
          <button onClick={() => setReportOpen(true)} className="ml-auto hover:text-status-error" aria-label="Report">
            <Flag size={13} />
          </button>
        </div>

        {!locked && replying && (
          <div className="mt-2">
            <CommentComposer
              targetType={targetType}
              targetId={targetId}
              onPosted={onPosted}
              parentId={comment.id}
              compact
              onDone={() => setReplying(false)}
            />
          </div>
        )}
      </div>

      {(showAllReplies ? replies : replies.slice(0, 3)).map((r) => (
        <div key={r.id} className="ml-6 mt-2 border-l border-border pl-3">
          <CommentItem
            comment={r}
            repliesOf={repliesOf}
            targetType={targetType}
            targetId={targetId}
            onPosted={onPosted}
            onVoteUpdate={onVoteUpdate}
            onEdited={onEdited}
            locked={locked}
          />
        </div>
      ))}
      {!showAllReplies && replies.length > 3 && (
        <button
          onClick={() => setShowAllReplies(true)}
          className="ml-6 mt-2 border-l border-border pl-3 text-xs text-accent-highlight"
        >
          View {replies.length - 3} more repl{replies.length - 3 === 1 ? "y" : "ies"}
        </button>
      )}

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="comment"
        targetId={comment.id}
        targetLabel={comment.body.slice(0, 60)}
      />
    </div>
  );
}
