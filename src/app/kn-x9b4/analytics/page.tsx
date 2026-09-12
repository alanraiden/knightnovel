import {
  getAdminOverviewData,
  getNovelListForAnalytics,
  getNovelAnalytics,
} from "@/lib/queries";
import { NovelSelector, NovelAnalyticsPanel } from "@/components/admin/novel-analytics-panel";
import { AnalyticsToggle } from "@/components/admin/analytics-toggle";

// ---------- helpers ----------------------------------------------------------

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
      {children}
    </h2>
  );
}

// ---------- page -------------------------------------------------------------

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { novel?: string };
}) {
  const selectedSlug = searchParams.novel ?? null;

  let overviewData;
  try {
    overviewData = await getAdminOverviewData();
  } catch {
    return (
      <div className="rounded-card border border-status-error/30 bg-surface p-6 text-sm text-status-error">
        Could not load analytics. Check your MongoDB connection and server logs.
      </div>
    );
  }

  // Fail gracefully — treat DB errors on these as empty / not-found.
  const [novelList, selectedNovel] = await Promise.all([
    getNovelListForAnalytics().catch(() => [] as { slug: string; title: string }[]),
    selectedSlug ? getNovelAnalytics(selectedSlug).catch(() => null) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Analytics</h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Site-wide metrics and per-novel breakdowns.{" "}
          <span className="text-text-disabled">
            Weekly/Monthly view counters are rolling totals reset by a cron job.
          </span>
        </p>
      </div>

      {/* ── Site-wide totals ── */}
      <section>
        <SectionHeading>All-time totals</SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Novels", value: fmt(overviewData.totalNovels) },
            { label: "Chapters", value: fmt(overviewData.totalChapters) },
            { label: "Users", value: fmt(overviewData.totalUsers) },
            { label: "Comments", value: fmt(overviewData.totalComments) },
          ].map((m) => (
            <div key={m.label} className="rounded-card border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {m.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-text-primary">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Period analytics ── */}
      <section>
        <SectionHeading>Period analytics</SectionHeading>
        <AnalyticsToggle analytics={overviewData.analytics} />
      </section>

      {/* ── Per-novel analytics ── */}
      <section>
        <SectionHeading>Per-novel breakdown</SectionHeading>

        {novelList.length === 0 ? (
          <p className="rounded-card border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
            No novels in the database yet.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Client-side searchable novel selector.
                URL-driven selection (?novel=slug) is preserved — NovelSelector
                calls router.push() on pick so the server re-renders with full
                novel data fetched server-side. */}
            <NovelSelector novels={novelList} selectedSlug={selectedSlug} />

            {/* No novel selected */}
            {!selectedSlug && (
              <p className="rounded-card border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-text-muted">
                Select a novel above to see its detailed analytics.
              </p>
            )}

            {/* Selected novel not found */}
            {selectedSlug && !selectedNovel && (
              <div className="rounded-card border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
                Novel not found.
              </div>
            )}

            {/* Novel detail panel */}
            {selectedNovel && <NovelAnalyticsPanel novel={selectedNovel} />}
          </div>
        )}
      </section>
    </div>
  );
}
