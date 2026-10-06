import Link from "next/link";
import { Logo } from "./logo";
import { CategoryDrawer } from "./category-drawer";
import type { Category } from "@/lib/api";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/categories", label: "Categories" },
  { href: "/discover?staffPick=1", label: "Staff Picks" },
];

export function SiteHeader({ categories }: { categories: Category[] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-cream-200 bg-cream-100/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-6">
        <Link href="/" className="text-forest-800">
          <Logo />
        </Link>
        <nav className="mx-auto hidden items-center gap-7 text-sm font-medium text-forest-900 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition hover:text-forest-600">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action="/discover" className="ml-auto hidden lg:block">
          <label className="flex items-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2 text-sm focus-within:border-forest-700">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden>
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input name="q" placeholder="Search books" aria-label="Search books" className="w-40 bg-transparent outline-none placeholder:text-muted" />
          </label>
        </form>
        <Link href="/library" className="btn-primary hidden px-5 py-2.5 md:inline-flex">
          My Library
        </Link>
        <div className="ml-auto md:hidden">
          <CategoryDrawer categories={categories} />
        </div>
      </div>
    </header>
  );
}
