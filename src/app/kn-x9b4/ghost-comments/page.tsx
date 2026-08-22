import { getAllNovels } from "@/lib/queries";
import { GhostCommentForm } from "@/components/admin/ghost-comment-form";

export default async function GhostCommentsPage() {
  const novels = await getAllNovels();
  return <GhostCommentForm novels={novels} />;
}
