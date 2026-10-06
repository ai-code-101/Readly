import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS = [
  { title: "Library", links: [["All Books", "/discover"], ["Trending", "/discover?trending=1"], ["Categories", "/categories"], ["Staff Picks", "/discover?staffPick=1"]] },
  { title: "Company", links: [["About Us", "/#our-story"], ["Contact", "mailto:support@peakmobile.co.ke"]] },
  { title: "Legal", links: [["Terms", "#"], ["Privacy", "#"], ["Copyright", "#"]] },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-cream-200/70 pb-24 pt-14 md:pb-10">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo className="text-forest-800" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-forest-900">
              A sanctuary for readers. Discover, catalog, and read your favorite classical and modern e-books with
              beautiful, custom-tailored environments.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-forest-900">{col.title}</h3>
              <ul className="space-y-2 text-sm text-forest-900/80">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-forest-600">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-2 border-t border-cream-300 pt-6 text-xs text-forest-900/80">
          <span>© {new Date().getFullYear()} Readly. All rights reserved.</span>
          <span>Designed with love for stories.</span>
        </div>
      </div>
    </footer>
  );
}
