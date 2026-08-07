import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { GENRES } from "@/lib/genres";

const MAX_BIO_LENGTH = 100;

// Updates the editable profile fields: display name, bio, favorite genre.
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName) return NextResponse.json({ error: "Display name can't be empty" }, { status: 400 });
  if (displayName.length > 40) {
    return NextResponse.json({ error: "Display name must be 40 characters or fewer" }, { status: 400 });
  }

  const bio = typeof body.bio === "string" ? body.bio.trim() : "";
  if (bio.length > MAX_BIO_LENGTH) {
    return NextResponse.json({ error: `Bio must be ${MAX_BIO_LENGTH} characters or fewer` }, { status: 400 });
  }

  const favoriteGenre = typeof body.favoriteGenre === "string" ? body.favoriteGenre : "";
  if (favoriteGenre && !(GENRES as readonly string[]).includes(favoriteGenre)) {
    return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
  }

  try {
    const { users } = await collections();
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { displayName, bio, favoriteGenre } }
    );
    return NextResponse.json({ ok: true, displayName, bio, favoriteGenre });
  } catch (err) {
    console.error("[profile PATCH]", err);
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
