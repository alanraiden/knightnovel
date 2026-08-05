import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { DemoNovel } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  ongoing: "text-status-success bg-status-success/10",
  completed: "text-status-info bg-status-info/10",
  hiatus: "text-status-warning bg-status-warning/10",
};

export function NovelCard({ novel, rank }: { novel: DemoNovel; rank?: number }) {
  return (
    <Link
      href={`/novel/${novel.slug}`}
      className="group block rounded-card transition-all duration-200 ease-out hover:-translate-y-1.5 active:-translate-y-1"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-card border border-transparent bg-card shadow-md shadow-black/0 transition-all duration-200 ease-out group-hover:border-accent-highlight/60 group-hover:shadow-xl group-hover:shadow-black/40 group-active:border-accent-highlight/60 group-active:shadow-xl group-active:shadow-black/40">
        {novel.cover ? (
          <Image
            src={novel.cover}
            alt={novel.title}
            fill
            sizes="(max-width: 768px) 33vw, 160px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] group-active:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-disabled text-xs">
            cover
          </div>
        )}
        {rank !== undefined && (
          <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-base/80 text-xs font-medium text-accent-highlight">
            {rank}
          </span>
        )}
        <span
          className={cn(
            "absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize",
            statusColor[novel.status]
          )}
        >
          {novel.status}
        </span>
      </div>
      <p className="mt-2 truncate text-[13px] text-text-primary group-hover:text-accent-highlight group-active:text-accent-highlight">
        {novel.title}
      </p>
      <p className="mt-0.5 text-[11px] text-text-muted">Ch. {novel.chapterCount}</p>
      <div className="mt-0.5 flex items-center justify-between text-[11px] text-text-muted">
        <span className="truncate">{novel.genres.slice(0, 2).join(" · ")}</span>
        <span className="flex shrink-0 items-center gap-0.5 text-accent-highlight">
          <Star size={11} className="fill-current" />
          {novel.rating}
        </span>
      </div>
    </Link>
  );
}
