# Changes — Homepage cover fix + Community mobile sticky-bar fix

## Request: "Novel covers aren't showing on homepage Rankings/Newly Added/
Recently Updated, and the Community search/filter bar stays stuck on screen
when scrolling on phone."

### 1. Missing covers on homepage (`src/app/page.tsx`)
Found the bug: the Rankings, Newly Added, and Recently Updated sections were
never wired up to render a cover image at all — each row used a plain empty
`<div className="h-8 w-8 ... bg-card" />` (or `h-10 w-10`) as a placeholder
that was never replaced with an actual `<Image>`. The data was there (every
`NovelView` already carries `cover`), it just wasn't being rendered in these
three sections — Highlights/Trending never had this problem since
`NovelCard` already renders covers correctly.

Fixed by rendering a real `next/image` thumbnail (32px in Rankings, 40px in
Newly Added / Recently Updated) in the same slot, falling back to the empty
card-colored box only if a novel genuinely has no `cover` set — same
honest-empty-state convention used elsewhere.

### 2. Community search/filter bar swallowing the screen on mobile (`src/components/community/community-client.tsx`)
Found the bug: the bar was `sticky top-14` **on all screen sizes**. On
desktop it's a single row and sticky makes sense. On mobile it's `flex-col`,
so it stacks into 4 full rows — search box, Recent/Popular buttons, "All
novels" dropdown, "All categories" dropdown — and that entire stack was
pinned to the top of the viewport permanently, which is what you were
seeing as it being "stuck" no matter how far you scrolled. It wasn't a
rendering bug, just sticky positioning applied where it shouldn't have been.

Changed it to `sm:sticky sm:top-14` — sticky only kicks in at the `sm`
breakpoint and up, where it's the compact single-row layout it was designed
for. On mobile it now scrolls away normally with the page, same as Browse's
filter bar already does (Browse never had this problem because its bar was
never sticky to begin with).

### Note on the third item mentioned
You mentioned a general "layout problem in phone mode" separate from the
above two — I couldn't pin down a third distinct bug from the screenshots
alone (the homepage one looks like it may just be a scroll position when the
screenshot was taken, not a rendering issue). Also worth flagging: you said
you'd made some edits of your own on top of what I last delivered, so what I
had on hand (the hero-update zip + full-project zip) may not exactly match
what's currently live. If there's still a layout issue after this fix,
send a screenshot with a description of what's wrong vs. what you'd expect,
and ideally the current state of any file you hand-edited — happy to dig in.

### Verified
- `npm install && npx next build` — compiles clean, all routes generate.
- `next start` + `curl` smoke test: homepage now renders 28 real cover
  `<Image>` elements (was 1 before, only the hero); confirmed `sm:sticky
  sm:top-14` is present on the Community filter bar in the rendered HTML.

### Not touched
Nothing else in these two files or elsewhere was changed — no other
sections, styling, or logic modified.
