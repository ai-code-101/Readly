import type { NextConfig } from "next";

// Browser requests to /api/v1/* (covers, EPUBs, sign-in, progress) are proxied
// to the Readly API by src/app/api/v1/[...path]/route.ts (READLY_API_URL).
const nextConfig: NextConfig = {};

export default nextConfig;
