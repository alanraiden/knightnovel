import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "knightnovel";

if (!uri) {
  // Intentionally not thrown at import time in dev so the app can still
  // render pages backed by seed data before MONGODB_URI is configured.
  console.warn(
    "[db] MONGODB_URI is not set. API routes that touch MongoDB will fail until it is configured in .env.local."
  );
}

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (process.env.NODE_ENV === "development") {
    // Reuse the client across HMR reloads in dev.
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const c = await getClientPromise();
  return c.db(dbName);
}

// Exposed for the NextAuth MongoDB adapter, which wants a bare
// Promise<MongoClient> (not wrapped in getDb()). Reuses the same singleton
// connection as everything else in this file.
export function getMongoClientPromise(): Promise<MongoClient> {
  return getClientPromise();
}

// Convenience collection getters — keeps collection names in one place.
export async function collections() {
  const db = await getDb();
  return {
    users: db.collection("users"),
    novels: db.collection("novels"),
    chapters: db.collection("chapters"),
    readingProgress: db.collection("readingProgress"),
    bookmarks: db.collection("bookmarks"),
    favorites: db.collection("favorites"),
    folders: db.collection("folders"),
    ratingsReviews: db.collection("ratingsReviews"),
    comments: db.collection("comments"),
    commentVotes: db.collection("commentVotes"),
    reports: db.collection("reports"), // covers reported comments, reviews, users, AND reported stickers
    notifications: db.collection("notifications"),
    announcements: db.collection("announcements"),
    settings: db.collection("settings"),
  };
}
