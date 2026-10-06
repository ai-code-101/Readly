"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/api";

/** Mobile slide-in category menu (Figma: mobile-category-drawer). */
export function CategoryDrawer({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const pathname = usePathname();

  // Close whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const shown = categories.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-full border border-cream-300 bg-white text-forest-800"
        aria-label="Open categories menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Categories">
          <div className="flex h-full w-[83%] max-w-sm flex-col bg-forest-800 px-5 pb-6 pt-8 text-white">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Categories</h2>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10" aria-label="Close">
                ✕
              </button>
            </div>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search categories..."
              className="mb-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/50"
            />
            <nav className="-mx-1 flex-1 overflow-y-auto">
              {[{ slug: "", name: "All Categories" }, ...shown].map((c) => (
                <Link
                  key={c.slug}
                  href={c.slug ? `/categories/${c.slug}` : "/categories"}
                  className="flex items-center justify-between border-b border-white/10 px-1 py-3.5 text-[15px]"
                >
                  {c.name}
                  <span aria-hidden>›</span>
                </Link>
              ))}
            </nav>
          </div>
          <button className="flex-1 bg-black/70" onClick={() => setOpen(false)} aria-label="Close menu" />
        </div>
      )}
    </>
  );
}
