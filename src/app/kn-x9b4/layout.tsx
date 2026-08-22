import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = { robots: { index: false, follow: false } };

const links = [
  { href: "/kn-x9b4", label: "Overview" },
  { href: "/kn-x9b4/novels", label: "Novels" },
  { href: "/kn-x9b4/featured", label: "Featured" },
  { href: "/kn-x9b4/moderation", label: "Moderation" },
  { href: "/kn-x9b4/ghost-comments", label: "Ghost Comments" },
  { href: "/kn-x9b4/ghost-discussions", label: "Ghost Discussions" },
  { href: "/kn-x9b4/announcements", label: "Announcements" },
  { href: "/kn-x9b4/analytics", label: "Analytics" },
  { href: "/kn-x9b4/settings", label: "Settings" },
  { href: "/kn-x9b4/monetization", label: "Monetization" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session) redirect("/login?callbackUrl=/kn-x9b4");
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
