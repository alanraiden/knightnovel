# Changes — Hero section upgrade + Featured admin overhaul

## Request: "Upgrade my hero section like [reference screenshot], update the admin
Featured panel to allow uploading/selecting a background image, and bump
featured novels from 3 to 5."

### 1. Hero section redesign (`src/components/novel/hero-carousel.tsx`)
Rebuilt to match the reference layout:
- Cover thumbnail on the left, title/genre pills/description/"Read more"/CTA
  buttons in the middle, and a stats panel on the right (desktop) — Rating,
  Views, Bookmarks, Status, Chapters, Updated, Author.
- All stats are **real data**, nothing invented: Rating/Views/Chapters/Status
  come from existing fields; Bookmarks is a new mapping to the novel's real
  `counters.favorites` count (see queries.ts change below). There's no
  "Readers" stat in the new design because we don't track a distinct
  reader-count separate from views — didn't want to add a fake number just to
  match the screenshot's exact slot list. Happy to wire up a real "unique
  readers" counter later if you want that reinstated.
- On mobile, the side stats panel collapses into a compact inline row
  (Rating/Views/Bookmarks/Status) under the description instead of disappearing.
- **New: optional per-novel hero background.** If a novel has a
  `heroBackgroundUrl` set, the hero shows it sharp with a left-to-right
  gradient fade (like the reference image) instead of the old blurred-cover
  treatment. Novels without one keep the original blurred-cover look
  automatically — nothing breaks for existing featured novels.

### 2. Data model (`src/lib/models/types.ts`, `src/lib/seed-data.ts`, `src/lib/queries.ts`)
- Added `heroBackgroundUrl?: string` to the `Novel` Mongo model.
- Added `heroBackground?: string` and `bookmarks: string` to `DemoNovel` /
  `NovelView`, with the 6 demo novels given plausible bookmark counts (same
  convention as the existing demo `views` numbers).
- `fromMongo()` now maps `heroBackgroundUrl` and formats
  `counters.favorites` into `bookmarks`, reusing the existing `formatViews()`
  helper.

### 3. Featured novels: 3 → 5
- `getFeatured(5)` on the homepage (`src/app/page.tsx`).
- Randomize endpoint now samples up to 5 (`src/app/api/admin/featured/randomize/route.ts`).
- Save endpoint schema cap raised from 6 → 5 to match exactly
  (`src/app/api/admin/featured/route.ts`).
- Admin UI (`FeaturedClient`) limit constant bumped to 5, copy updated.

### 4. Admin Featured page: background image upload per slide
- `src/components/admin/featured-client.tsx` — each selected novel in the
  list now has its own thumbnail (showing its background or falling back to
  its cover), an "Upload background" / "Change" button, and a "Reset" button
  to clear back to the auto blurred-cover fallback. Upload shows a local
  preview immediately, then persists once the Cloudinary upload + DB save
  both succeed; errors are shown inline per-slide rather than failing silently.
- **New API route** `src/app/api/admin/uploads/hero-background/route.ts` —
  same Cloudinary upload pattern as the existing cover upload route, but a
  separate `knight-novel/hero-backgrounds` folder and an 8MB limit (these are
  wide banner images, larger than covers).
- **New API route** `src/app/api/admin/featured/background/route.ts` —
  deliberately separate from the general novel-edit PATCH route, so saving a
  background can't accidentally clobber the rest of a novel's fields. Takes
  `{ slug, url }`; an empty `url` clears it back to the auto fallback.

### Bug found while working on this (fixed, not silently patched)
`package.json` was missing the `cloudinary` and `resend` packages entirely,
even though `src/lib/cloudinary.ts` and `src/lib/resend.ts` import them. This
meant `next build` failed to compile from a clean `npm install` — unrelated to
anything in this session's changes, it looks like it's been broken since
whenever those integrations were first wired up. Added both as real
dependencies; `package.json` and `package-lock.json` are included in this
delivery so `npm install` will pull them in correctly from now on.

### Verified
- `npm install && npx next build` — compiles clean, all 54 routes generate.
- `next start` + `curl` smoke test: homepage renders all 5 hero slides with
  real demo data; `/admin/featured` redirects unauthenticated users (307);
  both new API routes return 403 without an admin session (confirmed with a
  dummy `NEXTAUTH_SECRET`, matching the same `requireAdmin()` pattern every
  other admin route already uses).

---

## Follow-up: keep the hero artwork visible (not hidden by opaque panels)

Feedback after the first pass: the artwork was mostly hidden behind solid-looking
background layers. Root cause — the project's shared `.glass` utility
(`src/app/globals.css`) is actually `rgba(24,35,56,0.55)` (55% opacity) plus a
14px blur, not the "~10-20%" the original handoff notes described. The first
hero version wrapped the *entire* content row in one full-width `.glass` panel,
then stacked three more `.glass` cards on top of that for the stats column —
so a large chunk of the hero was effectively double-darkened.

Changes (`src/components/novel/hero-carousel.tsx`, `src/app/globals.css`):
- **New `.glass-hero` utility** — `rgba(10,15,28,0.3)` + 12px blur, meant only
  for this hero. Much lighter than `.glass`, and used exactly once as the
  single container for all hero content (cover, text, stats) — not stacked
  per-element.
- **Removed the 3 separate stat cards.** The stats column is now plain text
  with icon labels, separated by a thin `border-white/10` divider, sitting
  inside the one `glass-hero` container instead of adding its own opaque
  layers on top of it.
- **Lighter gradient overlay.** Was `from-base via-base/85/70 to-transparent`
  (near-solid on the left, still noticeably tinted past the midpoint) — now
  `from-base/70 via-base/20 to-transparent`, so the right two-thirds where the
  character art sits stays clearly visible. The bottom-to-top gradient (which
  darkened the full image height even on desktop) is now `md:hidden` — it only
  applies on mobile, where text stacks vertically over the image and needs it.
- **Genre pills** switched from `bg-base/60` (opaque-looking) chips to
  `bg-black/25` + `backdrop-blur-sm`, so they read as small tinted glass chips
  rather than solid tags.
- Added `drop-shadow-sm`/`drop-shadow-md` to text directly over the artwork
  (title, description, stat values) so contrast holds up without needing a
  denser background behind it.

---

## Follow-up 2: make the artwork the focal point (Netflix/Steam-style, sharp and full-bleed)

Feedback with a screenshot: even after the opacity fix, the background still
read as a hazy, out-of-focus blur rather than real artwork — because novels
without a custom `heroBackground` were using the *old* fallback: the cover
image scaled up, blurred (`blur-2xl`), and dropped to 50% opacity. The only
sharp, recognizable art on the slide was the small cover thumbnail card, which
is what made the hero feel "boxed in" rather than full-bleed.

Change (`src/components/novel/hero-carousel.tsx`): removed that blurred
fallback branch entirely. The hero background — whether it's a custom
`heroBackground` or just the novel's cover reused as backdrop — is now always
rendered sharp, `object-cover` + `object-center`, filling the hero edge to
edge with no blur and no reduced opacity. The left-to-right gradient nudged up
slightly (`base/75` → `base/25`, was `base/70` → `base/20`) since a sharp image
needs a touch more contrast behind the text than a blurred one did; the right
side of the hero stays clearly visible either way.

Nothing else changed — carousel navigation, the stats panel, buttons, and the
admin background-upload flow all work exactly as before. Verified with another
`next build` + `next start` pass.


