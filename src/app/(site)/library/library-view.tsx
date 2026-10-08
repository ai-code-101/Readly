"use client";

/* eslint-disable @next/next/no-img-element -- covers are served by the Readly API */
import Link from "next/link";
import { useEffect, useState } from "react";
import { allProgress, getSaved, SHELF_EVENT, type BookRef, type Progress, type Saved } from "@/lib/shelf";
import { prettyPhone, progressApi, type ServerProgress } from "@/lib/access";
import { useAccess } from "@/components/access-provider";

/** Merge browser and account progress, keeping the newest position per book. */
function merge(local: Progress[], remote: ServerProgress[]): Progress[] {
  const byslug = new Map(local.map((p) => [p.slug, p]));
  for (const r of remote) {
    const at = Date.parse(r.updatedAt);
    const l = byslug.get(r.slug);
    if (!l || at > l.updatedAt) {
      byslug.set(r.slug, { slug: r.slug, title: r.title, author: r.author, thumbUrl: r.thumbUrl, cfi: r.cfi, percent: r.percent, chapter: r.chapter, updatedAt: at });
    }
  }
  return [...byslug.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function LibraryView() {
  const access = useAccess();
  const signedIn = !!access.me;
  const [state, setState] = useState<{ reading: Progress[]; saved: Saved[] } | null>(null);
  const [remote, setRemote] = useState<ServerProgress[]>([]);

  useEffect(() => {
    const sync = () => setState({ reading: allProgress(), saved: getSaved() });
    sync();
    window.addEventListener(SHELF_EVENT, sync);
    return () => window.removeEventListener(SHELF_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    progressApi.list().then(setRemote).catch(() => {});
  }, [signedIn]);

  if (!state) return <div className="mt-10 h-48 animate-pulse rounded-3xl bg-cream-200" />;
  const reading = merge(state.reading, signedIn ? remote : []);
  const [current, ...rest] = reading;

  const accountCard = access.me === undefined ? null : access.me ? (
    <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-cream-200 bg-white p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Signed in as</p>
        <p className="text-lg font-bold text-forest-800">{prettyPhone(access.me.user.phone)}</p>
        <p className="text-sm text-muted">
          {access.subscribed && access.me.subscription
            ? `Readly Premium · active until ${new Date(access.me.subscription.endsAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}`
            : "No active subscription — premium books need Ksh 10/day. Your progress is still saved."}
        </p>
      </div>
      <button onClick={() => access.signOut()} className="btn-outline px-5 py-2">Sign out</button>
    </section>
  ) : (
    <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-cream-200 bg-white p-5">
      <div>
        <p className="font-bold text-forest-800">Subscribed on another device?</p>
        <p className="text-sm text-muted">Sign in with your phone number to continue where you left off. {access.freeLeft} of 5 free books left on this device.</p>
      </div>
      <button onClick={() => access.openSignIn()} className="btn-primary px-5 py-2">Sign in with your number</button>
    </section>
  );

  if (!current && state.saved.length === 0) {
    return (
      <>
      {accountCard}
      <div className="mt-10 rounded-3xl border-2 border-dashed border-cream-300 p-12 text-center">
        <p className="font-display text-2xl text-forest-800">Your library is empty</p>
        <p className="mt-2 text-sm text-muted">Start reading or save a book and it will show up here.</p>
        <Link href="/discover" className="btn-primary mt-6">Discover books</Link>
      </div>
      </>
    );
  }

  return (
    <>
    {accountCard}
    <div className="mt-8 space-y-12">
      {current && (
        <section className="rounded-3xl bg-forest-800 p-5 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-100/80">Your current read</p>
          <div className="mt-4 flex gap-5">
            <Thumb book={current} className="w-24 sm:w-28" />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-3xl leading-tight">{current.title}</h2>
              <p className="text-sm text-forest-100/80">{current.author}</p>
              {current.chapter && <p className="mt-1 truncate text-xs text-forest-100/60">{current.chapter}</p>}
              <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                <span>Reading progress</span>
                <span>{Math.round(current.percent * 100)}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(2, current.percent * 100)}%` }} />
              </div>
              <Link href={`/read/${current.slug}`} className="btn-gold mt-5 w-full sm:w-auto">Continue Reading</Link>
            </div>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <Grid title="Also reading" books={rest} badge={(b) => `${Math.round((b as Progress).percent * 100)}%`} hrefPrefix="/read/" />
      )}
      {state.saved.length > 0 && <Grid title="Saved books" books={state.saved} hrefPrefix="/books/" />}
    </div>
    </>
  );
}

function Grid({ title, books, badge, hrefPrefix }: { title: string; books: BookRef[]; badge?: (b: BookRef) => string; hrefPrefix: string }) {
  return (
    <section>
      <h2 className="mb-5 font-display text-3xl text-forest-800">{title}</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {books.map((b) => (
          <Link key={b.slug} href={hrefPrefix + b.slug} className="group">
            <div className="relative">
              <Thumb book={b} className="w-full" />
              {badge && <span className="absolute bottom-2 right-2 rounded-full bg-forest-900/90 px-2 py-0.5 text-[10px] font-bold text-white">{badge(b)}</span>}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{b.title}</p>
            <p className="truncate text-xs text-muted">{b.author}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Thumb({ book, className }: { book: BookRef; className: string }) {
  return (
    <div className={`aspect-[2/3] shrink-0 overflow-hidden rounded-xl bg-forest-700 shadow-md ${className}`}>
      {book.thumbUrl ? (
        <img src={book.thumbUrl} alt={`Cover of ${book.title}`} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center p-2 text-center font-display text-sm text-white">{book.title}</div>
      )}
    </div>
  );
}
