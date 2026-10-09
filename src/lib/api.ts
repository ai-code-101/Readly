// Server-side data access for the Readly API.
import "server-only";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  bookCount: number;
  imageUrl: string;
};

export type Book = {
  id: string;
  title: string;
  slug: string;
  author: string;
  synopsis: string;
  language: string;
  genreTag: string;
  category: { id: string; name: string; slug: string } | null;
  rating: number;
  pageCount: number;
  wordCount: number;
  isFree: boolean;
  isTrending: boolean;
  isStaffPick: boolean;
  isBookOfTheDay: boolean;
  publishedAt: string | null;
  coverUrl: string;
  thumbUrl: string;
  epubUrl: string;
};

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

export type BookQuery = {
  category?: string;
  q?: string;
  sort?: "popular" | "new" | "rating" | "title";
  trending?: boolean;
  staffPick?: boolean;
  free?: boolean;
  page?: number;
  pageSize?: number;
};

import { unstable_rethrow } from "next/navigation";
import { API_URL, UPSTREAM_HEADERS } from "./upstream";

class NotFound extends Error {}

async function get<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, { cache: "no-store", headers: UPSTREAM_HEADERS });
  } catch (e) {
    unstable_rethrow(e); // let Next.js's own control-flow errors through
    throw new Error(`Cannot reach the Readly API at ${API_URL} (${(e as Error).message})`);
  }
  if (res.status === 404) throw new NotFound(path);
  if (!res.ok) throw new Error(`Readly API ${res.status} for ${path}`);
  if (!res.headers.get("content-type")?.includes("application/json")) {
    // e.g. a tunnel or proxy answering with an HTML page instead of the API
    throw new Error(`Readly API at ${API_URL} returned ${res.headers.get("content-type") || "no content type"} for ${path}, expected JSON`);
  }
  return res.json() as Promise<T>;
}

/** Like get, but resolves to null on 404. */
async function maybe<T>(path: string): Promise<T | null> {
  try {
    return await get<T>(path);
  } catch (e) {
    if (e instanceof NotFound) return null;
    throw e;
  }
}

export const getCategories = () => get<Category[]>("/categories");
export const getCategory = (slug: string) => maybe<Category>(`/categories/${encodeURIComponent(slug)}`);
export const getBook = (slug: string) => maybe<Book>(`/books/${encodeURIComponent(slug)}`);
export const getRelated = (slug: string, limit = 8) =>
  get<Book[]>(`/books/${encodeURIComponent(slug)}/related?limit=${limit}`);
export const getBookOfTheDay = () => maybe<Book>("/featured/book-of-the-day");

export function getBooks(q: BookQuery = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v !== undefined && v !== "" && v !== false) qs.set(k, String(v));
  }
  return get<Page<Book>>(`/books?${qs}`);
}

export const SORTS = [
  { value: "popular", label: "Most Popular" },
  { value: "new", label: "New Releases" },
  { value: "rating", label: "Highest Rated" },
  { value: "title", label: "A-Z" },
] as const;

export function parseSort(v: string | string[] | undefined): BookQuery["sort"] {
  return SORTS.some((s) => s.value === v) ? (v as BookQuery["sort"]) : "popular";
}

export function parsePage(v: string | string[] | undefined) {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function str(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}
