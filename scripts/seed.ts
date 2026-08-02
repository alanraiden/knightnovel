// Seeds the new MongoDB database with demo novels/chapters so the app has
// real data to read from instead of the in-memory seed-data.ts fallback.
// Run with: npm run seed  (requires MONGODB_URI in .env.local)
import { MongoClient } from "mongodb";
import { demoNovels } from "../src/lib/seed-data";
import "dotenv/config";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set — add it to .env.local first.");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "knightnovel");

  console.log("Seeding novels…");
  for (const n of demoNovels) {
    const now = new Date();
    const { data: existing } = { data: await db.collection("novels").findOne({ slug: n.slug }) };
    if (existing) continue;

    const result = await db.collection("novels").insertOne({
      slug: n.slug,
      title: n.title,
      altTitles: n.altTitles,
      authors: [n.author],
      description: n.description,
      coverImageUrl: "",
      genres: n.genres,
      tags: n.tags,
      status: n.status,
      country: n.country,
      chapterCount: n.chapterCount,
      wordCount: 0,
      counters: {
        viewsTotal: 0,
        viewsDaily: 0,
        viewsWeekly: 0,
        viewsMonthly: 0,
        favorites: 0,
        ratingAvg: n.rating,
        ratingCount: 0,
        commentCount: 0,
      },
      isFeatured: false,
      featuredHighlight: false,
      relatedNovelIds: [],
      createdAt: now,
      updatedAt: now,
      lastChapterAddedAt: now,
      seo: { metaTitle: n.title, metaDescription: n.description },
    });

    // Seed a handful of chapters per novel (not the full count) for demo purposes.
    const chapterDocs = Array.from({ length: Math.min(5, n.chapterCount) }, (_, i) => ({
      novelId: result.insertedId,
      chapterNumber: i + 1,
      title: `Chapter ${i + 1}`,
      slug: `chapter-${i + 1}`,
      content: "Placeholder chapter content — replace via admin bulk import.",
      wordCount: 0,
      status: "published" as const,
      publishedAt: now,
      updatedAt: now,
      views: 0,
    }));
    if (chapterDocs.length) await db.collection("chapters").insertMany(chapterDocs);

    console.log(`  + ${n.title}`);
  }

  console.log("Done.");
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
