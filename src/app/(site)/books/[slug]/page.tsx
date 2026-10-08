import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shelf } from "@/components/book-card";
import { BookActions } from "@/components/book-actions";
import { Cover } from "@/components/cover";
import { Rating } from "@/components/rating";
import { getBook, getRelated } from "@/lib/api";

export async function generateMetadata(props: PageProps<"/books/[slug]">): Promise<Metadata> {
  const b = await getBook((await props.params).slug);
  if (!b) return { title: "Book not found" };
  return { title: `${b.title}${b.author ? ` by ${b.author}` : ""}`, description: b.synopsis.slice(0, 160) };
}

export default async function BookPage(props: PageProps<"/books/[slug]">) {
  const { slug } = await props.params;
  const book = await getBook(slug);
  if (!book) notFound();
  const related = await getRelated(slug, 10);
  const paragraphs = book.synopsis.split(/\n\s*\n|\n/).filter(Boolean);
  const readingHours = book.wordCount ? Math.max(1, Math.round(book.wordCount / 250 / 60)) : null;

  return (
    <main className="container-page py-8 sm:py-12">
      <Link href={book.category ? `/categories/${book.category.slug}` : "/discover"} className="text-sm font-medium text-forest-800 hover:underline">
        ← {book.category?.name ?? "Discover"}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(220px,320px)_1fr] lg:gap-16">
        <div className="mx-auto w-56 sm:w-64 md:w-full">
          <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-2xl shadow-forest-900/20">
            <Cover book={book} size="full" priority />
          </div>
        </div>

        <div className="text-center md:text-left">
          <h1 className="font-display text-4xl leading-tight text-forest-800 sm:text-5xl">{book.title}</h1>
          {book.author && <p className="mt-2 text-lg text-muted">{book.author}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Rating value={book.rating} className="text-sm" />
            {book.category && (
              <Link href={`/categories/${book.category.slug}`} className="rounded-full bg-forest-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-forest-700">
                {book.category.name}
              </Link>
            )}
            {book.genreTag && <span className="text-xs text-muted">{book.genreTag}</span>}
            {book.isFree && <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-bold uppercase text-forest-900">Free</span>}
          </div>

          <dl className="mx-auto mt-6 grid max-w-md grid-cols-3 divide-x divide-cream-300 rounded-2xl border border-cream-200 bg-white py-3 text-center md:mx-0">
            <div><dt className="text-[11px] uppercase tracking-wider text-muted">Pages</dt><dd className="font-display text-2xl text-forest-800">{book.pageCount || "—"}</dd></div>
            <div><dt className="text-[11px] uppercase tracking-wider text-muted">Reading time</dt><dd className="font-display text-2xl text-forest-800">{readingHours ? `${readingHours}h` : "—"}</dd></div>
            <div><dt className="text-[11px] uppercase tracking-wider text-muted">Language</dt><dd className="font-display text-2xl uppercase text-forest-800">{book.language.split("-")[0] || "—"}</dd></div>
          </dl>

          <div className="mt-8">
            <BookActions
              book={{ slug: book.slug, title: book.title, author: book.author, thumbUrl: book.thumbUrl }}
              canRead={!!book.epubUrl}
              isFree={book.isFree}
            />
          </div>

          {paragraphs.length > 0 && (
            <section className="mt-10 text-left">
              <h2 className="text-lg font-bold text-forest-800">Synopsis</h2>
              <div className="mt-3 space-y-4 font-reading text-[17px] leading-relaxed text-ink/85">
                {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl text-forest-800">You May Also Like</h2>
            {book.category && <Link href={`/categories/${book.category.slug}`} className="text-xs font-semibold uppercase tracking-wider text-forest-700 hover:underline">See all</Link>}
          </div>
          <Shelf books={related} label="You may also like" />
        </section>
      )}
    </main>
  );
}
