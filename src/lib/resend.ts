import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// From address must be on a domain verified in your Resend account before
// this works in production. onboarding@resend.dev works for local testing
// without any domain setup.
const FROM = process.env.RESEND_FROM_EMAIL || "Knight Novel <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

export async function sendEmail(opts: { to: string; subject: string; text: string }) {
  if (!resend) {
    console.warn("[resend] RESEND_API_KEY not set — skipping email:", opts.subject);
    return { skipped: true };
  }
  try {
    await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, text: opts.text });
    return { skipped: false };
  } catch (err) {
    console.error("[resend] send failed:", err);
    return { skipped: true, error: err };
  }
}

export async function notifyAdmin(subject: string, text: string) {
  if (!ADMIN_EMAIL) {
    console.warn("[resend] ADMIN_NOTIFICATION_EMAIL not set — skipping admin notification:", subject);
    return { skipped: true };
  }
  return sendEmail({ to: ADMIN_EMAIL, subject, text });
}
