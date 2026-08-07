import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUnreadNotificationCount, getSiteLogoUrl } from "@/lib/queries";
import { NotificationWindow } from "@/components/layout/notification-window";
import { UserMenu } from "@/components/layout/user-menu";

const navLinks = [
  { href: "/browse", label: "Novels" },
  { href: "/rankings", label: "Ranking" },
  { href: "/community", label: "Community" },
];

export async function Navbar() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const [initialUnreadCount, logoUrl] = await Promise.all([
    userId ? getUnreadNotificationCount(userId) : Promise.resolve(0),
    getSiteLogoUrl(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-base/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-medium text-text-primary">
            {logoUrl ? (
              <span className="relative h-[22px] w-[22px]">
                <Image src={logoUrl} alt="" fill sizes="22px" className="object-contain" />
              </span>
            ) : (
              <ShieldBookMark />
            )}
            Knight Novel
          </Link>
          {/* Desktop-only nav links — mobile uses the bottom nav instead */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/search"
            aria-label="Search"
            className="glass-light hidden items-center gap-2 rounded px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text-secondary sm:flex"
          >
            <Search size={15} />
            <span>Search novels, authors…</span>
          </Link>
          <Link href="/search" aria-label="Search" className="sm:hidden text-text-secondary">
            <Search size={19} />
          </Link>
          <NotificationWindow initialUnreadCount={initialUnreadCount} />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function ShieldBookMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 3 5v6c0 5 3.8 8.7 9 11 5.2-2.3 9-6 9-11V5l-9-3Z"
        stroke="#D4A35F"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="#D4A35F" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
