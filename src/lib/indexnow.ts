import "server-only";

// IndexNow — instant-indexing notification protocol supported by Bing, Yandex,
// and other participating search engines. When content is published, updated,
// or deleted, one call here tells all engines at once, eliminating crawl lag.
//
// Spec: https://www.indexnow.org/documentation
// We use Bing's relay endpoint which redistributes to all participating engines
// so there is no need to call each engine separately.
//
// Design contract (mirrors the rest of src/lib/):
// - Server-only: the INDEXNOW_KEY env var is never NEXT_PUBLIC_ prefixed.
// - Never throws: callers must not fail on IndexNow errors; we log instead.
// - No-ops silently when INDEXNOW_KEY is absent (local dev without the key).

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://knightnovel.com").replace(/\/$/, "");
}

/**
 * Submit one or more absolute or site-relative URLs to IndexNow.
 *
 * - Relative paths (e.g. "/novel/shadow-slave/chapter/1") are automatically
 *   prefixed with NEXT_PUBLIC_SITE_URL.
 * - Deduplicates the URL list before sending.
 * - Sends a single batched POST (spec allows up to 10,000 URLs per request).
 * - Logs success/failure with an [IndexNow] prefix; never throws.
 */
export async function notifyIndexNow(urls: string | string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    // Expected in local dev without the env var — not an error.
    console.warn("[IndexNow] INDEXNOW_KEY is not set; skipping submission.");
    return;
  }

  const siteUrl = getSiteUrl();
  const host = new URL(siteUrl).hostname;

  // Normalise: accept relative paths and deduplicate.
  const rawList = Array.isArray(urls) ? urls : [urls];
  const urlList = [
    ...new Set(
      rawList.map((u) => (u.startsWith("http") ? u : `${siteUrl}${u}`))
    ),
  ].filter(Boolean);

  if (urlList.length === 0) return;

  const body = {
    host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList,
  };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      // 200 = accepted (may not be processed immediately), 202 = accepted for async processing
      console.log(
        `[IndexNow] submitted ${urlList.length} URL(s) → ${res.status} ${res.statusText}`
      );
    } else {
      const text = await res.text().catch(() => "");
      console.error(
        `[IndexNow] submission failed → ${res.status} ${res.statusText}`,
        text ? `\n  Body: ${text}` : ""
      );
    }
  } catch (err) {
    // Network error, DNS failure, etc. — never propagate to callers.
    console.error("[IndexNow] fetch error:", err);
  }
}
