"use client";

import Link from "next/link";
import { useState } from "react";

type Cat = { id: string; name: string; slug: string; bookCount: number };

// Tile colours from the Figma "Readly Browse" frame, cycled through in order.
const TONES = [
  { bg: "bg-forest-800", text: "text-white", badge: "bg-cream-50 text-forest-800", border: "" },
  { bg: "bg-gold", text: "text-forest-900", badge: "bg-forest-800 text-white", border: "" },
  { bg: "bg-[#a8c09a]", text: "text-forest-900", badge: "bg-forest-800 text-white", border: "" },
  { bg: "bg-cream-100", text: "text-forest-900", badge: "bg-forest-800 text-white", border: "border border-cream-300" },
  { bg: "bg-forest-800", text: "text-white", badge: "bg-cream-50 text-forest-800", border: "" },
  { bg: "bg-[#d9a0a0]", text: "text-forest-900", badge: "bg-forest-800 text-white", border: "" },
  { bg: "bg-gold", text: "text-forest-900", badge: "bg-forest-800 text-white", border: "" },
  { bg: "bg-[#1f3a2f]", text: "text-white", badge: "bg-cream-50 text-forest-800", border: "" },
];

// Small line icons (24×24 paths) per category; anything unknown gets the open book.
const ICONS: Record<string, string> = {
  book: "M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z",
  newspaper: "M4 4h13v16H6a2 2 0 0 1-2-2zM17 8h3v10a2 2 0 0 1-2 2M8 8h5M8 12h5M8 16h5",
  wand: "M15 4V2M15 10V8M11 6h2M17 6h2M3 21l12-12M13 7l2 2",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3",
  zap: "M13 2L3 14h9l-1 8 10-12h-9z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
  rocket: "M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2M12 15l-3-3a22 22 0 0 1 2-4 13 13 0 0 1 11-6c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1 5 0 5 0M12 15v5s3-.6 4-2c1-1.6 0-5 0-5",
  ghost: "M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  landmark: "M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z",
  plane: "M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  brain: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18zM12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18zM12 5v13",
  feather: "M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.5V19h8.5zM16 8L2 22M17.5 15H9",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  sparkles: "M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2zM5 3v4M3 5h4M19 17v4M17 19h4",
  baby: "M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1",
  palette: "M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1 3.7A1.6 1.6 0 0 1 12 22zM7.5 10.5h.01M10.5 7.5h.01M15.5 7.5h.01M17.5 11.5h.01",
  briefcase: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
  leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.1-6",
  fingerprint: "M12 10a2 2 0 0 0-2 2c0 1 0 3.1-.5 5M14 13.1c0 2.4 0 6.4-1 8.9M17.3 21.5c.1-.6.4-2.3.5-3M2 12a10 10 0 0 1 18-6M2 16h.01M21.8 16c.2-2 .1-5.4 0-6M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .3-2M8.7 22c.2-.7.5-1.4.6-2.1M9 6.8a6 6 0 0 1 9 5.2v2",
  masks: "M2 4h10v6a5 5 0 0 1-10 0zM12 8h10v6a5 5 0 0 1-10 0M5 8h.01M9 8h.01M15 12h.01M19 12h.01M6 12c.8.7 2.2.7 3 0M15 16c.8-.7 2.2-.7 3 0",
};

const ICON_FOR: [RegExp, string][] = [
  [/non-?fiction/, "newspaper"],
  [/fiction|novel/, "book"],
  [/fantasy/, "wand"],
  [/mystery|detective/, "search"],
  [/thriller|suspense/, "zap"],
  [/romance|love/, "heart"],
  [/sci-?fi|science/, "rocket"],
  [/horror/, "ghost"],
  [/biograph|memoir/, "user"],
  [/history/, "landmark"],
  [/travel/, "plane"],
  [/philosoph/, "brain"],
  [/poetry|poem/, "feather"],
  [/self-?help|motivation/, "sun"],
  [/young|teen/, "sparkles"],
  [/child|kids/, "baby"],
  [/art|design/, "palette"],
  [/business|finance/, "briefcase"],
  [/health|wellness/, "leaf"],
  [/crime/, "fingerprint"],
  [/drama|play/, "masks"],
];

// Colours the Figma assigns to specific genres; other categories cycle through TONES.
const TONE_FOR: Record<string, number> = {
  fiction: 0, "non-fiction": 1, fantasy: 2, mystery: 3, thriller: 4, romance: 5, "sci-fi": 6, horror: 7,
};

function iconFor(slug: string) {
  return ICONS[ICON_FOR.find(([re]) => re.test(slug))?.[1] ?? "book"];
}

export function BrowseGrid({ categories }: { categories: Cat[] }) {
  const [q, setQ] = useState("");
  const shown = categories.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <label className="mt-5 flex items-center gap-3 rounded-2xl bg-forest-50 px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-forest-100">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-800" aria-hidden>
          <circle cx="11" cy="11" r="7" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories..."
          aria-label="Search categories"
          className="flex-1 bg-transparent outline-none placeholder:text-muted"
        />
      </label>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-forest-800">Browse by category</h2>
        <p className="text-sm text-muted">Explore a genre. Discover something new.</p>

        {shown.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">No categories match “{q}”.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((c) => {
              // Colour is fixed per category (not per position), so tiles keep their colour while searching.
              const tone = TONES[TONE_FOR[c.slug] ?? categories.indexOf(c) % TONES.length];
              return (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className={`relative flex h-36 flex-col justify-between rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${tone.bg} ${tone.text} ${tone.border}`}
                >
                  <span className="text-base font-bold leading-tight">{c.name}</span>
                  <span className="flex justify-end">
                    <span className={`grid h-7 w-7 place-items-center rounded-full ${tone.badge}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d={iconFor(c.slug)} />
                      </svg>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
