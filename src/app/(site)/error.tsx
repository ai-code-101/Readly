"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";

// Friendly error page for the platform. "Try again" refetches the page from the
// server (reset alone would only re-render the failed client state).
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-page py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 font-display text-4xl text-forest-800 sm:text-5xl">We couldn&apos;t open this page</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        The library may be briefly unavailable. Please try again in a moment.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          className="btn-primary"
          onClick={() =>
            startTransition(() => {
              router.refresh();
              reset();
            })
          }
        >
          Try again
        </button>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-muted">Error reference: {error.digest}</p>}
    </main>
  );
}
