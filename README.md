# Knight Novel

Mobile-first, SEO-first novel reading platform built around community.
Next.js (App Router) + TypeScript + Tailwind + MongoDB, themed with the
"Midnight Library" palette.

## Accessing the admin dashboard

**Important**: `/admin` (and everything under it) requires `NEXTAUTH_SECRET` to be set in `.env.local`, even for local testing — without it, NextAuth throws a config error and those pages return a 500. Generate one with `openssl rand -base64 32` and paste it in.

`/admin` is gated — you need a logged-in account with `role: "admin"` in the `users` collection.

1. Sign in once at `/login` (Google or email/password) so a user document exists.
2. Promote yourself: `npm run make-admin -- you@example.com`
3. Visit `/admin` — you'll be redirected to `/login` if signed out, or to `/` if signed in but not an admin.

## Real data wiring (this update)

Every page now fetches through `src/lib/queries.ts` — a single data-access
layer that tries MongoDB first and falls back to the in-memory demo data if
`MONGODB_URI` isn't set or a query comes back empty. This means:

- The site looks correct immediately after cloning (demo fallback).
- The moment you set `MONGODB_URI` and run `npm run seed`, pages start
  showing real content — **no code changes required**, the fallback is
  automatic per-query.
- All data fetching happens in `async` Server Components, not client-side
  `useEffect` — so nothing here creates a blank-then-fill SEO problem. See
  the "SEO and rendering strategy" section above, which still applies.

**Pages converted this round**: homepage, novel page, chapter page (including
real chapter content when seeded, real threaded comments), browse (split into
a server data-fetch + `BrowseClient` for the interactive filters), rankings
(same split pattern), community, search, and the profile dashboard (session-aware:
fetches the signed-in user's real bookmarks/reading progress, falls back to a
populated demo dashboard when logged out or empty).

**Known limitation**: `stats.streakDays` and `stats.totalHours` on the
profile dashboard return `0` in the real-data path — computing a reading
streak or total session time needs a small scheduled job / instrumentation
that isn't built yet (noted inline in `queries.ts`). Everything else
(currently reading count, chapters read, bookmarks, continue reading) is
real once seeded.

### Sticker uploads (now real, not just a local preview)

The comment composer's "Upload sticker" button now actually uploads to
**Vercel Blob** via `/api/uploads/sticker` and attaches the hosted URL to the
comment. To enable it:

1. In the Vercel dashboard: **Storage → Create Database → Blob** on this
   project. This automatically sets `BLOB_READ_WRITE_TOKEN` for you.
2. For local dev, copy that token into `.env.local` as `BLOB_READ_WRITE_TOKEN`.

Without that token set, the upload endpoint returns a clear 503 error
telling you it's not configured yet (rather than failing silently) — the
composer still shows the local preview either way, so the UI never looks
broken, but the sticker won't actually persist until Blob storage is wired
up.

### Google login now persists real user records

