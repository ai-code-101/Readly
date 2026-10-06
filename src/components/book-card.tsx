import Link from "next/link";
import type { Book } from "@/lib/api";
import { Cover } from "./cover";
import { Rating } from "./rating";

/** Grid card used on category, discover and search pages. */
export function BookCard({ book, priority }: { book: Book; priority?: boolean }) {
  return (
    <Link
      href={`/books/${book.slug}`}
      className="group flex flex-col rounded-2xl border border-cream-200 bg-white p-2.5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-forest-900/5"
    >
      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-cream-200">
        <Cover book={book} priority={priority} className="transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {book.genreTag || book.category ? (
            <span className="truncate rounded-full bg-forest-50 px-2 py-0.5 text-[11px] font-medium text-forest-700">
              {book.genreTag || book.category?.name}
            </span>
          ) : (
            <span />
          )}
          <Rating value={book.rating} />
        </div>
        <h3 className="font-display text-lg leading-snug text-ink group-hover:text-forest-700">{book.title}</h3>
        {book.author && <p className="mt-0.5 text-xs text-muted">by {book.author}</p>}
        {book.isFree && <span className="mt-2 w-fit rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest-900">Free</span>}
      </div>
    </Link>
  );
}

/** Compact cover-first card used in horizontal shelves (Trending, You May Also Like). */
export function ShelfCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.slug}`} className="group block w-36 shrink-0 snap-start sm:w-44">
      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-cream-200 shadow-md shadow-forest-900/10">
        <Cover book={book} className="transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-forest-700">{book.category?.name ?? book.genreTag}</p>
      <h3 className="line-clamp-2 font-display text-base leading-snug text-ink">{book.title}</h3>
      <p className="truncate text-xs text-muted">{book.author}</p>
      <Rating value={book.rating} className="mt-1" />
    </Link>
  );
}

export function Shelf({ books, label }: { books: Book[]; label: string }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6" aria-label={label}>
      <div className="flex snap-x gap-4 sm:gap-6">
        {books.map((b) => (
          <ShelfCard key={b.id} book={b} />
        ))}
      </div>
    </div>
  );
}
