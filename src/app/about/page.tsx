import Link from "next/link";
import { BookOpen, Users, MessageSquare, Shield, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Knight Novel — a community-first platform for discovering and discussing web novels.",
};

const pillars = [
  {
    icon: BookOpen,
    title: "Curated Stories",
    body: "Every novel on the site is hand-picked or community-vetted. No spam, no machine-translated noise — just quality web fiction.",
  },
  {
    icon: Users,
    title: "Genuine Community",
    body: "We built discussion around real conversations, not points or streaks. Comment, thread, and debate without the social-media pressure.",
  },
  {
    icon: MessageSquare,
    title: "Chapter-level Threads",
    body: "Discuss a shocking plot twist right on the chapter page. Readers and translators talk in context, not in a buried global feed.",
  },
  {
    icon: Shield,
    title: "Reader-first Moderation",
    body: "Spoiler warnings, content flags, and a lightweight report system keep the community a welcoming place for new and veteran readers alike.",
  },
  {
    icon: Zap,
    title: "Fast &amp; Lightweight",
    body: "No bloated JS bundles, no intrusive ads. Pages load fast on mobile so you can dive into the next chapter anywhere.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-xs font-medium text-accent">
          Community · Reading · Discussion
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          About Knight Novel
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
          Knight Novel is a community-first platform for discovering and discussing web novels.
          We built it around genuine discussion rather than points, levels, or streak pressure —
          the goal is simply to help readers find great stories and talk about them.
        </p>
      </div>

      {/* What we believe */}
      <section className="mb-12">
        <h2 className="mb-2 text-lg font-semibold text-text-primary">What we believe</h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          The best reading communities form around the work itself — not around gamification metrics.
          Knight Novel strips away the noise and puts novels and readers at the centre. There are no
          experience bars, no daily login streaks, no algorithmic feeds pushing clickbait titles.
          Just a clean reading experience and honest conversations.
        </p>
      </section>

      {/* Pillars */}
      <section className="mb-12">
        <h2 className="mb-6 text-lg font-semibold text-text-primary">What we build for</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/30"
            >
              <Icon size={20} className="mb-3 text-accent-highlight" />
              <p className="mb-1 text-sm font-medium text-text-primary">{title}</p>
              <p
                className="text-xs leading-relaxed text-text-muted"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Origin */}
      <section className="mb-12 rounded-xl border border-border bg-surface/60 p-6">
        <h2 className="mb-3 text-lg font-semibold text-text-primary">How this started</h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          Knight Novel started as a personal reading list that got out of hand. The founders were
          frustrated that every major web-novel aggregator either had a terrible reading experience,
          a toxic comment section, or both. So we built the site we wanted to use — fast pages,
          sensible moderation, and threads that live next to the chapters they talk about.
        </p>
      </section>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
        <Link
          href="/browse"
          className="rounded-lg bg-accent-highlight px-6 py-2.5 text-sm font-semibold text-[#412402] transition-transform hover:scale-[1.03]"
        >
          Browse novels
        </Link>
        <Link
          href="/contact"
          className="rounded-lg border border-border px-6 py-2.5 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
