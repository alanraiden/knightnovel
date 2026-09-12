// ─── Server Component ─────────────────────────────────────────────────────────
// Reads ad settings fresh on every render (settings collection, not cached),
// so toggling anything in Admin → Monetization takes effect on the very
// next page load — no redeploy, no restart.
//
// This is the ONLY file that needs to change when wiring in a new ad network.
// Every page that already places <AdSlot /> keeps working without changes.
//
// NOTE: This file intentionally has NO "use client" directive so it can safely
// import from queries.ts → server-utils.ts (which uses "server-only").
// The interactive bits live in ad-slot-client.tsx.

import { getAdSettings } from "@/lib/queries";
import { AdSlotClient, type AdPage, type AdPosition } from "./ad-slot-client";

export type { AdPage, AdPosition };

export async function AdSlot({ page, position }: { page: AdPage; position: AdPosition }) {
  const settings = await getAdSettings();
  if (!settings.enabled) return null;
  if (!settings.pageTypes[page]) return null;
  if (!settings.positions[position]) return null;

  return (
    <div
      className="flex min-h-[90px] w-full items-center justify-center overflow-hidden rounded-card"
      data-ad-page={page}
      data-ad-position={position}
    >
      <AdSlotClient page={page} position={position} />
    </div>
  );
}
