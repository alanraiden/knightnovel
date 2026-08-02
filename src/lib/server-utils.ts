import "server-only";
import { ObjectId } from "mongodb";

// Comment targetId is a real chapter ObjectId for chapter comments, but a
// human-readable novel slug for novel-level discussion (novels are looked
// up and displayed by slug throughout the app, not by _id). Accept both.
//
// This lives in its own file (rather than lib/utils.ts) specifically
// because it imports the `mongodb` driver, which is Node-only. utils.ts is
// imported by client components (e.g. for the `cn` helper), and pulling
// `mongodb` in there breaks the client bundle with "Can't resolve 'net'"
// type errors. The `server-only` import below also makes this a hard
// build-time error if anything client-side ever imports this file by
// mistake, instead of a silent bundle bloat.
export function toTargetId(raw: string): ObjectId | string {
  return ObjectId.isValid(raw) && String(new ObjectId(raw)) === raw ? new ObjectId(raw) : raw;
}
