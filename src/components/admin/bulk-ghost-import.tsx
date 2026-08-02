"use client";

import { useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import {
  parseGhostImportText,
  assignTimestamps,
  flattenThreads,
  type ParsedComment,
} from "@/lib/ghost-import-parser";

const EXAMPLE = `Title: What did you think of the ending?
Category: Discussion
Username: Alan
Time: 2 hours ago
Comment: This chapter was incredible!

Reply:
  Username: ShadowReader
  Time: 1 hour ago
  Comment: I completely agree.

Reply:
  Username: NovelFan
  Time: 45 minutes ago
  Comment: The ending surprised me.

---

Title: Anyone else catch this detail?
Category: Theory
Username: Luna
Time: 30 minutes ago
Comment: Can't wait for the next chapter!`;

export function BulkGhostImport({
  novelSlug,
  chapterId,
}: {
  novelSlug: string;
  chapterId: string;
}) {
  const [text, setText] = useState("");
  const [threads, setThreads] = useState<ParsedComment[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const parse = () => {
    const parsed = parseGhostImportText(text);
    assignTimestamps(parsed);
    setThreads(parsed);
    setResult(null);
  };

  const removeNode = (targetId: string) => {
    if (!threads) return;
    function filterTree(nodes: ParsedComment[]): ParsedComment[] {
      return nodes
        .filter((n) => n.id !== targetId)
        .map((n) => ({ ...n, replies: filterTree(n.replies) }));
    }
    setThreads(filterTree(threads));
  };

  const editNode = (targetId: string, field: "username" | "comment" | "title" | "category", value: string) => {
    if (!threads) return;
    function updateTree(nodes: ParsedComment[]): ParsedComment[] {
      return nodes.map((n) =>
        n.id === targetId ? { ...n, [field]: value } : { ...n, replies: updateTree(n.replies) }
      );
    }
    setThreads(updateTree(threads));
  };

  const confirmImport = async () => {
    if (!threads || threads.length === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const items = flattenThreads(threads);
      const res = await fetch("/api/admin/ghost-comments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelSlug, chapterId: chapterId || undefined, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed.");
      setResult({ type: "ok", text: `Imported ${data.inserted} comments.` });
      setThreads(null);
      setText("");
    } catch (err) {
      setResult({ type: "error", text: err instanceof Error ? err.message : "Import failed." });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-xs text-text-secondary">
          Paste formatted comments{" "}
          <span className="text-text-disabled">
            — add optional "Title:" / "Category:" lines above a root comment if you want it to
            appear as a proper Community discussion (only used when posting to the novel page,
            ignored for chapter comments)
          </span>
        </label>
        <button onClick={() => setText(EXAMPLE)} className="text-[11px] text-accent">
          Fill example
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder={EXAMPLE}
        className="w-full rounded border border-border bg-surface px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-disabled"
      />
      <button
        onClick={parse}
        disabled={!text.trim()}
        className="mt-2 flex items-center gap-1.5 rounded bg-accent-highlight px-3 py-1.5 text-xs font-medium text-[#412402] disabled:opacity-40"
      >
        <RefreshCw size={13} /> Parse & preview
      </button>

      {threads && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-text-primary">
            Preview — {flattenThreads(threads).length} comment{flattenThreads(threads).length === 1 ? "" : "s"}
          </p>
          {threads.length === 0 ? (
            <p className="text-xs text-text-muted">
              Nothing parsed — check the format matches the example (Username / Time / Comment fields,
              "Reply:" for nested replies, "---" between separate threads).
            </p>
          ) : (
            <div className="space-y-3">
              {threads.map((t) => (
                <PreviewNode key={t.id} node={t} onRemove={removeNode} onEdit={editNode} />
              ))}
            </div>
          )}

          {threads.length > 0 && (
            <button
              onClick={confirmImport}
              disabled={importing}
              className="mt-4 rounded bg-accent-highlight px-4 py-2 text-sm font-medium text-[#412402] disabled:opacity-40"
            >
              {importing ? "Importing…" : `Confirm import (${flattenThreads(threads).length})`}
            </button>
          )}
        </div>
      )}

      {result && (
        <p className={`mt-3 text-xs ${result.type === "ok" ? "text-status-success" : "text-status-error"}`}>
          {result.text}
        </p>
      )}
    </div>
  );
}

function PreviewNode({
  node,
  onRemove,
  onEdit,
  depth = 0,
}: {
  node: ParsedComment;
  onRemove: (id: string) => void;
  onEdit: (id: string, field: "username" | "comment" | "title" | "category", value: string) => void;
  depth?: number;
}) {
  return (
    <div className={depth > 0 ? "ml-6 border-l border-border pl-3" : ""}>
      <div className="rounded-card border border-border bg-surface p-2.5">
        {depth === 0 && (
          <div className="mb-2 flex gap-2">
            <input
              value={node.title ?? ""}
              onChange={(e) => onEdit(node.id, "title", e.target.value)}
              placeholder="Discussion title (optional)"
              className="flex-1 rounded border border-border bg-card px-1.5 py-1 text-xs text-text-primary placeholder:text-text-disabled"
            />
            <input
              value={node.category ?? ""}
              onChange={(e) => onEdit(node.id, "category", e.target.value)}
              placeholder="Category"
              className="w-28 rounded border border-border bg-card px-1.5 py-1 text-xs text-text-primary placeholder:text-text-disabled"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={node.username}
            onChange={(e) => onEdit(node.id, "username", e.target.value)}
            className="w-32 rounded border border-border bg-card px-1.5 py-1 text-xs text-text-primary"
          />
          <span className="text-[10px] text-text-disabled">
            {node.resolvedDate.toLocaleString()}
          </span>
          <button
            onClick={() => onRemove(node.id)}
            aria-label="Remove comment"
            className="ml-auto text-status-error"
          >
            <Trash2 size={13} />
          </button>
        </div>
        <textarea
          value={node.comment}
          onChange={(e) => onEdit(node.id, "comment", e.target.value)}
          rows={2}
          className="mt-1.5 w-full rounded border border-border bg-card px-1.5 py-1 text-xs text-text-secondary"
        />
      </div>
      {node.replies.map((r) => (
        <div key={r.id} className="mt-2">
          <PreviewNode node={r} onRemove={onRemove} onEdit={onEdit} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}
