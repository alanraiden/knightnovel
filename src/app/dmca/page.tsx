export const metadata = { title: "DMCA" };
export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-medium text-text-primary">DMCA takedown requests</h1>
      <p className="mt-4 text-sm text-text-secondary">
        To submit a takedown request, email dmca@knightnovel.com with the required information
        (URL, copyrighted work, statement of good faith). Requests are tracked internally in the
        admin panel's moderation area.
      </p>
    </div>
  );
}
