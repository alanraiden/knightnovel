import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB — covers are larger than stickers

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary isn't configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables (find these in your Cloudinary dashboard).",
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
    return NextResponse.json({ error: "Cover images must be under 5MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageToCloudinary(buffer, "knight-novel/covers");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[uploads/cover]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
