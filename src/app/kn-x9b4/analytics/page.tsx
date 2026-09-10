import { getAdminOverviewData } from "@/lib/queries";
import { AnalyticsToggle } from "@/components/admin/analytics-toggle";

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export default async function AdminAnalyticsPage() {
  let data;
  try {
    data = await getAdminOverviewData();
  } catch (err) {
    console.error("[kn-x9b4/analytics] error:", err);
    return (
      <div className="rounded-card border border-status-error/30 bg-surface p-6 text-sm text-status-error">
        Could not load analytics. Check your MongoDB connection and server logs.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Analytics</h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Period-based metrics derived from database timestamps and existing view counters.
        </p>
      </div>

      {/* All-time totals */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
          All-time Totals
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Novels", value: fmt(data.totalNovels) },
            { label: "Chapters", value: fmt(data.totalChapters) },
            { label: "Users", value: fmt(data.totalUsers) },
            { label: "Comments", value: fmt(data.totalComments) },
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

      {/* Period analytics */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
          Period Analytics
        </h2>
        <AnalyticsToggle analytics={data.analytics} />
      </section>
    </div>
  );
}
