/* eslint-disable @next/next/no-img-element -- covers are served (and cached) by the Readly API */
import type { Book } from "@/lib/api";

const PLACEHOLDER_TONES = ["#0b4a3b", "#11604d", "#3f3a2f", "#5b3a29", "#27374d", "#4a2f45"];

/** A book cover, or a typographic placeholder when the book has none. */
export function Cover({
  book,
  size = "thumb",
  className = "",
  priority = false,
}: {
  book: Pick<Book, "title" | "author" | "coverUrl" | "thumbUrl" | "slug">;
  size?: "thumb" | "full";
  className?: string;
  priority?: boolean;
}) {
  const src = size === "full" ? book.coverUrl : book.thumbUrl;
  if (src) {
    return (
      <img
        src={src}
        alt={`Cover of ${book.title}`}
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const tone = PLACEHOLDER_TONES[[...book.slug].reduce((a, c) => a + c.charCodeAt(0), 0) % PLACEHOLDER_TONES.length];
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-between p-4 text-center text-white ${className}`}
      style={{ background: `linear-gradient(160deg, ${tone}, #052e25)` }}
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">{book.author}</span>
      <span className="font-display text-xl leading-tight">{book.title}</span>
      <span className="h-px w-8 bg-gold" />
    </div>
  );
}
