import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Knight Novel — read before using the platform.",
};

const EFFECTIVE_DATE = "September 1, 2026";
const CONTACT_EMAIL = "idenwebstudio@gmail.com";
const SITE_URL = "https://knightnovel.online";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">Terms of Service</h1>
      <p className="mt-2 text-sm text-text-muted">Effective date: {EFFECTIVE_DATE}</p>

      <p className="mt-6 text-sm leading-relaxed text-text-secondary">
        Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using{" "}
        <strong className="text-text-primary">{SITE_URL}</strong> (the &ldquo;Service&rdquo;) operated
        by Knight Novel (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing or
        using the Service you agree to be bound by these Terms. If you disagree, do not use the Service.
      </p>

      <Section title="1. Eligibility">
        <p>
          You must be at least 13 years old to use the Service. By using it, you represent that you
          meet this requirement and have the legal capacity to enter into a binding agreement.
        </p>
      </Section>

      <Section title="2. User Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for
          all activity that occurs under your account. You agree to notify us immediately of any
          unauthorised use. We reserve the right to terminate accounts that violate these Terms.
        </p>
      </Section>

      <Section title="3. User-Generated Content">
        <p>
          By posting comments, discussions, or any other content on the Service, you grant Knight
          Novel a worldwide, non-exclusive, royalty-free licence to display, reproduce, and distribute
          that content as part of the Service. You retain ownership of your content and are solely
          responsible for it.
        </p>
        <p className="mt-3">
          You agree not to post content that is unlawful, defamatory, harassing, obscene,
          infringing, or otherwise objectionable. We reserve the right to remove any content and
          suspend any account at our discretion.
        </p>
      </Section>

      <Section title="4. Third-Party Content">
        <p>
          Novel titles, covers, and synopses displayed on Knight Novel may be owned by their
          respective authors and publishers. Knight Novel does not host novel text. If you believe
          any listing infringes your rights, see our{" "}
          <a href="/dmca" className="text-accent-highlight underline underline-offset-2">
            DMCA policy
          </a>
          .
        </p>
      </Section>

      <Section title="5. Prohibited Conduct">
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Scraping or crawling the Service without our express written permission.</li>
          <li>Attempting to gain unauthorised access to any part of the Service or its infrastructure.</li>
          <li>Using automated tools to create accounts, post content, or manipulate any metrics.</li>
          <li>Impersonating any person, entity, or Knight Novel staff.</li>
          <li>Distributing malware or engaging in any activity that disrupts the Service.</li>
        </ul>
      </Section>

      <Section title="6. Intellectual Property">
        <p>
          All design, code, and original content on the Service (excluding user-generated content and
          third-party novel listings) are the property of Knight Novel and may not be copied or
          repurposed without prior written consent.
        </p>
      </Section>

      <Section title="7. Disclaimer of Warranties">
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranty of any kind. We do not
          guarantee uninterrupted access, accuracy of information, or fitness for a particular
          purpose. Your use of the Service is at your own risk.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Knight Novel shall not be liable for any indirect,
          incidental, special, or consequential damages arising out of your use of or inability to
          use the Service.
        </p>
      </Section>

      <Section title="9. Changes to These Terms">
        <p>
          We may revise these Terms at any time. We will post the updated version with a new
          effective date. Continued use of the Service after changes constitutes acceptance of the
          revised Terms.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Questions about these Terms? Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-highlight underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-base font-semibold text-text-primary">{title}</h2>
      <div className="text-sm leading-relaxed text-text-secondary">{children}</div>
    </section>
  );
}
