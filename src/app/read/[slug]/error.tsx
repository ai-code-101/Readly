"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function ReaderError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 grid place-items-center bg-cream-50 p-6 text-center">
      <div>
        <p className="font-display text-3xl text-forest-800">This book couldn&apos;t be opened</p>
        <p className="mt-2 text-sm text-muted">Please check your connection and try again.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn-primary" onClick={() => startTransition(() => { router.refresh(); reset(); })}>Try again</button>
          <Link href="/" className="btn-outline">Home</Link>
        </div>
      </div>
    </div>
  );
}
