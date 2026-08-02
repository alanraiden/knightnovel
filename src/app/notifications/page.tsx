import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/queries";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const items = userId ? await getNotificationsForUser(userId, 50) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-lg font-medium text-text-primary">Notifications</h1>

      {!session ? (
        <p className="text-sm text-text-muted">Log in to see your notifications.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-text-muted">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n.id} className="rounded-card border border-border bg-surface p-3 text-sm">
              {n.type === "reply" ? (
                <div>
                  {n.originalComment && (
                    <>
                      <p className="text-xs text-text-muted">You commented:</p>
                      <p className="text-text-secondary">&quot;{n.originalComment}&quot;</p>
                      <div className="my-2 border-t border-border" />
                    </>
                  )}
                  <p className="text-xs text-text-muted">{n.replyAuthor} replied:</p>
                  <p className="text-text-primary">&quot;{n.replyBody}&quot;</p>
                  {n.link && (
                    <a href={n.link} className="mt-2 inline-block text-xs text-accent">
                      View Discussion →
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-text-secondary">{n.text}</p>
              )}
              <p className="mt-2 text-[10px] text-text-disabled">{timeAgo(n.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
