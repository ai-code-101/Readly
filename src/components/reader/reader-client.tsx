"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAccess } from "../access-provider";
import type { ReaderBook } from "./reader";

// The reader depends on localStorage and the DOM (epub.js), so it is rendered on the client only.
const Reader = dynamic<{ book: ReaderBook; syncToServer: boolean }>(() => import("./reader").then((m) => m.Reader), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-cream-50" />,
});

/** Shows the reader if this visitor may read the book, otherwise the paywall. */
export function ReaderClient({ book }: { book: ReaderBook & { isFree: boolean } }) {
  const access = useAccess();
  const router = useRouter();
  const loading = access.me === undefined;
  const allowed = access.canRead(book);
  const asked = useRef(false);

  useEffect(() => {
    if (loading || allowed || asked.current) return;
    asked.current = true;
    access.openPaywall(book);
  }, [loading, allowed, access, book]);

  if (loading) return <div className="fixed inset-0 bg-cream-50" />;
  if (!allowed) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-cream-100 p-6 text-center">
        <div>
          <p className="font-display text-3xl text-forest-800">{book.title}</p>
          <p className="mt-2 text-sm text-muted">This is a premium book. Subscribe or use a free book to read it.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => access.openPaywall(book)} className="btn-primary">Unlock this book</button>
            <button onClick={() => router.back()} className="btn-outline">Go back</button>
          </div>
          <Link href="/" className="mt-4 block text-xs text-muted underline">Home</Link>
        </div>
      </div>
    );
  }
  return <Reader book={book} syncToServer={!!access.me?.user} />;
}
