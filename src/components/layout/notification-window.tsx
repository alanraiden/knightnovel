"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "reply" | "mention" | "chapter_update" | "announcement";
  text?: string;
  originalComment?: string;
  replyAuthor?: string;
  replyBody?: string;
  createdAt: string;
  link?: string;
  isRead: boolean;
  thumbnailUrl?: string;
}

export function NotificationWindow({ initialUnreadCount }: { initialUnreadCount: number }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open || !session) return;
    if (items === null) {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => setItems(data.notifications ?? []))
        .catch(() => setItems([]));
    }
    // Clear the badge as soon as they open it — matches the read state
    // being persisted server-side via the same request.
    if (unreadCount > 0) {
      setUnreadCount(0);
      fetch("/api/notifications/read", { method: "POST" }).catch(() => {});
    }
  }, [open, session, items, unreadCount]);

  if (!session) return null; // nothing to notify a logged-out visitor about

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="relative text-text-secondary transition-colors hover:text-text-primary"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-status-error ring-2 ring-base" />
        )}
      </button>

      {open && (
        <div className="glass absolute right-0 z-50 mt-3 w-[320px] rounded-card p-3 shadow-2xl animate-slide-up">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">Notifications</p>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto themed-scroll">
            {items === null ? (
              <p className="p-2 text-xs text-text-muted">Loading…</p>
            ) : items.length === 0 ? (
              <p className="p-2 text-xs text-text-muted">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2.5 rounded-card bg-card/60 p-2.5 text-xs hover:bg-card"
                >
                  {n.type === "chapter_update" && n.thumbnailUrl && (
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded">
                      <Image src={n.thumbnailUrl} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {n.type === "reply" || n.type === "mention" ? (
                      <div>
                        {n.type === "reply" && n.originalComment && (
                          <>
                            <p className="text-text-muted">You commented:</p>
                            <p className="text-text-secondary">&quot;{n.originalComment}&quot;</p>
                            <div className="my-1.5 border-t border-border/60" />
                          </>
                        )}
                        <p className="text-text-muted">
                          {n.replyAuthor} {n.type === "mention" ? "mentioned you:" : "replied:"}
                        </p>
                        <p className="text-text-primary">&quot;{n.replyBody}&quot;</p>
                      </div>
                    ) : (
                      <p className="text-text-secondary">{n.text}</p>
                    )}
                    <p className="mt-1.5 text-[10px] text-text-disabled">{timeAgo(n.createdAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
