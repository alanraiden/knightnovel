# Changes — this round

15 files (2 new, 13 modified). No new dependencies, no new env vars.

## 1. Textarea height inconsistency
Fixed — both the novel-page composer and the Community discussion reply
box were driven by the same `compact` prop (`rows={compact ? 1 : 2}`) but
you were seeing 3 vs 1, which suggests some visual/CSS-driven perception
difference more than the raw rows count. Regardless, made it consistent:
both now use `rows={3}` unconditionally. Since Community discussion replies
already reuse the exact same composer component as novel comments (from
last round's rework), this one fix covers both.
- Modified: `components/novel/comment-thread.tsx`

## 2. Novel page — views, chapter count, genres
Added a row below Status showing total views and chapter count, plus the
genre tags (previously only *tags* were shown — genres and tags are
different fields in the schema, and genres specifically weren't rendered
anywhere on this page at all).
- Modified: `app/novel/[slug]/page.tsx`

## 3. Filter drawer overflowing off-screen on mobile — confirmed and fixed
Real bug, and your diagnosis was right: the panel was `absolute right-0`
*relative to the Filter button itself* — that worked fine when Filter was
alone and pinned to the row's right edge, but once the gold quick-filter
buttons were added in front of it, Filter's position became unpredictable
depending on wrapping, so the 320px-wide panel could extend past the left
edge of a narrow phone screen. Fixed: on mobile the panel is now
`fixed inset-x-4` (a full-width sheet with even margins, positioned below
the sticky bar) regardless of where the button ends up; reverts to the
original right-anchored dropdown at `sm:` and above.
- Modified: `components/browse/filter-drawer.tsx`

## 4. Comments — pagination, sorting, total count, collapsed replies
This was the biggest piece. Comments were previously fetched **entirely**
(every comment on a thread, no limit) on every page load — genuinely would
not scale.
- **New `getCommentsPage()`** query — real cursor-style pagination:
  20 top-level comments per page (`skip`/`limit` at the database level),
  plus their full reply trees fetched separately and merged in.
- **`/api/comments` GET** rewritten around this — accepts `sort`, `offset`,
  `limit` query params.
- **Total count** shown at the top of every comment section — actual count
  of all comments+replies from the database, not just what's currently
  loaded on the page.
- **Sort options**: Top, Newest, Oldest, Most Liked — switching sort
  refetches page 1 from the server with the new order (not a client-side
  re-shuffle of whatever happened to already be loaded).
- **"Load more comments (N remaining)"** button fetches the next page and
  appends, de-duplicating anything already loaded.
- **Replies collapsed to the first 3** by default, with a
  "View N more replies" button to expand the rest — applies recursively at
  every depth.
- Modified: `lib/queries.ts`, `app/api/comments/route.ts`, `components/novel/comment-thread.tsx`, `app/novel/[slug]/page.tsx`, `app/novel/[slug]/chapter/[chapterNumber]/page.tsx`, `components/chapter/reading-shell.tsx`

## 5. Community — filter by novel and category
Two new select dropdowns in the sticky bar. Options are derived from the
discussions actually present (not the full novel catalog or a hardcoded
category list), so you never see a filter option that would return zero
results.
- Modified: `components/community/community-client.tsx`

## 6. Admin — Ghost Comments now support Title/Category (single + bulk)
Ghost comments could only ever be raw text before — no way to make one
show up as a proper titled Community discussion.
- **Single mode**: when posting to "Novel page (discussion)" (no chapter
  selected), two new fields appear — Discussion title and Category. Hidden
  automatically when a chapter is selected, since those don't apply to
  chapter comments.
- **Bulk import**: the parser now recognizes optional `Title:` and
  `Category:` lines at the top of a root thread (before `Username:`) —
  example text and the live preview both updated to show/edit them per
  thread. Ignored for replies (titles only make sense on the root of a
  discussion).
- Modified: `components/admin/ghost-comment-form.tsx`, `app/api/admin/ghost-comments/route.ts`, `lib/ghost-import-parser.ts`, `app/api/admin/ghost-comments/bulk/route.ts`, `components/admin/bulk-ghost-import.tsx`

## 7. Profile — folders redesigned into a real browsable section
Previously "Folders" just filtered the main bookmark grid down to one
folder — functional, but not what you described. Rebuilt as its own
two-level modal:
- **List view**: every folder, with a live count of novels in each.
- **Detail view** (click a folder): back button, folder name, a **+**
  button that opens a picker of your other bookmarked novels not yet in
  this folder (tap to add) — and below that, every novel currently in the
  folder shown with its **cover, current chapter, last-read time, and
  progress bar**, each removable individually.
- New: `components/bookmarks/folder-manager-modal.tsx`
- Modified: `components/bookmarks/profile-client.tsx`
