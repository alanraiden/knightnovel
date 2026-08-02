import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB, matches the client-side check

export async function POST(req: NextRequest) {
  // TODO: once next-auth session is required for posting, reject
  // unauthenticated uploads here too — right now anyone can hit this route.

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Sticker uploads aren't configured yet. Enable Vercel Blob storage on this project (Vercel dashboard → Storage → Create Database → Blob) — it sets BLOB_READ_WRITE_TOKEN automatically.",
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
    const blob = await put(`stickers/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[uploads/sticker]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
