import Link from "next/link";
import type { Book, BookQuery } from "@/lib/api";
import { SORTS } from "@/lib/api";
import { BookCard } from "./book-card";
import { Pagination } from "./pagination";

/** Sort pills + search + paginated grid, shared by category and discover pages (Figma: fiction-category-page). */
export function BrowseResults({
  basePath,
  books,
  total,
  page,
  pageSize,
  sort,
  q,
  extraParams = {},
  emptyText,
}: {
  basePath: string;
  books: Book[];
  total: number;
  page: number;
  pageSize: number;
  sort: NonNullable<BookQuery["sort"]>;
  q: string;
  extraParams?: Record<string, string>;
  emptyText: string;
}) {
  const params: Record<string, string> = { ...extraParams };
  if (sort !== "popular") params.sort = sort;
  if (q) params.q = q;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const sortHref = (s: string) => {
    const qs = new URLSearchParams({ ...extraParams, ...(q ? { q } : {}) });
    if (s !== "popular") qs.set("sort", s);
    const str = qs.toString();
    return str ? `${basePath}?${str}` : basePath;
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {SORTS.map((s) => (
          <Link
            key={s.value}
            href={sortHref(s.value)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              sort === s.value ? "border-forest-800 bg-forest-800 text-white" : "border-forest-800/60 text-forest-800 hover:bg-forest-50"
            }`}
          >
            {s.label}
          </Link>
        ))}
        <p className="ml-auto text-xs text-muted">
          Showing <span className="font-semibold text-ink">{from}–{to}</span> of {total.toLocaleString()}
        </p>
      </div>

      <form action={basePath} className="mt-5">
        {Object.entries(extraParams).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        {sort !== "popular" && <input type="hidden" name="sort" value={sort} />}
        <label className="flex items-center gap-3 rounded-2xl border border-cream-200 bg-white px-5 py-3.5 text-sm focus-within:border-forest-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden>
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input name="q" defaultValue={q} placeholder="Search for books, authors, or genres..." className="flex-1 bg-transparent outline-none placeholder:text-muted" />
        </label>
      </form>

      {books.length === 0 ? (
        <p className="py-24 text-center text-muted">{emptyText}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {books.map((b, i) => (
            <BookCard key={b.id} book={b} priority={i < 4} />
          ))}
        </div>
      )}
      <Pagination page={page} pages={pages} params={params} basePath={basePath} />
    </>
  );
}
