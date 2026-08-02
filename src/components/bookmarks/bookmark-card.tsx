"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, List, Heart, FolderInput, Trash2 } from "lucide-react";
import { ProgressBar } from "@/components/novel/progress-bar";
import { cn, timeAgo } from "@/lib/utils";
import type { DemoNovel } from "@/lib/seed-data";

export function BookmarkCard({
  novel,
  chapter,
  total,
  updatedAt,
  folderId,
  folders,
  onRemoved,
  onFolderChanged,
}: {
  novel: DemoNovel;
  chapter: number;
  total: number;
  updatedAt: Date;
  folderId?: string | null;
  folders: { id: string; name: string }[];
  onRemoved?: () => void;
  onFolderChanged?: (folderId: string | null) => void;
}) {
  const [favorited, setFavorited] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const isCompleted = chapter >= total;
  const currentFolder = folders.find((f) => f.id === folderId);

  const toggleFavorite = async () => {
    const next = !favorited;
    setFavorited(next);
    try {
      await fetch(`/api/favorites/${novel.slug}`, { method: next ? "POST" : "DELETE" });
    } catch {
      setFavorited(!next);
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`/api/bookmarks/${novel.slug}`, { method: "DELETE" });
      if (res.ok) onRemoved?.();
    } finally {
      setRemoving(false);
    }
  };

  const assignFolder = async (id: string | null) => {
    setFolderOpen(false);
    try {
      await fetch(`/api/bookmarks/${novel.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: id }),
      });
      onFolderChanged?.(id);
    } catch {
      // leave as-is on failure
    }
  };

  return (
    <div className={cn("flex gap-3 rounded-card bg-surface p-3 transition-opacity", removing && "opacity-40")}>
      <div className="relative h-[76px] w-[52px] shrink-0 overflow-hidden rounded bg-card">
        {novel.cover && <Image src={novel.cover} alt={novel.title} fill sizes="52px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm text-text-primary">{novel.title}</p>
          <span
            className={cn(
              "shrink-0 rounded px-1.5 py-0.5 text-[9px]",
              isCompleted ? "bg-card text-status-success" : "bg-card text-status-special"
            )}
          >
            {isCompleted ? "Completed" : `Updated ${timeAgo(updatedAt)}`}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-text-muted">{novel.genres.join(" · ")}</p>
        {currentFolder && (
          <span className="mt-1 inline-block rounded-full bg-accent-highlight/15 px-2 py-0.5 text-[10px] font-medium text-accent-highlight">
            📁 {currentFolder.name}
          </span>
        )}
        <p className="mt-0.5 text-[10px] text-text-disabled">Ch.{chapter}</p>
        <div className="my-2">
          <ProgressBar current={chapter} total={total} color="#D4A35F" />
        </div>
        <div className="flex items-center gap-3 text-text-muted">
          <Link href={`/novel/${novel.slug}/chapter/${chapter}`} aria-label="Continue reading">
            <Play size={14} />
          </Link>
          <Link href={`/novel/${novel.slug}`} aria-label="Chapter list">
            <List size={14} />
          </Link>
          <button
            onClick={toggleFavorite}
            aria-label="Toggle favorite"
            className={favorited ? "text-status-error" : ""}
          >
            <Heart size={14} className={favorited ? "fill-current" : ""} />
          </button>
          <div className="relative">
            <button onClick={() => setFolderOpen((v) => !v)} aria-label="Move to folder">
              <FolderInput size={14} className={folderId ? "text-accent-highlight" : ""} />
            </button>
            {folderOpen && (
              <div className="glass absolute bottom-6 left-0 z-20 w-36 rounded-card p-1.5 shadow-2xl">
                <button
                  onClick={() => assignFolder(null)}
                  className={cn(
                    "block w-full rounded px-2 py-1 text-left text-[11px] hover:bg-card/60",
                    !folderId ? "text-accent-highlight" : "text-text-secondary"
                  )}
                >
                  No folder
                </button>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => assignFolder(f.id)}
                    className={cn(
                      "block w-full truncate rounded px-2 py-1 text-left text-[11px] hover:bg-card/60",
                      folderId === f.id ? "text-accent-highlight" : "text-text-secondary"
                    )}
                  >
                    {f.name}
                  </button>
                ))}
                {folders.length === 0 && (
                  <p className="px-2 py-1 text-[10px] text-text-disabled">No folders yet</p>
                )}
              </div>
            )}
          </div>
          <button onClick={remove} disabled={removing} aria-label="Remove bookmark" className="ml-auto hover:text-status-error disabled:opacity-40">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
