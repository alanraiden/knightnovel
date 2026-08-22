// Next.js App Router built-in favicon generation.
// This file is automatically picked up as the tab icon (favicon) for all pages.
// Using ImageResponse produces a PNG at the requested sizes — no separate
// favicon.ico or <link rel="icon"> tag needed.
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: "#0A0F1C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Shield SVG — same mark as the navbar fallback icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.5 3.5 5.5v5.8c0 4.8 3.6 8.4 8.5 10.5 4.9-2.1 8.5-5.7 8.5-10.5V5.5L12 2.5Z"
            fill="#1E2D48"
            stroke="#D4A35F"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M9 9.5h6M9 12.5h6M9 15.5h4"
            stroke="#D4A35F"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
