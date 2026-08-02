"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Modal } from "@/components/shared/modal";
import { ProgressBar } from "@/components/novel/progress-bar";
import { timeAgo } from "@/lib/utils";
import type { DashboardBookmark } from "@/lib/queries";

export function FolderManagerModal({
  open,
  onClose,
  folders,
  bookmarks,
  onCreateFolder,
  onAssignFolder,
}: {
  open: boolean;
  onClose: () => void;
  folders: { id: string; name: string }[];
  bookmarks: DashboardBookmark[];
  onCreateFolder: (name: string) => Promise<void>;
  onAssignFolder: (novelSlug: string, folderId: string | null) => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);
  const [addingNovel, setAddingNovel] = useState(false);

  const close = () => {
    setSelectedFolder(null);
    setAddingNovel(false);
    onClose();
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreating(true);
    await onCreateFolder(newFolderName.trim());
    setNewFolderName("");
    setCreating(false);
  };

  const folder = folders.find((f) => f.id === selectedFolder);
  const novelsInFolder = bookmarks.filter((b) => b.folderId === selectedFolder);
  const novelsNotInFolder = bookmarks.filter((b) => b.folderId !== selectedFolder);

  // ---- Detail view: one folder's novels ----
  if (folder) {
    return (
      <Modal open={open} onClose={close} title="">
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedFolder(null);
              setAddingNovel(false);
            }}
            aria-label="Back to folders"
            className="text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <p className="flex-1 truncate text-sm font-medium text-text-primary">📁 {folder.name}</p>
          <button
            onClick={() => setAddingNovel((v) => !v)}
            aria-label="Add novel to folder"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-highlight text-[#412402]"
          >
            <Plus size={14} />
          </button>
        </div>

        {addingNovel && (
          <div className="mb-3 max-h-40 overflow-y-auto rounded-card border border-border bg-surface p-1.5 themed-scroll">
            {novelsNotInFolder.length === 0 ? (
              <p className="p-2 text-xs text-text-muted">All your bookmarked novels are already in this folder.</p>
            ) : (
              novelsNotInFolder.map((b) => (
                <button
                  key={b.novel.slug}
                  onClick={() => onAssignFolder(b.novel.slug, folder.id)}
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs text-text-secondary hover:bg-card"
                >
                  {b.novel.title}
                  <span className="text-accent-highlight">+ Add</span>
                </button>
              ))
            )}
          </div>
        )}

        <div className="max-h-80 space-y-2 overflow-y-auto themed-scroll">
          {novelsInFolder.length === 0 ? (
            <p className="rounded-card border border-border bg-surface p-3 text-center text-xs text-text-muted">
              No novels in this folder yet — tap + to add some.
            </p>
          ) : (
            novelsInFolder.map((b) => (
              <div key={b.novel.slug} className="flex gap-2.5 rounded-card bg-surface p-2">
                <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-card">
                  {b.novel.cover && (
                    <Image src={b.novel.cover} alt={b.novel.title} fill sizes="44px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/novel/${b.novel.slug}`} className="block truncate text-xs text-text-primary hover:text-accent-highlight">
                    {b.novel.title}
                  </Link>
                  <p className="mt-0.5 text-[10px] text-text-muted">
                    Ch.{b.chapter} · Last read {timeAgo(b.updatedAt)}
                  </p>
                  <div className="mt-1">
                    <ProgressBar current={b.chapter} total={b.total} color="#D4A35F" />
                  </div>
                </div>
                <button
                  onClick={() => onAssignFolder(b.novel.slug, null)}
                  aria-label="Remove from folder"
                  className="self-start text-text-muted hover:text-status-error"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>
    );
  }

  // ---- List view: all folders ----
  return (
    <Modal open={open} onClose={close} title="Folders">
      <div className="space-y-1">
        {folders.length === 0 ? (
          <p className="rounded-card border border-border bg-surface p-3 text-xs text-text-muted">
            No folders yet — create one below to start organizing your library.
          </p>
        ) : (
          folders.map((f) => {
            const count = bookmarks.filter((b) => b.folderId === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFolder(f.id)}
                className="flex w-full items-center justify-between rounded px-2.5 py-2 text-sm text-text-secondary hover:bg-card"
              >
                <span>📁 {f.name}</span>
                <span className="text-xs text-text-muted">{count}</span>
              </button>
            );
          })
        )}
      </div>
      <div className="mt-3 flex gap-2 border-t border-border pt-3">
        <input
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
          className="flex-1 rounded border border-border bg-card px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted"
        />
        <button
          onClick={createFolder}
          disabled={!newFolderName.trim() || creating}
          className="flex items-center gap-1 rounded bg-accent-highlight px-2.5 py-1.5 text-xs font-medium text-[#412402] disabled:opacity-40"
        >
          <Plus size={13} /> Add
        </button>
      </div>
    </Modal>
  );
}
