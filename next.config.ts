import type { NextConfig } from "next";

const API_URL = process.env.READLY_API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  // Book covers, category images and EPUB files are referenced with relative
  // /api/v1/... URLs; forward those to the Go API so they are same-origin.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
};

export default nextConfig;
