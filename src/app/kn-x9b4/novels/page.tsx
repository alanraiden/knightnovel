import Link from "next/link";
import Image from "next/image";
import { getAllNovels } from "@/lib/queries";
import { NewNovelButton } from "@/components/admin/new-novel-button";

export default async function AdminNovelsPage() {
  const novels = await getAllNovels();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-text-primary">Novels</h1>
        <NewNovelButton />
      </div>
      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-text-muted">
            <tr>
              <th className="px-3 py-2">Cover</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Chapters</th>
              <th className="px-3 py-2">Rating</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {novels.map((n) => (
              <tr key={n.slug} className="border-t border-border">
                <td className="px-3 py-2">
                  <div className="relative h-14 w-10 overflow-hidden rounded bg-card">
                    {n.cover && <Image src={n.cover} alt={n.title} fill sizes="40px" className="object-cover" />}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Link href={`/kn-x9b4/novels/${n.slug}/edit`} className="text-text-primary hover:text-accent-highlight">
                    {n.title}
                  </Link>
                </td>
                <td className="px-3 py-2 capitalize text-text-secondary">{n.status}</td>
                <td className="px-3 py-2 text-text-secondary">{n.chapterCount}</td>
                <td className="px-3 py-2 text-accent-highlight">★ {n.rating}</td>
                <td className="px-3 py-2">
                  <Link href={`/kn-x9b4/novels/${n.slug}/chapters`} className="text-xs text-accent-highlight">
                    Manage chapters →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
