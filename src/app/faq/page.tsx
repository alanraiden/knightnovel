"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is Knight Novel free to use?",
    a: "Yes — reading, discussing, and bookmarking are completely free. We may introduce optional supporter features in the future, but the core experience will always be free.",
  },
  {
    q: "Do I need an account to read novels?",
    a: "No. Anyone can browse and read. An account is only required to post comments, join discussions, or save bookmarks.",
  },
  {
    q: "How do I create an account?",
    a: (
      <>
        Click <strong>Sign up</strong> in the top-right corner. You can register with your email
        address or continue with Google — no password needed for Google login.
      </>
    ),
  },
  {
    q: "I forgot my password. What do I do?",
    a: 'On the login page, click "Forgot password?" and enter your email. You\'ll receive a reset link within a few minutes. Check your spam folder if it doesn\'t arrive.',
  },
  {
    q: "How do I change my display name or avatar?",
    a: "Go to your profile page (click your avatar → Profile) and use the Edit Profile section to update your display name or upload a new avatar.",
  },
  {
    q: "How do I report a comment or discussion post?",
    a: 'Every comment has a flag icon. Click it, choose a reason, and our moderation team will review it within 48 hours. Repeat offenders are suspended.',
  },
  {
    q: "Why was my comment removed?",
    a: "Comments are removed for violating our Terms of Service — including spam, harassment, spoilers without warnings, or copyright content. If you believe a removal was in error, contact us.",
  },
  {
    q: "Can I post spoilers?",
    a: "Yes, with a spoiler tag. Use the spoiler button in the comment editor and your content will be blurred until the reader chooses to reveal it.",
  },
  {
    q: "How are novels added to the site?",
    a: "Novels are added by the Knight Novel team. If you'd like to request a title or suggest a novel for inclusion, use the Contact page and include the novel's name and source URL.",
  },
  {
    q: "How can I report a novel listing that infringes copyright?",
    a: (
      <>
        Please see our{" "}
        <a href="/dmca" className="text-accent-highlight underline underline-offset-2">
          DMCA takedown policy
        </a>{" "}
        for the correct procedure.
      </>
    ),
  },
  {
    q: "Does Knight Novel have a mobile app?",
    a: "Not yet. The site is fully responsive and works well on mobile browsers. A dedicated app is something we're considering for the future.",
  },
  {
    q: "How do I delete my account?",
    a: (
      <>
        Send a deletion request to{" "}
        <a
          href="mailto:idenwebstudio@gmail.com"
          className="text-accent-highlight underline underline-offset-2"
        >
          idenwebstudio@gmail.com
        </a>
        . We'll process it within 30 days and confirm when your data has been removed.
      </>
    ),
  },
];

function FaqItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-text-primary hover:text-text-secondary"
      >
        <span>{q}</span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm leading-relaxed text-text-secondary">{a}</div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Can&apos;t find what you&apos;re looking for?{" "}
          <a href="/contact" className="text-accent-highlight underline underline-offset-2">
            Contact us
          </a>{" "}
          and we&apos;ll get back to you.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface px-6">
        {faqs.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
