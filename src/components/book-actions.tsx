"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProgress, isSaved, SHELF_EVENT, toggleSaved, type BookRef } from "@/lib/shelf";

/** "Start / Continue Reading" + "Save to Library" (Figma: book-detail-page). */
export function BookActions({ book, canRead }: { book: BookRef; canRead: boolean }) {
  const [percent, setPercent] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setPercent(getProgress(book.slug)?.percent ?? null);
      setSaved(isSaved(book.slug));
    };
    sync();
    window.addEventListener(SHELF_EVENT, sync);
    return () => window.removeEventListener(SHELF_EVENT, sync);
  }, [book.slug]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {canRead ? (
        <Link href={`/read/${book.slug}`} className="btn-primary flex-1 sm:flex-none sm:px-10">
          {percent ? `Continue Reading · ${Math.round(percent * 100)}%` : "Start Reading"}
        </Link>
      ) : (
        <span className="btn flex-1 bg-cream-200 text-muted">Coming soon</span>
      )}
      <button
        onClick={() => setToast(toggleSaved(book) ? "Book saved to your library" : "Removed from your library")}
        className={`btn flex-1 border sm:flex-none sm:px-8 ${saved ? "border-forest-800 bg-forest-50 text-forest-800" : "border-gold bg-gold/15 text-forest-900 hover:bg-gold/25"}`}
        aria-pressed={saved}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 3h12v18l-6-4-6 4z" strokeLinejoin="round" />
        </svg>
        {saved ? "Saved" : "Save to Library"}
      </button>
      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest-900 px-5 py-2.5 text-sm text-white shadow-lg md:bottom-8">
          {toast}
          <Link href="/library" className="ml-3 font-semibold text-gold underline">View library</Link>
        </div>
      )}
    </div>
  );
}
