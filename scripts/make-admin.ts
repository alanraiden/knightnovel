// Promotes a user to admin so they can access /admin.
// Usage: npx tsx scripts/make-admin.ts you@example.com
import { MongoClient } from "mongodb";
import "dotenv/config";

async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("Usage: npx tsx scripts/make-admin.ts you@example.com");

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set — add it to .env.local first.");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "knightnovel");

  const result = await db.collection("users").updateOne({ email }, { $set: { role: "admin" } });
  if (result.matchedCount === 0) {
    console.log(`No user found with email ${email}. Sign in / sign up first, then run this again.`);
  } else {
    console.log(`${email} is now an admin.`);
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
