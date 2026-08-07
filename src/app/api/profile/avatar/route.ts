import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_SIZE = 3 * 1024 * 1024; // 3MB — the client already compresses to ~480px JPEG, this just guards against abuse

// The client crops to a square and compresses to JPEG before sending —
// this route just uploads the already-processed image and saves the URL.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Image uploads aren't configured yet — set the CLOUDINARY_* env vars." },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image is too large" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageToCloudinary(buffer, "knight-novel/avatars");

    const { users } = await collections();
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: { avatarUrl: url } });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[profile/avatar POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Reset to the default avatar (no photo).
export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { users } = await collections();
    await users.updateOne({ _id: new ObjectId(userId) }, { $unset: { avatarUrl: "" } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile/avatar DELETE]", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
