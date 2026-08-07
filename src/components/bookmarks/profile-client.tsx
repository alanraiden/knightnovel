"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, SlidersHorizontal, MessageCircle } from "lucide-react";
import { ReadingStats } from "@/components/bookmarks/reading-stats";
import { ContinueReadingRow, ContinueReadingHighlight } from "@/components/bookmarks/continue-reading";
import { BookmarkCard } from "@/components/bookmarks/bookmark-card";
import { NovelCard } from "@/components/novel/novel-card";
import { FolderManagerModal } from "@/components/bookmarks/folder-manager-modal";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { ProfileFieldsEditor } from "@/components/profile/profile-fields-editor";
import { cn, timeAgo } from "@/lib/utils";
import type { DashboardBookmark, DashboardData, UserCommentView, EditableProfile, NotificationSettings } from "@/lib/queries";

const filterTabs = ["All", "Reading", "Completed", "Paused", "Favorites"] as const;
const sortOptions = ["Recently read", "Title A-Z", "Progress"] as const;

export function ProfileClient({
  data,
  myComments,
  editableProfile,
  initialNotificationSettings,
}: {
  data: DashboardData;
  myComments: UserCommentView[];
  editableProfile: EditableProfile | null;
  initialNotificationSettings: NotificationSettings | null;
}) {
  const { data: session, status, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<(typeof filterTabs)[number]>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("Recently read");
  const [sortOpen, setSortOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [commentsShown, setCommentsShown] = useState(10);

  const [bookmarks, setBookmarks] = useState<DashboardBookmark[]>(data.bookmarks);
  const [folders, setFolders] = useState(data.folders);

  const filtered = useMemo(() => {
    let list = bookmarks.filter((b) => {
      if (query && !b.novel.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (activeTab === "Completed") return b.chapter >= b.total;
      if (activeTab === "Reading") return b.chapter < b.total;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "Title A-Z") return a.novel.title.localeCompare(b.novel.title);
      if (sort === "Progress") return b.chapter / b.total - a.chapter / a.total;
      return b.updatedAt.getTime() - a.updatedAt.getTime(); // Recently read
    });

    return list;
  }, [bookmarks, query, activeTab, sort]);

  const removeBookmark = (slug: string) => setBookmarks((prev) => prev.filter((b) => b.novel.slug !== slug));
  const changeFolder = (slug: string, folderId: string | null) => {
    setBookmarks((prev) => prev.map((b) => (b.novel.slug === slug ? { ...b, folderId } : b)));
    // The BookmarkCard's own inline folder picker already PATCHes directly,
    // but the FolderManagerModal calls this function instead — it was only
    // ever updating local state, never actually saving, so a refresh
    // silently reverted the change. Fixed by persisting here too.
    fetch(`/api/bookmarks/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    }).catch(() => {
      // best-effort — if this fails the optimistic UI is already wrong,
      // but there's nothing more useful to do than let the next load fix it
    });
  };

  const createFolder = async (name: string) => {
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) setFolders((prev) => [...prev, { id: data.id, name: data.name }]);
    } catch {
      // silently ignore — modal stays open, user can retry
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-text-primary">Profile</h1>
        {status !== "loading" &&
          (session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded border border-border px-3 py-1.5 text-xs text-status-error hover:border-status-error"
            >
              Log out
            </button>
          ) : (
            <Link href="/login" className="rounded bg-accent-highlight px-3 py-1.5 text-xs font-medium text-[#412402]">
              Log in
            </Link>
          ))}
      </div>

      {session && (
        <div className="space-y-4">
          <AvatarUploader
            currentUrl={session.user?.image}
            onUploaded={(url) => updateSession({ image: url })}
          />
          {editableProfile && initialNotificationSettings && (
            <ProfileFieldsEditor
              initialProfile={editableProfile}
              initialNotificationSettings={initialNotificationSettings}
              currentName={session.user?.name ?? ""}
              onNameSaved={(name) => updateSession({ name })}
            />
          )}
        </div>
      )}

      {!session && status !== "loading" && (
        <div className="rounded-card border border-border-hover bg-surface px-3 py-2 text-xs text-text-secondary">
          You&apos;re viewing sample data.{" "}
          <Link href="/login" className="text-accent">
            Log in
          </Link>{" "}
          to see your real library.
        </div>
      )}

      <ReadingStats stats={data.stats} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded border border-border bg-surface px-3 py-2">
          <Search size={15} className="text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded border border-border bg-surface px-3 py-2 text-sm text-text-secondary"
          >
            <SlidersHorizontal size={14} /> {sort}
          </button>
          {sortOpen && (
            <div className="glass absolute right-0 z-20 mt-1 w-40 rounded-card p-1.5 shadow-2xl">
              {sortOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    setSortOpen(false);
                  }}
                  className={cn(
                    "block w-full rounded px-2 py-1.5 text-left text-xs",
                    s === sort ? "text-accent" : "text-text-secondary hover:bg-card/60"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setFolderModalOpen(true)}
          className="rounded border border-border bg-surface px-3 py-2 text-sm text-text-secondary"
        >
          📁 Folders
        </button>
      </div>

      <div className="themed-scroll flex gap-2 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs",
              activeTab === tab ? "bg-accent-highlight text-[#412402]" : "border border-border text-text-secondary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <section>
        <p className="mb-3 text-sm font-medium text-text-primary">Continue reading</p>
        <ContinueReadingRow items={data.continueReading} />
        <div className="mt-4">
          <ContinueReadingHighlight items={data.continueReading} />
        </div>
      </section>

      <section>
        <p className="mb-3 text-sm font-medium text-text-primary">Bookmarks</p>
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-muted">No bookmarks match this view.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((b) => (
              <BookmarkCard
                key={b.novel.slug}
                {...b}
                folders={folders}
                onRemoved={() => removeBookmark(b.novel.slug)}
                onFolderChanged={(folderId) => changeFolder(b.novel.slug, folderId)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-3 text-sm font-medium text-text-primary">Comments & replies</p>
        {myComments.length === 0 ? (
          <p className="rounded-card border border-border bg-surface p-3 text-sm text-text-muted">
            You haven&apos;t commented on anything yet.
          </p>
        ) : (
          <div className="space-y-2">
            {myComments.slice(0, commentsShown).map((c) => (
              <Link
                key={c.id}
                href={`/novel/${c.novelSlug}#comment-${c.id}`}
                className="block rounded-card border border-border bg-surface p-3 hover:border-border-hover"
              >
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <MessageCircle size={12} />
                  {c.context}
                  <span className="ml-auto text-text-disabled">{timeAgo(c.timeAgo)}</span>
                </div>
                <p className="mt-1.5 text-sm text-text-secondary">You: &quot;{c.body}&quot;</p>
                {c.reply && (
                  <p className="mt-1 text-sm text-text-primary">
                    {c.reply.author} replied: &quot;{c.reply.body}&quot;
                  </p>
                )}
              </Link>
            ))}
            {commentsShown < myComments.length && (
              <button
                onClick={() => setCommentsShown((n) => n + 10)}
                className="w-full rounded-card border border-border py-2 text-xs text-text-secondary hover:border-border-hover"
              >
                Load more ({myComments.length - commentsShown} remaining)
              </button>
            )}
          </div>
        )}
      </section>

      <section>
        <p className="mb-3 text-sm font-medium text-text-primary">You might also like</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {data.recommendations.map((n) => (
            <NovelCard key={n.slug} novel={n} />
          ))}
        </div>
      </section>

      <FolderManagerModal
        open={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        folders={folders}
        bookmarks={bookmarks}
        onCreateFolder={createFolder}
        onAssignFolder={changeFolder}
      />
    </div>
  );
}
