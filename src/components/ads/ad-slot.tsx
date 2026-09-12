"use client";

import { useEffect, useRef } from "react";

// Extend the Window type to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// Maps each page+position combination to its AdSense data-ad-slot ID.
// When Google issues you individual ad unit IDs (one per slot), paste them here.
// Until then, every slot shares the same placeholder so the page structure is
// already correct and ready for live IDs.
const AD_SLOT_IDS: Record<string, string> = {
  "chapter-top":    "XXXXXXXXXX",
  "chapter-middle": "XXXXXXXXXX",
  "chapter-bottom": "XXXXXXXXXX",
  "novel-top":      "XXXXXXXXXX",
  "novel-middle":   "XXXXXXXXXX",
  "novel-bottom":   "XXXXXXXXXX",
  "community-top":  "XXXXXXXXXX",
  "community-middle":"XXXXXXXXXX",
  "community-bottom":"XXXXXXXXXX",
};

type AdPage = "chapter" | "novel" | "community";
type AdPosition = "top" | "middle" | "bottom";

interface AdSlotClientProps {
  page: AdPage;
  position: AdPosition;
}

// Inner client component — pushes the adsbygoogle command after mount.
// Must be "use client" because it calls useEffect / accesses window.
function AdSlotClient({ page, position }: AdSlotClientProps) {
  const slotKey = `${page}-${position}`;
  const adSlotId = AD_SLOT_IDS[slotKey] ?? "XXXXXXXXXX";
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Only push once per mount to avoid duplicate ad requests on React strict-mode
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not yet loaded — the async script will pick it up
    }
  }, []);

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9481193991721439"
      data-ad-slot={adSlotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-ad-page={page}
      data-ad-position={position}
    />
  );
}

// ─── Public server-compatible wrapper ────────────────────────────────────────
// Reads ad settings fresh on every render (settings collection, not cached),
// so toggling anything in Admin → Monetization takes effect on the very
// next page load — no redeploy, no restart.
//
// This is the ONLY file that needs to change when wiring in a new ad network.
// Every page that already places <AdSlot /> keeps working without changes.
import { getAdSettings } from "@/lib/queries";

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
