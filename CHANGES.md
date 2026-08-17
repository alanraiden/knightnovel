# Changes — Mobile keyboard sticker/GIF support, "Upload image" rename

## Root cause of "this app does not support image here"
This is a Gboard-specific check, not a bug in the upload logic itself: Gboard
only offers its sticker/GIF picker to elements it considers rich input
targets, and it checks whether the *focused DOM element* is `contenteditable`
before it'll hand over image content at all. A plain `<textarea>`/`<input>`
fails that check immediately, which is exactly the error message you saw.

## Fix — new `EditableComposer` (`src/components/shared/editable-composer.tsx`)
Replaces the plain `<textarea>` with a real `contenteditable` div, which is
what actually makes Gboard's sticker/GIF picker available in the keyboard.
On top of that:
- **Paste handling** — when Gboard hands over a picked sticker/GIF, it
  arrives as image data in the paste event. The composer checks for that
  first: if found, it's intercepted and handed to the exact same upload
  path (`/api/uploads/sticker`, R2-backed) your file-picker button already
  used — no separate/duplicate upload logic.
- **Plain text stays plain text** — pasting regular text (from anywhere,
  not just Gboard) is forced to plain text, not rich HTML, so comments
  can't accidentally pick up formatting from a copied webpage or doc.
- Multi-line typing, placeholder text, and the growing-box behavior your
  old `AutoResizeTextarea` had are all preserved.

Wired into both the comment/reply composer and the edit-comment box in
`comment-thread.tsx`. Refactored the upload logic into one shared
`uploadImageFile()` function so the file-picker button and paste-from-
keyboard both go through identical code — nothing duplicated.

`AutoResizeTextarea` (the old component) is now unused since
`comment-thread.tsx` was its only caller — left the file in place rather
than deleting it, in case you want it for something else later, but nothing
references it anymore.

## Button renamed
"Upload sticker" → "Upload image", as asked. Same button, same upload path,
just the label.

### Verified
- `npx next build` — compiles clean.
- `next start` + `curl`: novel page returns 200, confirmed `contentEditable`
  markup and the "Upload image" label are both present in the rendered
  HTML, and the old "Upload sticker" text is gone.
- Couldn't test the actual Gboard sticker picker itself from this sandbox
  (needs a real Android device) — the fix targets the exact documented
  cause of that error (contenteditable requirement) and the paste-handling
  code follows the standard pattern other sites use for this, but flagging
  that the very last mile — an actual phone tapping an actual sticker —
  wasn't something I could click through myself here.

### Not touched
Everything else in the file — voting, replies, spoilers, report modal, the
edit/mention/timestamp features from earlier.
