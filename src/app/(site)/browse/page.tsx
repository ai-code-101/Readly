import type { Metadata } from "next";
import { getCategories } from "@/lib/api";
import { BrowseGrid } from "./browse-grid";

export const metadata: Metadata = { title: "Browse" };

// Figma: "Readly Browse" — every category as a coloured tile, with a search box.
export default async function BrowsePage() {
  const categories = await getCategories();
  return (
    <main className="container-page pb-10 pt-6">
      <h1 className="text-2xl font-bold text-forest-800 sm:text-3xl">Browse</h1>
      <p className="mt-1 text-sm text-muted">Find your next great read.</p>
      <BrowseGrid categories={categories.map(({ id, name, slug, bookCount }) => ({ id, name, slug, bookCount }))} />
    </main>
  );
}
