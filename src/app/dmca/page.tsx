import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DMCA Takedown Policy",
  description:
    "Knight Novel DMCA takedown policy — how to submit a copyright infringement notice.",
};

const DMCA_EMAIL = "idenwebstudio@gmail.com";
const EFFECTIVE_DATE = "September 1, 2026";

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">DMCA Takedown Policy</h1>
      <p className="mt-2 text-sm text-text-muted">Effective date: {EFFECTIVE_DATE}</p>

      <p className="mt-6 text-sm leading-relaxed text-text-secondary">
        Knight Novel respects the intellectual property rights of authors, publishers, and other
        rights holders. In accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512),
        we respond promptly to valid notices of claimed copyright infringement.
      </p>

      {/* What we host */}
      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-text-primary">What Knight Novel hosts</h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          Knight Novel is a community discussion platform. We host{" "}
          <strong className="text-text-primary">user-generated content</strong> (comments and
          discussions) and novel metadata (titles, covers, synopses). We do{" "}
          <strong className="text-text-primary">not</strong> host or distribute the full text of any
          novel. If you are concerned about a novel listing (cover image, synopsis), use the process
          below.
        </p>
      </section>

      {/* How to submit */}
      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-text-primary">How to submit a notice</h2>
        <p className="mb-4 text-sm leading-relaxed text-text-secondary">
          Send your DMCA takedown notice to{" "}
          <a
            href={`mailto:${DMCA_EMAIL}`}
            className="text-accent-highlight underline underline-offset-2"
          >
            {DMCA_EMAIL}
          </a>
          . Your notice must include <strong className="text-text-primary">all</strong> of the
          following:
        </p>

        <ol className="space-y-3 text-sm text-text-secondary">
          {[
            "Your full legal name, mailing address, phone number, and email address.",
            "Identification of the copyrighted work you claim has been infringed. If multiple works are covered, provide a representative list.",
            "The specific URL(s) on knightnovel.online where the allegedly infringing material appears.",
            "A statement that you have a good-faith belief that the use of the material in the manner complained of is not authorised by the copyright owner, its agent, or the law.",
            "A statement that the information in your notice is accurate, and under penalty of perjury, that you are the copyright owner or authorised to act on the owner's behalf.",
            "Your physical or electronic signature.",
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-highlight/15 text-[11px] font-semibold text-accent-highlight">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Counter-notices */}
      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-text-primary">Counter-notices</h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          If you believe your content was removed in error or misidentified, you may send a
          counter-notice to{" "}
          <a
            href={`mailto:${DMCA_EMAIL}`}
            className="text-accent-highlight underline underline-offset-2"
          >
            {DMCA_EMAIL}
          </a>
          . Counter-notices must include your contact information, identification of the removed
          material, a statement under penalty of perjury that the material was removed by mistake or
          misidentification, your consent to local federal district court jurisdiction, and your
          signature.
        </p>
      </section>

      {/* Repeat infringers */}
      <section className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <h2 className="mb-2 text-base font-semibold text-amber-400">Repeat infringer policy</h2>
        <p className="text-sm leading-relaxed text-amber-200/70">
          Knight Novel will terminate the accounts of users who are found to be repeat infringers in
          appropriate circumstances, consistent with the requirements of the DMCA.
        </p>
      </section>

      {/* Response time */}
      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-text-primary">Response timeline</h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          We aim to acknowledge valid notices within{" "}
          <strong className="text-text-primary">2 business days</strong> and to act on them within{" "}
          <strong className="text-text-primary">10 business days</strong>. Incomplete notices may be
          returned for clarification, which will reset the timeline.
        </p>
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/contact"
          className="text-sm text-text-muted underline underline-offset-2 hover:text-text-secondary"
        >
          General enquiries → Contact Us
        </Link>
      </div>
    </div>
  );
}
