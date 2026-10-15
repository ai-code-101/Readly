import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Limited Time Offer" };

/** Figma: subscription-promo. */
export default function OfferPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-6">
      <div className="overflow-hidden rounded-3xl bg-forest-800 px-6 pb-8 pt-6 text-center text-white shadow-xl">
        <div className="flex items-center justify-between">
          <Link href="/subscription" className="grid h-9 w-9 place-items-center rounded-full bg-white/10" aria-label="Close">✕</Link>
          <span className="font-bold">Readly Premium</span>
          <span className="w-9" />
        </div>
        <div className="mx-auto mt-8 grid h-28 w-28 place-items-center rounded-full border border-white/15 bg-white/5">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#e3b23c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2M12 15l-3-3a22 22 0 0 1 2-4 13 13 0 0 1 11-6c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1 5 0 5 0M12 15v5s3-.6 4-2c1-1.6 0-5 0-5" />
          </svg>
        </div>
        <span className="mt-6 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase text-forest-950">Limited time offer</span>
        <p className="mt-3 text-5xl font-bold">50% OFF</p>
        <p className="mt-2 text-sm text-forest-100/85">Your gateway to premium wisdom at just Ksh 10 a day.</p>
        <div className="mx-auto mt-6 flex max-w-xs items-center justify-between rounded-2xl border border-white/15 px-5 py-4">
          <div className="text-left">
            <p className="text-[11px] text-forest-100/70">Regular Price</p>
            <p className="text-lg font-semibold text-forest-100/70 line-through">Ksh 20/day</p>
          </div>
          <span className="text-gold">→</span>
          <div className="text-right">
            <p className="text-[11px] text-gold">Now Only</p>
            <p className="text-2xl font-bold">Ksh 10/day</p>
          </div>
        </div>
        <Link href="/subscription/checkout" className="btn mt-8 w-full bg-cream-50 text-forest-800 hover:bg-white">Claim Special Offer</Link>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-forest-100/70">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          Secured subscription
        </p>
      </div>
    </main>
  );
}
