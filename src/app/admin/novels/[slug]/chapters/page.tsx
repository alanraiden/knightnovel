import { notFound } from "next/navigation";
import { getNovelBySlug, getChaptersForAdmin } from "@/lib/queries";
import { ManageChaptersClient } from "@/components/admin/manage-chapters-client";

export default async function ManageChaptersPage({ params }: { params: { slug: string } }) {
  const [novel, chapters] = await Promise.all([
    getNovelBySlug(params.slug),
    getChaptersForAdmin(params.slug),
  ]);
  if (!novel) notFound();

  return (
    <div>
      <h1 className="mb-1 text-lg font-medium text-text-primary">{novel.title}</h1>
      <p className="mb-4 text-xs text-text-muted">Manage chapters</p>
      <ManageChaptersClient novelSlug={novel.slug} chapters={chapters} />
    </div>
  );
}
