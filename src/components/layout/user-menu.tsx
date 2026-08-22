"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="h-7 w-7 animate-pulse rounded-full bg-card" />;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="rounded border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-border-hover hover:text-text-primary"
      >
        Log in
      </Link>
    );
  }

  const initial = session.user?.name?.[0] ?? session.user?.email?.[0] ?? "U";
  const role = (session.user as { role?: string } | undefined)?.role;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Account menu" className="text-text-secondary">
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs uppercase text-text-secondary">
            {initial}
          </div>
        )}
      </button>

      {open && (
        <div className="glass absolute right-0 z-50 mt-3 w-48 rounded-card p-1.5 shadow-2xl animate-slide-up">
          <div className="px-2.5 py-2 text-xs">
            <p className="truncate text-text-primary">{session.user?.name || "Account"}</p>
            <p className="truncate text-text-muted">{session.user?.email}</p>
          </div>
          <div className="my-1 border-t border-border/60" />
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block rounded px-2.5 py-1.5 text-xs text-text-secondary hover:bg-card/60 hover:text-text-primary"
          >
            Profile
          </Link>
          {role === "admin" && (
            <Link
              href="/kn-x9b4"
              onClick={() => setOpen(false)}
              className="block rounded px-2.5 py-1.5 text-xs text-text-secondary hover:bg-card/60 hover:text-text-primary"
            >
              Admin dashboard
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full rounded px-2.5 py-1.5 text-left text-xs text-status-error hover:bg-card/60"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
