import Link from "next/link";
import type { Book, Category } from "@/lib/api";
import { getBooks, getCategories } from "@/lib/api";
import { Cover } from "@/components/cover";
import { Rating } from "@/components/rating";
import { HomeGreeting } from "@/components/home-greeting";

// Platform home (Figma: "Home" / "Subscription - Home"): search, today's
// trending books, then a shelf per category.
export default async function Home() {
  const [trendingRes, categories] = await Promise.all([getBooks({ trending: true, pageSize: 12 }), getCategories()]);
  const trendingToday = trendingRes.items.length > 0;
  const trending = trendingToday ? trendingRes.items : (await getBooks({ sort: "popular", pageSize: 12 })).items;
  const withBooks = categories.filter((c) => c.bookCount > 0);
  const shelves = await Promise.all(
    withBooks.map(async (c) => ({ category: c, books: (await getBooks({ category: c.slug, sort: "popular", pageSize: 12 })).items })),
  );

  return (
    <main className="pb-6">
      <div className="container-page pt-5">
        <form action="/discover" className="mx-auto max-w-2xl">
          <label className="flex items-center gap-3 rounded-full border border-cream-300 bg-white px-5 py-3 text-sm shadow-sm focus-within:border-forest-700">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-forest-700" aria-hidden />
            <input name="q" placeholder="Search books, authors, or genres..." aria-label="Search books" className="flex-1 bg-transparent outline-none placeholder:text-muted" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden>
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
          </label>
        </form>
        <HomeGreeting />
      </div>

      {/* Trending */}
      <section className="mt-6 bg-forest-800 py-8 text-white">
        <div className="container-page">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest-100/80">{trendingToday ? "Trending now" : "Popular now"}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">What everyone is reading</h1>
          {trending.length === 0 ? (
            <p className="mt-6 text-sm text-forest-100/80">New books are on their way — check back soon.</p>
          ) : (
            <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
              <div className="flex snap-x gap-4">
                {trending.map((b) => (
                  <TrendingCard key={b.id} book={b} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Library */}
      <section className="container-page mt-8">
        <h2 className="text-xl font-bold text-forest-800">LIBRARY</h2>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Browse our categories</p>
        <div className="mt-5 space-y-5">
          {shelves.map(({ category, books }, i) => (
            <CategoryShelf key={category.id} category={category} books={books} dark={i % 2 === 0} />
          ))}
          {shelves.length === 0 && <p className="py-10 text-center text-sm text-muted">No books have been published yet.</p>}
        </div>
      </section>
    </main>
  );
}

function TrendingCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.slug}`} className="group w-36 shrink-0 snap-start sm:w-44">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-forest-700 shadow-lg shadow-black/20">
        <Cover book={book} className="transition duration-500 group-hover:scale-[1.03]" />
        {book.isFree && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-forest-950">Free</span>}
      </div>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-forest-100/80">{book.category?.name ?? book.genreTag}</p>
      <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{book.title}</h3>
      <p className="truncate text-xs text-forest-100/70">by {book.author}</p>
      {book.rating > 0 && <Rating value={book.rating} className="mt-0.5 !text-white" />}
    </Link>
  );
}

function CategoryShelf({ category, books, dark }: { category: Category; books: Book[]; dark: boolean }) {
  return (
    <section className={`rounded-2xl p-4 sm:p-5 ${dark ? "bg-forest-800 text-white" : "border border-cream-200 bg-white"}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-sm font-bold uppercase tracking-wider ${dark ? "text-white" : "text-forest-800"}`}>{category.name}</h3>
        <Link href={`/categories/${category.slug}`} className={`text-xs font-semibold ${dark ? "text-forest-100" : "text-forest-700"} hover:underline`}>
          See all
        </Link>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
        <div className="flex gap-3">
          {books.map((b) => (
            <Link key={b.id} href={`/books/${b.slug}`} className="group relative block w-24 shrink-0 sm:w-28" title={b.title}>
              <div className="aspect-[2/3] overflow-hidden rounded-lg bg-cream-200 shadow-md">
                <Cover book={b} className="transition duration-500 group-hover:scale-[1.04]" />
              </div>
              {b.isFree && <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-forest-950">Free</span>}
              <p className={`mt-1.5 line-clamp-1 text-xs font-medium ${dark ? "text-white/90" : "text-ink"}`}>{b.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
