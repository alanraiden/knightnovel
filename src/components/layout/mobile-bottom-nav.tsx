"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Novel", icon: BookOpen },
  { href: "/community", label: "Community", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const isChapterPage = /\/novel\/[^/]+\/chapter\/[^/]+/.test(pathname);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // While reading a chapter, hide this nav on scroll-down and reveal it on
  // scroll-up — otherwise it sits on top of the reading page's own
  // Previous/Index/Next floating nav. Left alone (always visible) on every
  // other page.
  useEffect(() => {
    if (!isChapterPage) {
      setHidden(false);
      return;
    }
    lastY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      if (y > lastY.current && y > 80) setHidden(true);
      else if (y < lastY.current) setHidden(false);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isChapterPage]);

  return (
    <nav
      className={cn(
        "glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 transition-transform duration-300 md:hidden",
        hidden && "translate-y-full"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : href === "/profile"
            ? pathname.startsWith("/profile")
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px]",
              active ? "text-accent" : "text-text-muted"
            )}
          >
            <Icon size={19} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
