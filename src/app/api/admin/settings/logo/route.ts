import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { setSiteLogoUrl } from "@/lib/queries";

export const runtime = "nodejs";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB — a logo, not a banner

// Upload a new logo image and set it as the active one, in one step —
// mirrors the hero-background upload pattern.
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary isn't configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.",
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
    return NextResponse.json({ error: "Logo must be under 2MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageToCloudinary(buffer, "knight-novel/logo");
    await setSiteLogoUrl(url);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[admin/settings/logo POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Reset back to the default built-in shield mark.
export async function DELETE() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await setSiteLogoUrl(null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/settings/logo DELETE]", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
