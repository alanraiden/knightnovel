import { getAllNovels } from "@/lib/queries";
import { GhostDiscussionForm } from "@/components/admin/ghost-discussion-form";

export default async function GhostDiscussionsPage() {
  const novels = await getAllNovels();
  return <GhostDiscussionForm novels={novels} />;
}
