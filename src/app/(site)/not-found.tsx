import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-5xl text-forest-800">This page has wandered off the shelf</h1>
      <p className="mt-4 text-muted">The book or page you’re looking for isn’t here.</p>
      <Link href="/discover" className="btn-primary mt-8">Discover books</Link>
    </main>
  );
}
