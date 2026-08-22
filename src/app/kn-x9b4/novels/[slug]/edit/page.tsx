import { notFound } from "next/navigation";
import Link from "next/link";
import { getNovelBySlug } from "@/lib/queries";
import { EditNovelClient } from "@/components/admin/edit-novel-client";

export default async function EditNovelPage({ params }: { params: { slug: string } }) {
  const novel = await getNovelBySlug(params.slug);
  if (!novel) notFound();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-text-primary">Edit — {novel.title}</h1>
        <Link href={`/kn-x9b4/novels/${novel.slug}/chapters`} className="text-xs text-accent">
          Manage chapters →
        </Link>
      </div>
      <EditNovelClient novel={novel} />
    </div>
  );
}
