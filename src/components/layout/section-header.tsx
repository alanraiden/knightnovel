import Link from "next/link";

export function SectionHeader({ title, href, linkText = "View All →" }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-medium text-text-primary">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-xs text-accent transition-colors duration-200 hover:text-accent-hover hover:underline"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}
