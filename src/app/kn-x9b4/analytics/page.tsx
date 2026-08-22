const metrics = [
  { label: "Total novels", value: "6" },
  { label: "Total users", value: "\u2014" },
  { label: "Comments today", value: "\u2014" },
  { label: "Avg. session time", value: "\u2014" },
];

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="mb-4 text-lg font-medium text-text-primary">Analytics</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-card border border-border bg-surface p-3">
            <p className="text-xs text-text-muted">{m.label}</p>
            <p className="mt-1 text-xl text-text-primary">{m.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-text-muted">
        Wire these to real aggregation queries against MongoDB once traffic exists.
      </p>
    </div>
  );
}
