export function ProgressBar({
  current,
  total,
  color = "#6AA9FF",
}: {
  current: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-1 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-1 text-[10px] text-text-muted">
        {current} / {total} ({pct}%)
      </p>
    </div>
  );
}
