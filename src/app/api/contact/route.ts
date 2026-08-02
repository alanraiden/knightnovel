import { NextRequest, NextResponse } from "next/server";
import { sendEmail, notifyAdmin } from "@/lib/resend";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1).max(3000),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all fields correctly." }, { status: 400 });
  }
  const { name, email, message } = parsed.data;

  await notifyAdmin(`Contact form: ${name}`, `From: ${name} <${email}>\n\n${message}`);

  return NextResponse.json({ ok: true });
}
