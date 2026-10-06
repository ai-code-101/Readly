import type { Metadata } from "next";
import { BrowseResults } from "@/components/browse";
import { getBooks, parsePage, parseSort, str } from "@/lib/api";

export const metadata: Metadata = { title: "Discover" };

const PAGE_SIZE = 12;

export default async function DiscoverPage(props: PageProps<"/discover">) {
  const sp = await props.searchParams;
  const sort = parseSort(sp.sort) ?? "popular";
  const page = parsePage(sp.page);
  const q = str(sp.q);
  const trending = str(sp.trending) === "1";
  const staffPick = str(sp.staffPick) === "1";
  const free = str(sp.free) === "1";

  const res = await getBooks({ q, sort, page, trending, staffPick, free, pageSize: PAGE_SIZE });

  const extra: Record<string, string> = {};
  if (trending) extra.trending = "1";
  if (staffPick) extra.staffPick = "1";
  if (free) extra.free = "1";

  const title = q ? `Results for “${q}”` : staffPick ? "Staff Picks" : trending ? "Trending Now" : free ? "Free to Read" : "Discover";
  const blurb = staffPick
    ? "Hand-picked favourites from our librarians."
    : trending
      ? "Popular titles readers are discovering right now."
      : free
        ? "Books you can start reading straight away."
        : "Every book in the Readly library — search, sort and find your next read.";

  return (
    <main className="container-page py-10">
      <span className="pill">{res.total.toLocaleString()} title{res.total === 1 ? "" : "s"}</span>
      <h1 className="mt-4 font-display text-5xl text-forest-800 sm:text-6xl">{title}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-forest-900">{blurb}</p>
      <div className="mt-10">
        <BrowseResults
          basePath="/discover"
          books={res.items}
          total={res.total}
          page={page}
          pageSize={PAGE_SIZE}
          sort={sort}
          q={q}
          extraParams={extra}
          emptyText={q ? `No books match “${q}”. Try a different title, author or genre.` : "No books here yet."}
        />
      </div>
    </main>
  );
}
