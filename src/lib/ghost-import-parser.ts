// Parses the structured text format described in the admin Bulk Import
// Ghost Comments feature:
//
//   Username: Alan
//   Time: 2 hours ago
//   Comment: This chapter was incredible!
//
//   Reply:
//     Username: ShadowReader
//     Time: 1 hour ago
//     Comment: I completely agree.
//
//   ---
//
//   Username: Luna
//   Comment: Can't wait for the next chapter!
//
// Threads are separated by a line containing only "---". Within a thread,
// "Reply:" lines (indentation = nesting depth, 2 spaces per level) start a
// nested comment. Time is optional — if omitted, a realistic timestamp is
// generated (see assignTimestamps).

export interface ParsedComment {
  id: string;
  username: string;
  timeRaw: string | null;
  comment: string;
  title: string | null; // only meaningful for root (depth 0) nodes — a discussion title
  category: string | null; // same — only meaningful for root nodes
  replies: ParsedComment[];
  resolvedDate: Date;
}

let counter = 0;
function nextId() {
  counter += 1;
  return `parsed-${Date.now()}-${counter}`;
}

interface DraftBlock {
  username: string;
  timeRaw: string | null;
  title: string | null;
  category: string | null;
  commentLines: string[];
}

function emptyDraft(): DraftBlock {
  return { username: "", timeRaw: null, title: null, category: null, commentLines: [] };
}

export function parseGhostImportText(text: string): ParsedComment[] {
  const threads = text
    .split(/\r?\n\s*---\s*\r?\n?/)
    .map((t) => t.trim())
    .filter(Boolean);
  return threads.map(parseThread).filter((t): t is ParsedComment => t !== null);
}

function parseThread(block: string): ParsedComment | null {
  const lines = block.split(/\r?\n/);

  let root: ParsedComment | null = null;
  const stack: { depth: number; node: ParsedComment }[] = [];

  let current: DraftBlock | null = null;
  let currentDepth = 0;

  function flush() {
    if (!current || (!current.username && current.commentLines.length === 0)) {
      current = null;
      return;
    }
    const node: ParsedComment = {
      id: nextId(),
      username: current.username || "Anonymous",
      timeRaw: current.timeRaw,
      comment: current.commentLines.join("\n").trim(),
      title: currentDepth === 0 ? current.title : null,
      category: currentDepth === 0 ? current.category : null,
      replies: [],
      resolvedDate: new Date(), // placeholder, real value set by assignTimestamps
    };
    if (currentDepth === 0) {
      root = node;
      stack.length = 0;
      stack.push({ depth: 0, node });
    } else {
      while (stack.length && stack[stack.length - 1].depth >= currentDepth) stack.pop();
      const parent = stack.length ? stack[stack.length - 1].node : root;
      if (parent) parent.replies.push(node);
      stack.push({ depth: currentDepth, node });
    }
    current = null;
  }

  for (const rawLine of lines) {
    const replyMatch = rawLine.match(/^(\s*)Reply:\s*$/i);
    if (replyMatch) {
      flush();
      const indent = replyMatch[1].length;
      currentDepth = Math.max(1, Math.round(indent / 2) || 1);
      current = emptyDraft();
      continue;
    }

    const usernameMatch = rawLine.match(/^\s*Username:\s*(.*)$/i);
    const timeMatch = rawLine.match(/^\s*Time:\s*(.*)$/i);
    const commentMatch = rawLine.match(/^\s*Comment:\s*(.*)$/i);
    const titleMatch = rawLine.match(/^\s*Title:\s*(.*)$/i);
    const categoryMatch = rawLine.match(/^\s*Category:\s*(.*)$/i);

    if (usernameMatch) {
      if (!current) current = emptyDraft();
      current.username = usernameMatch[1].trim();
    } else if (timeMatch) {
      if (!current) current = emptyDraft();
      current.timeRaw = timeMatch[1].trim() || null;
    } else if (titleMatch) {
      if (!current) current = emptyDraft();
      current.title = titleMatch[1].trim() || null;
    } else if (categoryMatch) {
      if (!current) current = emptyDraft();
      current.category = categoryMatch[1].trim() || null;
    } else if (commentMatch) {
      if (!current) current = emptyDraft();
      current.commentLines.push(commentMatch[1]);
    } else if (current && rawLine.trim()) {
      current.commentLines.push(rawLine.trim());
    }
  }
  flush();

  return root;
}

const RELATIVE_TIME_RE = /(\d+)\s*(minute|hour|day|week)s?\s*ago/i;

function resolveRelativeTime(raw: string, now: Date): Date | null {
  const m = raw.match(RELATIVE_TIME_RE);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const msPerUnit: Record<string, number> = {
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
  };
  return new Date(now.getTime() - n * msPerUnit[unit]);
}

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// Mutates resolvedDate in place across the whole tree. Rules:
// - Parent comments are always older than their replies.
// - Replies always come after the comment they belong to, each one a bit
//   more recent than the last (natural minutes/hours/days spread).
// - Root threads without an explicit time are spread across the recent
//   past, with later threads in the pasted list skewing more recent.
export function assignTimestamps(roots: ParsedComment[], now: Date = new Date()) {
  roots.forEach((root, i) => {
    const explicit = root.timeRaw ? resolveRelativeTime(root.timeRaw, now) : null;
    root.resolvedDate = explicit ?? new Date(now.getTime() - (randBetween(1, 96) + (roots.length - i) * 2) * 3_600_000);
    assignReplyTimes(root.replies, root.resolvedDate, now);
  });
}

function assignReplyTimes(replies: ParsedComment[], parentDate: Date, now: Date) {
  let cursor = parentDate;
  for (const reply of replies) {
    const explicit = reply.timeRaw ? resolveRelativeTime(reply.timeRaw, now) : null;
    if (explicit && explicit.getTime() > cursor.getTime()) {
      cursor = explicit;
    } else {
      cursor = new Date(cursor.getTime() + randBetween(5, 180) * 60_000); // 5min–3hr later
    }
    reply.resolvedDate = cursor;
    assignReplyTimes(reply.replies, cursor, now);
  }
}

// Flattens the tree into { comment, parentTempId } pairs in an order safe
// for sequential insertion (parents always before children).
export interface FlatGhostComment {
  tempId: string;
  parentTempId: string | null;
  username: string;
  comment: string;
  title?: string;
  category?: string;
  createdAt: string; // ISO
}

export function flattenThreads(roots: ParsedComment[]): FlatGhostComment[] {
  const out: FlatGhostComment[] = [];
  function walk(node: ParsedComment, parentTempId: string | null) {
    out.push({
      tempId: node.id,
      parentTempId,
      username: node.username,
      comment: node.comment,
      title: node.title ?? undefined,
      category: node.category ?? undefined,
      createdAt: node.resolvedDate.toISOString(),
    });
    node.replies.forEach((r) => walk(r, node.id));
  }
  roots.forEach((r) => walk(r, null));
  return out;
}
