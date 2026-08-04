import { NextRequest, NextResponse } from "next/server";
import { isR2Configured, uploadImageToR2 } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB, matches the client-side check

export async function POST(req: NextRequest) {
  // TODO: once next-auth session is required for posting, reject
  // unauthenticated uploads here too — right now anyone can hit this route.

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error:
          "Sticker uploads aren't configured yet. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL (Cloudflare dashboard → R2).",
      },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Stickers must be under 2MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `stickers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const url = await uploadImageToR2(buffer, key, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[uploads/sticker]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
