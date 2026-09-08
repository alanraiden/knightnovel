import { NextRequest, NextResponse } from "next/server";
import { notifyAdmin } from "@/lib/resend";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(120).optional(),
  message: z.string().min(1).max(3000),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all fields correctly." }, { status: 400 });
  }
  const { name, email, subject, message } = parsed.data;

  const emailSubject = subject
    ? `Contact [${subject}]: ${name}`
    : `Contact form: ${name}`;

  const emailBody = [
    `From:    ${name} <${email}>`,
    `Subject: ${subject ?? "General enquiry"}`,
    ``,
    message,
  ].join("\n");

  await notifyAdmin(emailSubject, emailBody);

  return NextResponse.json({ ok: true });
}
