"use client";

import dynamic from "next/dynamic";
import type { ReaderBook } from "./reader";

// The reader depends on localStorage and the DOM (epub.js), so it is rendered on the client only.
export const ReaderClient = dynamic<{ book: ReaderBook }>(() => import("./reader").then((m) => m.Reader), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-cream-50" />,
});
