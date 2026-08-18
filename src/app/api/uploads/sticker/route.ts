import { NextRequest, NextResponse } from "next/server";
import sharp, { type Metadata } from "sharp";
import { isR2Configured, uploadImageToR2 } from "@/lib/r2";

export const runtime = "nodejs";

// Input cap — generous enough for a phone photo, well short of anything
// that'd be a real abuse vector. The *stored* file ends up far smaller
// than this once optimized below.
const MAX_INPUT_SIZE = 5 * 1024 * 1024; // 5MB

const MAX_EDGE = 512; // longest edge, aspect ratio preserved
const WEBP_QUALITY = 80;

// Only real raster image formats — no SVG (can carry scripts) and nothing
// sharp can't decode. This is checked against sharp's own detection of the
// actual file bytes below, not just the client-supplied MIME type, so a
// mislabeled/corrupt file gets caught either way.
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif"]);

export async function POST(req: NextRequest) {
  // TODO: once next-auth session is required for posting, reject
  // unauthenticated uploads here too — right now anyone can hit this route.

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error:
          "Image uploads aren't configured yet. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL (Cloudflare dashboard → R2).",
      },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_INPUT_SIZE) {
    return NextResponse.json({ error: "Images must be under 5MB" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // Authoritative validation: parse the actual bytes rather than trusting
  // the client-supplied MIME type or file extension. Corrupt, truncated,
  // or non-image files throw here and get rejected below.
  let metadata: Metadata;
  try {
    metadata = await sharp(inputBuffer, { animated: true }).metadata();
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid image file" }, { status: 400 });
  }

  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
    return NextResponse.json(
      { error: "Unsupported image format — JPEG, PNG, WebP, and GIF are supported" },
      { status: 400 }
    );
  }
  if (!metadata.width || !metadata.height) {
    return NextResponse.json({ error: "Couldn't read this image's dimensions" }, { status: 400 });
  }

  try {
    const isAnimated = (metadata.pages ?? 1) > 1;

    // Longest edge capped at MAX_EDGE, aspect ratio preserved, never
    // upscaled. Animated GIFs are re-encoded frame-by-frame into an
    // animated WebP so the motion survives the format switch. Alpha
    // transparency (PNG/animated WebP/GIF) carries straight through —
    // resize and webp() don't touch the alpha channel unless explicitly
    // told to flatten, which we never do.
    const optimized = await sharp(inputBuffer, { animated: isAnimated })
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // Only the optimized buffer is ever uploaded — the original
    // full-resolution buffer is discarded after this point, not stored.
    const key = `stickers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const url = await uploadImageToR2(optimized, key, "image/webp");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[uploads/sticker]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
