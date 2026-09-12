import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knightnovel.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Knight Novel — Read web novels, together",
    template: "%s · Knight Novel",
  },
  description:
    "Discover, read, and discuss web novels on Knight Novel — a community-first reading platform.",
  // Static SVG favicon — served from public/favicon.svg.
  // Using a static file avoids the ImageResponse / @vercel/og route which
  // fails on Windows dev (Invalid URL in font path resolution).
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Knight Novel",
  },
  // Google AdSense site ownership verification
  other: {
    "google-adsense-account": "ca-pub-9481193991721439",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google AdSense — loads after page is interactive so it never blocks rendering */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9481193991721439"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <Navbar />
          <main className="pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
