import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knightnovel.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/profile", "/login", "/signup", "/notifications"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
