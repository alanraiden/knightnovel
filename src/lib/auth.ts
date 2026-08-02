import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import { collections, getMongoClientPromise } from "@/lib/db";

// The adapter persists OAuth (Google) sign-ins as real MongoDB documents
// with a real ObjectId — without it, Google users would never get a users
// collection record, which breaks both admin role-checking and any
// per-user query (bookmarks, reading progress, etc). It's only wired up
// when MONGODB_URI is actually set, so local dev without a database still
// works (Google login just won't persist a user in that case).
const adapter = process.env.MONGODB_URI ? MongoDBAdapter(getMongoClientPromise()) : undefined;

export const authOptions: NextAuthOptions = {
  adapter,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { users } = await collections();
        const user = await users.findOne({ email: credentials.email });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id!.toString(),
          email: user.email,
          name: user.displayName,
          image: user.avatarUrl,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? "user";
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role ?? "user";
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
