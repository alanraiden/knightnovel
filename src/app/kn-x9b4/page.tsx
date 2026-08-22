export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="text-lg font-medium text-text-primary">Admin overview</h1>
      <p className="mt-2 text-sm text-text-muted">
        Analytics widgets, moderation queue size, and recent activity land here — wire up to
        /api/admin/analytics once MongoDB is connected.
      </p>
    </div>
  );
}
