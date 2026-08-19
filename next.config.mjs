/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  // Allow the local Python scraper server (port 7832) and the Vite scraper
  // dashboard (port 5174) to call /api/scraper/* routes directly.
  // The browser dashboard uses the Vite proxy so CORS is normally avoided,
  // but the Python server posts server-to-server and needs these headers.
  async headers() {
    return [
      {
        source: "/api/scraper/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,x-scraper-key" },
        ],
      },
    ];
  },
};

export default nextConfig;
