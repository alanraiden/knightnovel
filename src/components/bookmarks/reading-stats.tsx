import type { DashboardStats } from "@/lib/queries";

export function ReadingStats({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "Reading Streak", value: String(stats.streakDays), unit: "Days" },
    { label: "Currently Reading", value: String(stats.currentlyReading), unit: "Novels" },
    { label: "Chapters Read", value: stats.chaptersRead.toLocaleString(), unit: "Chapters" },
    { label: "Total Reading Time", value: String(stats.totalHours), unit: "Hours" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="rounded-card bg-surface p-3">
          <p className="text-[11px] text-text-muted">{s.label}</p>
          <p className="mt-1 text-xl font-medium text-text-primary">
            {s.value} <span className="text-xs font-normal text-text-secondary">{s.unit}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
