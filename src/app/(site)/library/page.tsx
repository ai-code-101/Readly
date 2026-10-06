import type { Metadata } from "next";
import { LibraryView } from "./library-view";

export const metadata: Metadata = { title: "My Library" };

export default function LibraryPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-5xl text-forest-800">My Library</h1>
      <p className="mt-2 text-sm text-muted">Books you’ve started and saved on this device.</p>
      <LibraryView />
    </main>
  );
}
