import { NextRequest, NextResponse } from "next/server";
import { getDiscussionFeed, getChapterCommentFeed } from "@/lib/queries";

const VALID_TABS = new Set(["discussions", "chapter", "spoilers"]);
const VALID_SORTS = new Set(["newest", "oldest", "popular"]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tab    = searchParams.get("tab") ?? "";
  const sort   = searchParams.get("sort") ?? "newest";
  const novel  = searchParams.get("novel") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const offset = Math.max(0, Number(searchParams.get("offset") ?? "0"));
  const limit  = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "10")));

  if (!VALID_TABS.has(tab)) {
    return NextResponse.json(
      { error: "tab must be one of: discussions, chapter, spoilers" },
      { status: 400 }
    );
  }
  if (!VALID_SORTS.has(sort)) {
    return NextResponse.json(
      { error: "sort must be one of: newest, oldest, popular" },
      { status: 400 }
    );
  }

  const sortOpt = sort as "newest" | "oldest" | "popular";

  try {
    if (tab === "chapter") {
      const result = await getChapterCommentFeed({
        sort: sortOpt, novelSlug: novel, search, limit, offset,
      });
      return NextResponse.json(result);
    }

    const result = await getDiscussionFeed({
      sort: sortOpt,
      novelSlug: novel,
      search,
      limit,
      offset,
      isSpoiler: tab === "spoilers",
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch community data" }, { status: 500 });
  }
}