Previously Google sign-in was wired but never actually saved a user
document to MongoDB — only the credentials (email/password) provider did.
Fixed by adding `@auth/mongodb-adapter`, which is conditionally enabled only
when `MONGODB_URI` is set (so auth still works in local dev without a
database — Google sign-in just won't persist a user in that case). This
matters because both the `/admin` role check and the profile dashboard's
per-user queries need a real user `_id` to look up.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI, GOOGLE_CLIENT_ID/SECRET, NEXTAUTH_SECRET
npm run seed                 # populates the new MongoDB database with demo novels
npm run dev
```

The UI currently renders from `src/lib/seed-data.ts` (in-memory demo data) so
it looks correct immediately, with zero setup. The API routes under
`src/app/api/*` are already wired to MongoDB — once `MONGODB_URI` is set and
you run `npm run seed`, swap the page components from the demo data import
over to fetching `/api/novels` etc. This split was intentional: it means the
whole UI can be reviewed and iterated on before touching the database.

## What's implemented

- **Homepage** — hero carousel (3 slides), highlights, trending, rankings
  preview, newly added / recently updated, community block.
- **Browse** — filter drawer (status, genre, searchable tag multi-select,
  sort, country) + novel grid.
- **Novel page** — metadata, alt titles, Bookmark/Favorite/Rate/Report
  actions, expandable tags, paginated chapter list (30 at a time), ratings
  placeholder, discussion, tag-overlap related novels.
- **Chapter (reading) page** — light/dark/sepia themes, font size controls,
  progress bar, big prev/next, "you might also like" (random 3), threaded
  comments with votes/spoilers/read-more truncation.
- **Bookmarks/Profile dashboard** (`/profile`, formerly `/bookmarks`) — reading
  stats widget, Continue Reading row + highlight card (jumps straight to the
  next chapter), filterable/searchable bookmark cards, folders affordance,
  **Comments & Replies section** (click any of your comments to jump straight
  to it in the discussion via `#comment-id` anchor), "you might also like".
- **Community, Rankings, Notifications (dropdown window, not a page),
  Search** — functional.
- **Admin** — Overview, Novels, Moderation (covers reported comments/reviews
  *and* reported sticker uploads — see below), Announcements, Analytics, and
  **Ghost Comments** all built and gated by a real `role: "admin"` session
  check (redirects to `/login` if signed out, to `/` if not an admin).
- **Stickers are user-uploaded**, not admin-curated packs — each comment
  composer has an "Upload sticker" button (image file, 2MB limit) that
  attaches to that comment. There is no sticker-pack management screen by
  design; inappropriate uploads are handled through the normal Moderation
  queue instead.
- **Auth** — NextAuth wired for Google OAuth + email/password, with a real
  `/login` page (previously configured in code but had no UI).
- **SEO** — see the dedicated section below.
- **Legal pages** — About, Contact, Privacy, Terms, DMCA, FAQ.

## SEO and rendering strategy (why pages aren't blank for crawlers)

Every page in this project is either statically prerendered (`○` in the build
output) or server-rendered per request (`ƒ`) — never a blank client-side
shell that fills in after JS loads. Run `npm run build` and check the route
table: anything marked `○` or `●` ships full HTML immediately; `ƒ` routes
(like the chapter reader, which depends on the chapter number in the URL)
render full HTML on the server for every request, then hydrate. Googlebot
(and any crawler) sees complete content on the very first response either
way — there's no reliance on JS execution to reveal content.

`"use client"` on a page component does **not** mean client-side-only
rendering in Next.js App Router — it still gets server-rendered first, then
hydrates. What kills SEO is fetching data with `useEffect` after the page
mounts, which really does leave a blank shell briefly. **This project doesn't
do that anywhere yet** (pages currently use the in-memory `seed-data.ts`, not
a `useEffect` fetch), and when wiring the real MongoDB data in, that data
fetching should happen in a `async` Server Component (or the API routes,
called at request time from the server) — not from a `"use client"`
component's `useEffect`. That's the one architectural rule to keep going
forward.

`robots.ts` disallows `/admin`, `/api`, `/profile`, `/login`, and
`/notifications` from indexing since those are private/personal, not content
that should show up in search results.

## What's stubbed / next steps

- Novel/chapter data comes from `seed-data.ts`, not the database, in the page
  components themselves (the API routes are ready — see above).
- Sticker uploads currently preview locally (`URL.createObjectURL`) but
  aren't actually persisted anywhere yet — need an upload endpoint wired to
  a real file host (Cloudinary, S3, or Vercel Blob all work fine) before this
  is production-ready. `next.config.mjs` already allowlists Cloudinary's
  domain as a starting point.
- Admin pages for Novels/Moderation/Announcements/Analytics have real UI now
  but aren't wired to live MongoDB queries yet (Ghost Comments is the one
  fully wired end-to-end, as originally requested).
- Bulk chapter import (docx/txt/csv) endpoint isn't built yet.
- Rankings counters (`viewsDaily/Weekly/Monthly`) need a scheduled job to
  reset/aggregate — see spec Section 11 for the tag-overlap batch job too.
- Redis/caching layer for counters — not needed until real traffic.

## Project structure

```
src/
  app/            routes (App Router) + API routes under app/api
  components/     layout, novel, browse, chapter, bookmarks, ui
  lib/
    db.ts         MongoDB connection singleton
    auth.ts       NextAuth config (Google + credentials)
    models/       TypeScript interfaces matching the MongoDB schema
    seed-data.ts  in-memory demo data
scripts/seed.ts   populates MongoDB with the demo novels
```

## Environment variables

See `.env.example`. At minimum for local dev with a real database you need
`MONGODB_URI`. Google login needs `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
from the Google Cloud Console (OAuth consent screen + credentials).
