# Changes — Hero crop fix, card touch feedback, real tag/genre links, view counting

## 1. The "still blurry" hero background — found the real cause (`hero-carousel.tsx`)
It wasn't a leftover CSS blur (already confirmed clean). Shadow Slave doesn't
have a custom hero background set in Admin → Featured, so it was using the
automatic fallback: the novel's own **portrait** cover, zoomed to fill a
**wide landscape** hero banner. `object-cover` already has to crop that
aggressively on its own to cover the wide box — the code was then stacking
an *extra* manual `scale-125` zoom on top of that, pushing the crop into a
flat, low-detail patch of the cover (usually background/negative space,
since that's what's left after zooming past the character art). No blur
filter was ever applied — it just looked soft because it was a heavily
blown-up sliver of a mostly-plain area.

Fix: removed the redundant `scale-125` (object-cover's own auto-scaling is
enough) and re-biased the crop toward the top of the cover
(`object-[center_15%]`), where the subject/face usually sits on a book
cover. This will look meaningfully better, but a portrait cover stretched
into a landscape banner will never look as good as a real wide banner — for
the best result on any given novel, uploading a proper hero background via
Admin → Featured (which you already have built) is still the right move.
This fix just makes the automatic fallback look as good as it reasonably can.

## 2. Novel cards had no feedback on tap (`novel-card.tsx`)
Real bug, and it explains exactly what you were seeing: the card only had
`hover:`/`group-hover:` classes, no `active:`/`group-active:`. `:hover`
essentially never fires on a touch tap — the phone just navigates away
immediately, so on mobile these cards genuinely showed nothing, while things
like the hero buttons *did* show feedback because I'd specifically given
those `active:` states earlier. Added `active:`/`group-active:` versions of
the same lift/scale/border/shadow treatment, so a tap now shows the same
feedback hover does, just briefly, before the navigation happens. This
affects every place `NovelCard` is used — Highlights, Trending, Browse —
automatically, since they all share the one component.

## 3. Genre & tags on the novel page are now real links (`app/novel/[slug]/page.tsx`, `tag-list.tsx`)
Same treatment as the Community "Popular Tags" fix from before. Genre pills
now link to `/browse?genre=<genre>`, tags (in `TagList`) now link to
`/browse?tag=<tag>` — both match Browse's existing query-param handling
exactly, no changes needed on the Browse side.

## 4. View counting — how it works, and the gap (`app/novel/[slug]/page.tsx`)
**How it already worked:** `incrementNovelViews()` fires once per page
render, fire-and-forget, so it doesn't block the page. Chapter pages already
called it — and because it's a plain server component (no client-side
caching), that call naturally fires on *every* server request: first open,
every refresh, and every time you navigate to a different chapter number
(each chapter number is its own route/render). So chapter-side view
counting already matched exactly what you described.

**The actual gap:** the novel's own detail page never called it at all —
opening or refreshing a novel's page didn't count as a view, only opening
one of its chapters did. Added the same call there. Now: opening the novel
page, refreshing it, opening a chapter, switching chapters, and refreshing
a chapter page all increment the counter — matches what you described.

One honest caveat already noted in the code (didn't add this, just leaving
it documented since it's directly relevant): there's no scheduled job yet
to reset the daily/weekly/monthly counters, so right now they all just
track total views together — the "24h"/"7d" rankings will functionally
show all-time numbers until that job exists. Flagging in case you want that
built next; it's a real gap but a separate piece of work from this fix.

### Verified
- `npx next build` — compiles clean.
- `next start` + `curl`: novel page returns 200 with genre/tag links present
  (2 genre links, 3 tag links in the rendered HTML for Shadow Slave), the
  old `scale-125` class is gone, and `NovelCard`'s new `active:` classes are
  present in the homepage HTML.
- Couldn't observe the view counter actually incrementing in this sandbox
  since `incrementNovelViews` is a no-op without `MONGODB_URI` set (by
  design) — but the call site and pattern are identical to the chapter
  page's, which is already working for you in production.

---

## On the logo / seasonal-theme idea
Genuinely like this — a couple of thoughts before I'd start building:

- **Scope check first**: do you want just a swappable *logo* (small,
  contained change — an image field in settings, shown in the navbar), or
  a broader *theme* swap (logo + accent color + maybe a banner) for things
  like a Halloween or holiday event? Those are pretty different sizes of
  feature — the logo alone is small; a full seasonal theme system means
  building a way to swap CSS custom properties/colors at runtime, which is
  a bigger, more architecturally invasive change.
- **My suggestion**: start with just the logo as its own small settings
  field (upload via Cloudinary, same pattern as covers/hero backgrounds,
  stored as one setting, swapped instantly with no redeploy). That alone
  covers "put up a pumpkin logo for October" cheaply. If that's useful, a
  full seasonal *theme* (colors + banner + logo bundled as a named preset
  you can switch between) is a natural follow-up rather than something to
  build all at once.
- One thing worth deciding up front: should a swapped logo/theme apply
  site-wide immediately for all visitors, or would you want to schedule it
  (e.g., "auto-revert after Nov 1")? That changes whether this needs a
  simple on/off setting or something with dates attached.

Let me know which direction you want and I'll scope it properly before
touching any code.
