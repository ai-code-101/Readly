/* eslint-disable @next/next/no-img-element -- category images are served by the Readly API */
import Link from "next/link";
import type { Category } from "@/lib/api";

/** Genre card with image, label, count and description (Figma: "Browse genres"). */
export function CategoryTile({ category: c }: { category: Category }) {
  return (
    <Link href={`/categories/${c.slug}`} className="group overflow-hidden rounded-2xl border border-cream-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden bg-forest-800">
        {c.imageUrl ? (
          <img src={c.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-forest-700 to-forest-950">
            <span className="font-display text-4xl text-cream-50/90">{c.name}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-forest-700">{c.name}</span>
          <span className="text-xs text-muted">{c.bookCount.toLocaleString()} title{c.bookCount === 1 ? "" : "s"}</span>
        </div>
        <h3 className="mt-3 font-display text-2xl text-forest-800">{c.name}</h3>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{c.description}</p>
      </div>
    </Link>
  );
}
