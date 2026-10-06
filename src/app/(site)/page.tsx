import Link from "next/link";
import { BookCard, Shelf } from "@/components/book-card";
import { Cover } from "@/components/cover";
import { CategoryTile } from "@/components/category-tile";
import { getBookOfTheDay, getBooks, getCategories } from "@/lib/api";

export default async function Home() {
  const [all, trendingRes, latest, free, categories, bookOfTheDay] = await Promise.all([
    getBooks({ pageSize: 1 }),
    getBooks({ trending: true, pageSize: 8 }),
    getBooks({ sort: "new", pageSize: 12 }),
    getBooks({ free: true, sort: "rating", pageSize: 12 }),
    getCategories(),
    getBookOfTheDay(),
  ]);
  // Fall back to the most popular books until the admin flags some as trending.
  const trending = trendingRes.items.length ? trendingRes.items : (await getBooks({ sort: "popular", pageSize: 8 })).items;
  const featured = bookOfTheDay ?? trending[0] ?? latest.items[0] ?? null;
  const collage = [featured, ...trending, ...latest.items].filter((b, i, arr) => b && arr.findIndex((x) => x?.id === b.id) === i).slice(0, 3);
  const genres = categories.filter((c) => c.bookCount > 0).slice(0, 3);
  const shownGenres = genres.length ? genres : categories.slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="container-page grid items-center gap-12 pb-16 pt-10 md:pt-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="pill bg-forest-800 text-white">{all.total.toLocaleString()} titles available</span>
          <h1 className="mt-6 font-display text-6xl leading-[0.95] text-forest-800 sm:text-7xl lg:text-8xl">
            Your
            <br />
            Digital Library
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-forest-900">
            Describe a scene, select a genre, or dive straight into timeless literary masterpieces. Readly brings a
            hand-curated world of e-books right to your fingertips.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/discover" className="btn-primary">Explore Library</Link>
            <Link href="/categories" className="btn-outline">Browse Categories</Link>
          </div>
        </div>

        {featured ? (
          <div className="relative mx-auto h-[400px] w-[86%] max-w-md sm:h-[460px] sm:w-full">
            {collage[1] && (
              <div className="absolute left-0 top-6 aspect-[2/3] w-40 -rotate-6 overflow-hidden rounded-2xl border-[6px] border-white shadow-xl sm:w-44">
                <Cover book={collage[1]} />
              </div>
            )}
            {collage[2] && (
              <div className="absolute bottom-6 left-10 aspect-[2/3] w-32 rotate-3 overflow-hidden rounded-2xl border-[6px] border-white shadow-xl sm:w-36">
                <Cover book={collage[2]} />
              </div>
            )}
            <div className="absolute right-0 top-0 aspect-[2/3] w-56 overflow-hidden rounded-2xl border-[6px] border-white shadow-2xl sm:w-64">
              <Cover book={featured} size="full" priority />
            </div>
            <Link
              href={`/books/${featured.slug}`}
              className="absolute bottom-0 right-4 w-60 rounded-2xl bg-white p-5 shadow-xl transition hover:-translate-y-0.5"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest-700">Book of the day</p>
              <p className="mt-1 font-display text-2xl leading-tight text-forest-800">{featured.title}</p>
              {featured.author && <p className="mt-1 text-xs text-muted">By {featured.author}</p>}
            </Link>
          </div>
        ) : (
          <div className="grid h-80 place-items-center rounded-3xl border-2 border-dashed border-cream-300 text-center text-muted">
            <p>The library is being stocked.<br />Books uploaded in the admin will appear here.</p>
          </div>
        )}
      </section>

      {/* Stats band */}
      <section className="bg-forest-800 text-white">
        <div className="container-page grid grid-cols-2 gap-y-8 py-12 text-center md:grid-cols-4">
          {[
            [all.total.toLocaleString(), "E-books available"],
            [String(categories.length), "Curated genres"],
            ["24/7", "Instant access"],
            ["EPUB", "Beautiful reflowable reading"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-4xl text-cream-50 sm:text-5xl">{v}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-100/80">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our story */}
      <section id="our-story" className="bg-forest-800 pb-20 text-white">
        <div className="container-page">
          <p className="eyebrow text-center text-forest-100/80">Our story</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-center font-display text-4xl sm:text-5xl">
            Bringing accessible stories to a modern digital landscape.
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="relative min-h-72 overflow-hidden rounded-3xl bg-gradient-to-br from-forest-600 to-forest-950 p-8">
              <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gold/20 blur-2xl" />
              <div className="relative flex h-full items-end gap-3">
                {latest.items.slice(0, 4).map((b, i) => (
                  <div key={b.id} className="aspect-[2/3] w-1/4 overflow-hidden rounded-lg shadow-lg" style={{ transform: `translateY(${-i * 10}px)` }}>
                    <Cover book={b} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/15 p-8 sm:p-10">
              <span className="pill border-white/20 bg-white/5 text-white">Our mission</span>
              <p className="mt-6 leading-relaxed text-forest-50/90">
                Readly was founded by a collective of book collectors, publishers, and technologists who believed digital
                reading should be immersive, comfortable, and beautifully curated. We champion classical literature
                alongside contemporary indie authors, striving to build a sanctuary for book lovers online.
              </p>
              <p className="mt-4 leading-relaxed text-forest-50/90">
                Whether you’re cozying up on a rainy Sunday or reading on your morning commute, our platform is designed
                to make the stories you love both immediate and gorgeous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Genres */}
      {shownGenres.length > 0 && (
        <section className="container-page py-20 text-center">
          <p className="eyebrow">Browse genres</p>
          <h2 className="mt-3 font-display text-4xl text-forest-800 sm:text-5xl">Discover curated spaces for every kind of reader</h2>
          <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
            {shownGenres.map((c) => (
              <CategoryTile key={c.id} category={c} />
            ))}
          </div>
          <Link href="/categories" className="btn-outline mt-10">See All Categories</Link>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="bg-cream-50 py-20">
          <div className="container-page text-center">
            <p className="eyebrow">Trending now</p>
            <h2 className="mt-3 font-display text-4xl text-forest-800 sm:text-5xl">Captivating titles that everyone is talking about</h2>
            <div className="mt-12 grid grid-cols-2 gap-4 text-left sm:gap-6 lg:grid-cols-4">
              {trending.slice(0, 4).map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shelves */}
      <div className="container-page space-y-16 pt-20">
        {free.items.length > 0 && <ShelfSection title="Free to read" href="/discover?free=1" books={free.items} />}
        {latest.items.length > 0 && <ShelfSection title="New releases" href="/discover?sort=new" books={latest.items} />}
      </div>
    </main>
  );
}

function ShelfSection({ title, href, books }: { title: string; href: string; books: import("@/lib/api").Book[] }) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-3xl text-forest-800 sm:text-4xl">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-forest-700 hover:underline">See all →</Link>
      </div>
      <Shelf books={books} label={title} />
    </section>
  );
}
