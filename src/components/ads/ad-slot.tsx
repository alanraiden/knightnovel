import { getAdSettings } from "@/lib/queries";

type AdPage = "chapter" | "novel" | "community";
type AdPosition = "top" | "middle" | "bottom";

// Reads ad settings fresh on every render (settings collection, not cached),
// so toggling anything in Admin → Monetization takes effect on the very
// next page load — no redeploy, no restart.
//
// This placeholder is deliberately the only thing that needs to change when
// a real network gets wired in later: swap the inner <div> for e.g. an
// AdSense <ins> tag. The page/position gating logic and every call site
// that renders <AdSlot /> stays exactly the same.
export async function AdSlot({ page, position }: { page: AdPage; position: AdPosition }) {
  const settings = await getAdSettings();
  if (!settings.enabled) return null;
  if (!settings.pageTypes[page]) return null;
  if (!settings.positions[position]) return null;

  return (
    <div
      data-ad-page={page}
      data-ad-position={position}
      className="flex min-h-[90px] w-full items-center justify-center rounded-card border border-dashed border-border bg-surface/60 text-xs text-text-muted"
    >
      Advertisement
    </div>
  );
}
