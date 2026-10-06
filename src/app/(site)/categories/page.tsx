import type { Metadata } from "next";
import Link from "next/link";
import { BookCard } from "@/components/book-card";
import { CategoryTile } from "@/components/category-tile";
import { getBooks, getCategories } from "@/lib/api";

export const metadata: Metadata = { title: "All Categories" };

export default async function CategoriesPage() {
  const [categories, trendingRes, staffRes] = await Promise.all([
    getCategories(),
    getBooks({ trending: true, pageSize: 3 }),
    getBooks({ staffPick: true, pageSize: 3 }),
  ]);
  const trending = trendingRes.items.length ? trendingRes.items : (await getBooks({ sort: "popular", pageSize: 3 })).items;

  return (
    <main>
      {/* Hero (Figma: all-categories-page) */}
      <section className="bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 text-white">
        <div className="container-page py-14 sm:py-20">
          <span className="pill border-white/20 bg-white/10 text-white">Hand-curated genre catalog</span>
          <h1 className="mt-6 max-w-2xl font-display text-5xl leading-tight sm:text-6xl">Explore our literary spaces</h1>
          <p className="mt-4 max-w-xl leading-relaxed text-forest-50/85">
            From timeless classical masterpieces to groundbreaking contemporary works, select a genre to begin your next
            reading journey inside tailored digital environments.
          </p>
          <form action="/discover" className="mt-8 max-w-xl">
            <label className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm text-ink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden>
                <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input name="q" placeholder="Search for books, authors, or genres..." className="flex-1 bg-transparent outline-none placeholder:text-muted" />
            </label>
          </form>
        </div>
      </section>

      <div className="container-page mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="hidden self-start rounded-2xl bg-forest-800 p-6 text-white lg:block">
          <h2 className="font-display text-2xl">Browse by category</h2>
          <p className="mt-1 text-xs text-forest-100/80">Jump between curated collections.</p>
          <nav className="mt-5 flex flex-col">
            {categories.map((c) => (
              <Link key={c.id} href={`/categories/${c.slug}`} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-white/10">
                {c.name}
                <span className="text-xs text-forest-100/70">{c.bookCount}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="space-y-12">
          {trending.length > 0 && (
            <BookRow title="Trending Now" subtitle="Popular titles readers are discovering this week across the library." href="/discover?trending=1" books={trending} />
          )}
          {staffRes.items.length > 0 && (
            <BookRow title="Staff Picks" subtitle="Hand-picked favourites from our librarians." href="/discover?staffPick=1" books={staffRes.items} />
          )}
          <section>
            <h2 className="mb-6 font-display text-3xl text-forest-800">All categories</h2>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((c) => (
                <CategoryTile key={c.id} category={c} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function BookRow({ title, subtitle, href, books }: { title: string; subtitle: string; href: string; books: import("@/lib/api").Book[] }) {
  return (
    <section className="rounded-3xl border border-cream-200 bg-cream-50 p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-forest-800">{title}</h2>
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        </div>
        <Link href={href} className="shrink-0 text-xs font-semibold text-forest-800 hover:underline">See More →</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}
