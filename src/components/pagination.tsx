import Link from "next/link";

/** Numbered pagination that preserves the current query string. */
export function Pagination({ page, pages, params, basePath }: { page: number; pages: number; params: Record<string, string>; basePath: string }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams({ ...params, page: String(p) });
    if (p === 1) qs.delete("page");
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const nums = new Set([1, 2, 3, page - 1, page, page + 1, pages].filter((n) => n >= 1 && n <= pages));
  const sorted = [...nums].sort((a, b) => a - b);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
      {page > 1 && (
        <Link href={href(page - 1)} className="rounded-full border border-forest-800 px-4 py-1.5 font-medium text-forest-800">← Prev</Link>
      )}
      {sorted.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - sorted[i - 1] > 1 && <span className="text-muted">…</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={`grid h-9 min-w-9 place-items-center rounded-full px-2 font-medium ${n === page ? "bg-forest-800 text-white" : "text-forest-900 hover:bg-cream-200"}`}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className="rounded-full border border-forest-800 px-4 py-1.5 font-medium text-forest-800">Next →</Link>
      )}
    </nav>
  );
}
