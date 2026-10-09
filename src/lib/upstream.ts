import "server-only";

/** Base URL of the Readly API (no trailing slash). */
export const API_URL = (process.env.READLY_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

/**
 * Headers sent with every request to the API. `ngrok-skip-browser-warning`
 * stops free ngrok tunnels from answering with their HTML warning page
 * (which breaks images, JSON and EPUB downloads); other hosts ignore it.
 */
export const UPSTREAM_HEADERS: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
  "User-Agent": "readly-platform",
};
