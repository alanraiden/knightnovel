import Link from "next/link";

const links = [
  { href: "/about", label: "About Us" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/dmca", label: "DMCA" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface pb-20 md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} Knight Novel. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-5 sm:justify-end">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-text-secondary">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
