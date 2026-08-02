import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collections } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ folders: [] });

  try {
    const { folders } = await collections();
    const docs = await folders.find({ userId: new ObjectId(userId) }).sort({ name: 1 }).toArray();
    return NextResponse.json({ folders: docs.map((d) => ({ id: d._id.toString(), name: d.name })) });
  } catch {
    return NextResponse.json({ folders: [] });
  }
}

const bodySchema = z.object({ name: z.string().min(1).max(40) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Folder name is required." }, { status: 400 });

  try {
    const { folders } = await collections();
    const result = await folders.insertOne({
      userId: new ObjectId(userId),
      name: parsed.data.name,
      createdAt: new Date(),
    });
    return NextResponse.json({ id: result.insertedId.toString(), name: parsed.data.name });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
}
