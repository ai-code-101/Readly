import type { NextConfig } from "next";

// Browser requests to /api/v1/* (covers, EPUBs, sign-in, progress) are proxied
// to the Readly API by src/app/api/v1/[...path]/route.ts (READLY_API_URL).
const nextConfig: NextConfig = {
  async redirects() {
    // The old all-categories page was replaced by /browse (Figma "Readly Browse").
    // Readly is paid with airtime only; the M-Pesa and card screens were removed.
    return [
      { source: "/categories", destination: "/browse", permanent: false },
      { source: "/subscription/checkout/:method(mpesa|card)", destination: "/subscription/checkout", permanent: false },
    ];
  },
};

export default nextConfig;
