import Link from "next/link";
import { getAdminOverviewData, type AdminOverviewData } from "@/lib/queries";
import { NewNovelButton } from "@/components/admin/new-novel-button";
import { AnalyticsToggle } from "@/components/admin/analytics-toggle";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <div
      className={`rounded-card border bg-surface p-4 transition-colors ${
        href
          ? "cursor-pointer border-border hover:border-border-hover hover:bg-card"
          : "border-border"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p
        className={`mt-1.5 text-2xl font-semibold tabular-nums ${
          accent ? "text-status-warning" : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
      {children}
    </h2>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-status-error/30 bg-surface p-6 text-sm text-status-error">
      {message}
    </div>
  );
}

async function DashboardContent() {
  let data: AdminOverviewData;
  try {
    data = await getAdminOverviewData();
  } catch (err) {
    console.error("[kn-x9b4] overview error:", err);
    return (
      <ErrorState message="Could not load dashboard data. Check your MongoDB connection and server logs." />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stat Cards */}
      <section>
        <SectionHeading>Site Totals</SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total Novels" value={fmt(data.totalNovels)} href="/kn-x9b4/novels" />
          <StatCard label="Total Chapters" value={fmt(data.totalChapters)} />
          <StatCard label="Registered Users" value={fmt(data.totalUsers)} />
          <StatCard label="Visible Comments" value={fmt(data.totalComments)} />
          <StatCard
            label="Moderation Queue"
            value={data.pendingReports}
            href="/kn-x9b4/moderation"
            accent={data.pendingReports > 0}
          />
        </div>
      </section>

      {/* Analytics */}
      <section>
        <SectionHeading>Analytics</SectionHeading>
        <AnalyticsToggle analytics={data.analytics} />
      </section>

      {/* Two-column: Most Active Novels + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Most Active Novels */}
        <section>
          <SectionHeading>Most Active Novels</SectionHeading>
          <div className="overflow-hidden rounded-card border border-border bg-surface">
            {data.mostActiveNovels.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.mostActiveNovels.map((novel, i) => (
                  <li key={novel.slug}>
                    <Link
                      href={`/kn-x9b4/novels/${novel.slug}/edit`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-card"
                    >
                      <span className="w-4 shrink-0 text-right text-xs font-medium text-text-disabled">
                        {i + 1}
                      </span>
                      {novel.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={novel.cover}
                          alt=""
                          className="h-10 w-7 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-7 shrink-0 rounded bg-card" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-text-primary">{novel.title}</p>
                        <p className="text-xs text-text-muted">
                          {novel.discussionCount} comment
                          {novel.discussionCount !== 1 ? "s" : ""} · {novel.viewsFormatted} views
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <SectionHeading>Recent Activity</SectionHeading>
          <div className="overflow-hidden rounded-card border border-border bg-surface">
            {data.recentActivity.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">No recent activity.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentActivity.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-primary">
                          {item.author}
                          {item.isReply && (
                            <span className="ml-1.5 rounded bg-card px-1.5 py-0.5 text-[10px] text-text-muted">
                              reply
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                          {item.body}
                        </p>
                        {item.novelTitle && (
                          <p className="mt-1 text-[10px] text-text-muted">{item.novelTitle}</p>
                        )}
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-[10px] text-text-disabled">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section>
        <SectionHeading>Quick Actions</SectionHeading>
        <div className="flex flex-wrap gap-3">
          <NewNovelButton />
          <Link
            href="/kn-x9b4/novels"
            className="rounded border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
          >
            Manage Novels
          </Link>
          <Link
            href="/kn-x9b4/moderation"
            className="rounded border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
          >
            Manage Reports
            {data.pendingReports > 0 && (
              <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-status-warning px-1 text-[10px] font-semibold text-base">
                {data.pendingReports}
              </span>
            )}
          </Link>
          <Link
            href="/kn-x9b4/featured"
            className="rounded border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
          >
            Featured Novels
          </Link>
          <Link
            href="/kn-x9b4/announcements"
            className="rounded border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
          >
            Announcements
          </Link>
          <Link
            href="/kn-x9b4/analytics"
            className="rounded border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
          >
            Analytics
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-text-primary">Overview</h1>
        <p className="mt-0.5 text-xs text-text-muted">At-a-glance summary of Knight Novel.</p>
      </div>
      <DashboardContent />
    </div>
  );
}
