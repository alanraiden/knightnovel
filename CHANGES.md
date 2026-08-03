# Changes — this round

14 files (4 new, 10 modified). No new dependencies, no new env vars.

## 1. Folder assignment not persisting after refresh — real bug, found and fixed
Confirmed exactly what you described: the FolderManagerModal's "add/remove
novel to folder" action was wired straight to a local state setter
(`changeFolder`) that **only updated the UI**, never actually called the
save API. It looked like it worked because the screen updated instantly —
then a refresh silently reverted it since nothing was ever written to
MongoDB. Fixed: `changeFolder` now calls `PATCH /api/bookmarks/[novelId]`
(the same endpoint the bookmark card's own inline picker already used
correctly) before updating local state.
- Modified: `components/bookmarks/profile-client.tsx`

## 2. Auto-resizing comment textarea, capped at ~18 lines
New `AutoResizeTextarea` component — grows smoothly as you type (measures
`scrollHeight` on every change), caps out around 18 lines and scrolls
internally past that instead of growing forever. Swapped into the shared
comment composer, so this covers novel comments, chapter comments, and
Community discussion replies all at once (they all use the same composer).
- New: `components/shared/auto-resize-textarea.tsx`
- Modified: `components/novel/comment-thread.tsx`

## 3. Ghost Discussions — new dedicated admin feature
Separate from Ghost Comments (which is chapter/general-comment focused),
this is specifically for creating Community Discussions: pick a novel,
title, category, single post or bulk import — reuses the same bulk-import
parser/preview from Ghost Comments (nested replies, auto timestamps,
editable preview) but scoped to always be a novel-level discussion, no
chapter selector needed. Meant for migrating discussion threads from
another site.
- New: `app/admin/ghost-discussions/page.tsx`, `components/admin/ghost-discussion-form.tsx`
- Modified: `app/admin/layout.tsx` (nav link)

## 4. Date chapter was added — now real, not just "coming soon"
Found that a public paginated chapters API (`/api/novels/[slug]/chapters`)
already existed from a very early round but had never actually been wired
to the chapter list UI — `ChapterList` was purely synthesizing "Ch.1, Ch.2…"
client-side with no real data behind it at all. Rewired it to fetch real
chapter docs (including `publishedAt`) from that endpoint, showing a
relative date under each chapter number/row. Falls back to the old
synthetic numbering (no date shown) if there's no real chapter data yet —
demo mode still works.
- Modified: `components/novel/chapter-list.tsx`

## 5. Homepage/Browse novel cards — current chapter number
Added "Ch. N" under the title on every `NovelCard` (used on Home, Browse,
Related Novels, You Might Also Like — one shared component, one fix
covers all of them).
- Modified: `components/novel/novel-card.tsx`

## 6. Hover animations — already correct, verified
Checked `NovelCard`'s hover treatment against your spec (lift 6px, cover
zoom 3%, gold border, growing shadow) — it already matches exactly and is
reused everywhere novel covers appear as cards. No changes needed.

## 7. More genres/tags in Browse filter
- **Tags are now dynamic** — pulled from whatever tags actually exist on
  your real novels (`BrowseClient` derives them from the fetched novel
  list), instead of a small hardcoded demo list. As you add more
  novels/tags through the admin panel, they show up in the filter
  automatically — no manual list to maintain.
- **Genres remain a fixed curated list** (that's the correct model for
  genres specifically, unlike free-form tags) — lives in `lib/genres.ts`
  if you want to add more yourself; 25 are there now. Happy to add more if
  you tell me which ones.
- Modified: `components/browse/filter-drawer.tsx`, `components/browse/browse-client.tsx`

## 8. Profile Comments & Replies — paginated
Loads 10 initially with a "Load more (N remaining)" button, instead of
rendering your entire comment history in one long scroll.
- Modified: `components/bookmarks/profile-client.tsx`

## 9. Rankings — root cause found: view counts genuinely never existed
This was a real, deep gap: `counters.viewsTotal/viewsDaily/viewsWeekly/viewsMonthly`
were initialized to `0` when a novel is created and then **never
incremented anywhere in the entire codebase** — searched for every usage to
confirm. Every novel was permanently tied at 0 views, so any
"popular"/"trending"/rankings sort was really just sorting ties in
whatever arbitrary order MongoDB happened to return them — which is
exactly what "the ranking isn't correct" looks like.

Fixed: chapter page views now increment `viewsTotal` (and
daily/weekly/monthly alongside it) via a fire-and-forget write on every
chapter page load. **Honest limitation**: there's no scheduled job yet to
reset the daily/weekly/monthly windows, so all four numbers will move
together as one running total until that job exists — Rankings will now
be *meaningfully ordered* (real signal instead of arbitrary), but Day vs.
Week vs. Month won't diverge from each other yet. Flagging this rather
than pretending it's fully solved.
- Modified: `lib/queries.ts` (`incrementNovelViews`), `app/novel/[slug]/chapter/[chapterNumber]/page.tsx`

## 10. "Admin can rate any number of times" — investigated
Good news on the data side: the backend already prevents this correctly —
ratings upsert on `{novelId, userId}`, so re-rating the same novel updates
your existing row rather than creating a new one; `ratingCount` was never
actually inflatable. The real problem was **transparency**: the rating
modal always opened blank with no memory of your previous rating, so
resubmitting silently overwrote it with zero indication that's what was
happening — which reads exactly like "adding ratings endlessly" even
though the count was fine underneath.

Fixed: the modal now fetches your existing rating (new `GET` handler on
the reviews route) and pre-fills the stars/review text, switches its
title/button to "Update your rating," and shows a small note explaining
that submitting again updates rather than adds.
- Modified: `app/api/novels/[slug]/reviews/route.ts`, `components/novel/rating-modal.tsx`
