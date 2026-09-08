import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Knight Novel — how we collect, use, and protect your data.",
};

const EFFECTIVE_DATE = "September 1, 2026";
const CONTACT_EMAIL = "idenwebstudio@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">Privacy Policy</h1>
      <p className="mt-2 text-sm text-text-muted">Effective date: {EFFECTIVE_DATE}</p>

      <p className="mt-6 text-sm leading-relaxed text-text-secondary">
        This Privacy Policy describes how Knight Novel (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
        &ldquo;our&rdquo;) collects, uses, and shares information when you use our website and
        services. We respect your privacy and are committed to being transparent about our practices.
      </p>

      <Section title="1. Information We Collect">
        <SubSection heading="Account information">
          When you create an account, we collect your name and email address. If you sign in with
          Google OAuth, we receive your Google profile name, email, and profile picture.
        </SubSection>
        <SubSection heading="Content you post">
          Comments, discussion posts, bookmarks, reading progress, and any other content you create
          on the platform is stored and associated with your account.
        </SubSection>
        <SubSection heading="Usage data">
          We collect standard server logs including IP addresses, browser type, pages visited, and
          timestamps. This is used to maintain security and improve the platform.
        </SubSection>
        <SubSection heading="Uploaded media">
          If you upload sticker images, those files are stored via Cloudflare R2. We do not process
          or analyse image content beyond hosting it.
        </SubSection>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>To operate and provide the Service, including account authentication.</li>
          <li>To send transactional emails (password resets, notifications you opt into).</li>
          <li>To respond to contact form submissions and support requests.</li>
          <li>To enforce our Terms of Service and keep the community safe.</li>
          <li>To improve the platform through aggregated, anonymised analytics.</li>
        </ul>
        <p className="mt-3">
          We do <strong className="text-text-primary">not</strong> sell your personal data to third
          parties, use it for advertising targeting, or share it with data brokers.
        </p>
      </Section>



      <Section title="3. Data Retention">
        <p>
          We retain your account data for as long as your account is active. If you delete your
          account, your personal data is removed within 30 days. Anonymised aggregate data and server
          logs may be retained for up to 12 months for security purposes.
        </p>
      </Section>

      <Section title="4. Your Rights">
        <p>
          Depending on your jurisdiction you may have the right to access, correct, export, or delete
          your personal data. To exercise any of these rights, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-highlight underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          . We will respond within 30 days.
        </p>
      </Section>

      <Section title="5. Children's Privacy">
        <p>
          The Service is not directed at children under 13. We do not knowingly collect personal
          information from children. If you believe a child has provided us with personal data,
          please contact us and we will delete it promptly.
        </p>
      </Section>

      <Section title="6. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the updated policy with
          a new effective date. We encourage you to review this page periodically.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Questions or concerns about your privacy? Email us at{" "}
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
      <div className="space-y-2 text-sm leading-relaxed text-text-secondary">{children}</div>
    </section>
  );
}

function SubSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="mb-1 font-medium text-text-primary">{heading}</p>
      <p className="text-text-secondary">{children}</p>
    </div>
  );
}
