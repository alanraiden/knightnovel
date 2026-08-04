# Changes — Hero polish, auto-advance, Browse micro-interactions, Community tag links

## 1. Mobile Read Now button (`hero-carousel.tsx`)
Was `w-full py-3` (a full-width bar). Changed to match the desktop button's
actual sizing (`w-fit px-4 py-2`), so it's a normal inline-sized button
instead of stretching edge to edge.

## 2. Desktop hero — removed the heavy overlay, kept true glassmorphism (`hero-carousel.tsx`)
There was no literal `blur()` filter left over from last time, but two
stacked dark gradients (`from-base via-base/85` horizontal + `from-base/90`
vertical) were covering most of the image — enough that it read as "blurred
out" even though it wasn't. Removed both and replaced with a single light
bottom fade, just enough to keep the arrows/dots legible. Legibility for the
title/stats now comes entirely from the `.glass` panel itself (semi-opaque
background + `backdrop-filter: blur(14px)` — that's the actual glassmorphism,
and it was already there, just fighting against the overlay for attention).
The art itself is now fully visible everywhere the glass panel isn't sitting.

## 3. Auto-advancing hero (`hero-carousel.tsx`)
Added a `setInterval` that calls the existing `go(1)` every 8 seconds
(inside your requested 7–10s range). It re-arms on every navigation —
manual click, arrow, or automatic — so clicking right before it would've
auto-advanced doesn't cause a jump right after. Didn't touch the underlying
carousel logic (`index` state, `go()`, wraparound) at all, just added the
timer around it.

## 4. Browse page micro-interactions (`browse-client.tsx`, `filter-drawer.tsx`)
`NovelCard` (Trending/Newly Added/etc., and Browse's whole grid) already had
the full lift/scale/shadow/gold-border hover treatment from before — that
carries over to Browse automatically since it's the same shared component,
nothing needed there. What Browse's own controls were missing:
- Quick-filter pills (Trending/Newly Added/Recently Updated) — added the
  lift + brighten used elsewhere.
- The "Filter" toggle button — added lift + gold border on hover.
- Status/tag pills inside the filter drawer — swapped the plain border-color
  hover for the gold-outline treatment used on genre tags elsewhere.

## 5. Community — Popular Tags now link to Browse (`community-client.tsx`)
These were plain `<span>`s, not clickable at all. Now each is a `<Link
href="/browse?tag=<tag>">`, matching the `tag` query param Browse's filter
logic already reads (confirmed against `browse-client.tsx`'s existing
`initialParams.tag` handling — no changes needed on the Browse side). Added
the same gold-outline hover feedback as the other tag treatments for
consistency. Nothing else on the Community page was touched.

### Verified
- `npx next build` — compiles clean.
- `next start` + `curl`: home/browse/community all return 200. Confirmed in
  rendered HTML: mobile Read Now button is no longer full-width, the old
  heavy gradient class is gone, Browse's lift class is present on the
  quick-filter buttons. Couldn't confirm the Popular Tags links visually in
  this sandbox — `getPopularTags()` returns an empty list whenever
  `MONGODB_URI` isn't set (by design, pre-existing behavior, nothing to do
  with this change), so the section rendered its "No tags yet" empty state
  here. Confirmed the link markup itself is correct directly in the source.
  Will render real linked tags once your DB has novels with tags in it.

### Not touched
Community page beyond the Popular Tags links, as requested. Hero carousel's
index/state logic. NovelCard/DiscussionCard (already had the full treatment).
