import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = { robots: { index: false, follow: false } };

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/novels", label: "Novels" },
  { href: "/admin/featured", label: "Featured" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/ghost-comments", label: "Ghost Comments" },
  { href: "/admin/ghost-discussions", label: "Ghost Discussions" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session) redirect("/login?callbackUrl=/admin");
  if (role !== "admin") redirect("/");

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6">
      <aside className="w-48 shrink-0">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">Admin</p>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded px-2.5 py-1.5 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
