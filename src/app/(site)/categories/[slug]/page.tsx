import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrowseResults } from "@/components/browse";
import { getBooks, getCategory, parsePage, parseSort, str } from "@/lib/api";

const PAGE_SIZE = 12;

export async function generateMetadata(props: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const c = await getCategory((await props.params).slug);
  return { title: c?.name ?? "Category", description: c?.description };
}

export default async function CategoryPage(props: PageProps<"/categories/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const sort = parseSort(sp.sort) ?? "popular";
  const page = parsePage(sp.page);
  const q = str(sp.q);

  const category = await getCategory(slug);
  if (!category) notFound();
  const res = await getBooks({ category: slug, sort, page, q, pageSize: PAGE_SIZE });

  return (
    <main className="container-page py-10">
      <nav className="mb-8 flex items-center gap-2 text-xs font-medium text-forest-900" aria-label="Breadcrumb">
        <Link href="/categories" className="hover:underline">← Categories</Link>
        <span className="text-muted">/</span>
        <span>{category.name}</span>
      </nav>
      <span className="pill">{category.bookCount.toLocaleString()} title{category.bookCount === 1 ? "" : "s"} available</span>
      <h1 className="mt-4 font-display text-5xl text-forest-800 sm:text-6xl">{category.name}</h1>
      {category.description && <p className="mt-4 max-w-2xl leading-relaxed text-forest-900">{category.description}</p>}
      <div className="mt-10">
        <BrowseResults
          basePath={`/categories/${slug}`}
          books={res.items}
          total={res.total}
          page={page}
          pageSize={PAGE_SIZE}
          sort={sort}
          q={q}
          emptyText={q ? `No ${category.name} books match “${q}”.` : `No ${category.name} books yet — check back soon.`}
        />
      </div>
    </main>
  );
}
