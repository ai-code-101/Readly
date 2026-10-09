// Same-origin proxy to the Readly API for the browser: book covers, category
// images, EPUB files, sign-in and progress. Replaces a plain next.config
// rewrite so we can add headers (see UPSTREAM_HEADERS) and pass cookies through
// reliably on any host (Netlify, Vercel, a VPS…).
import type { NextRequest } from "next/server";
import { API_URL, UPSTREAM_HEADERS } from "@/lib/upstream";

export const dynamic = "force-dynamic";

const REQUEST_HEADERS = ["content-type", "content-length", "cookie", "authorization", "range", "if-none-match", "if-modified-since", "accept"];
const RESPONSE_HEADERS = [
  "content-type", "content-length", "content-range", "accept-ranges",
  "etag", "last-modified", "cache-control", "retry-after", "x-content-type-options",
];

async function proxy(req: NextRequest, ctx: RouteContext<"/api/v1/[...path]">) {
  const { path } = await ctx.params;
  // The admin API is never exposed through the public platform.
  if (path[0] === "admin") return Response.json({ error: "not found" }, { status: 404 });

  const target = `${API_URL}/api/v1/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
  const headers = new Headers(UPSTREAM_HEADERS);
  for (const h of REQUEST_HEADERS) {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  }
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) headers.set("x-forwarded-for", fwd);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      ...(hasBody ? { duplex: "half" } : {}),
      cache: "no-store",
      redirect: "manual",
    } as RequestInit);
  } catch {
    return Response.json({ error: "The library is temporarily unavailable. Please try again." }, { status: 502 });
  }

  const out = new Headers();
  for (const h of RESPONSE_HEADERS) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  for (const c of upstream.headers.getSetCookie()) out.append("set-cookie", c);
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export { proxy as GET, proxy as HEAD, proxy as POST, proxy as PUT, proxy as DELETE };
