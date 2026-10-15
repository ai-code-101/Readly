import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "@/components/subscription/ui";
import { PLAN } from "@/lib/plans";

export const metadata: Metadata = { title: "Welcome to Readly Premium" };

const STEPS = [
  ["Choose your profile space", "Customize your reading theme, typographic scaling, and background ambiance."],
  ["Select your initial genre interests", "Whether classical fiction, heavy mystery, or curated essays, we build your start shelf."],
  ["Read anytime, anywhere", "Read online in your browser, or install the Readly app to keep your place on every device."],
];

/** Figma: subscription-confirmation (mobile) + subscription-success (desktop). */
export default function WelcomePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 text-center">
      <div className="relative mx-auto grid h-32 w-32 place-items-center rounded-full bg-cream-200">
        <span className="absolute right-3 top-3 text-gold">✦</span>
        <span className="absolute bottom-5 left-3 text-xs text-gold">✦</span>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#0b4a3b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-forest-800 md:font-display md:text-6xl md:font-normal">Welcome to Readly Premium!</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted md:text-base">
        Your subscription is successfully activated. Get ready to experience reading like never before with ultimate access.
      </p>

      <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-cream-200 bg-white p-5 text-left">
        <p className="text-[11px] font-bold uppercase tracking-widest text-forest-700">Membership confirmation</p>
        <p className="mt-1 text-lg font-bold text-forest-800">{PLAN.name} · Daily</p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Amount</dt><dd className="font-semibold">Ksh {PLAN.price} / day</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Status</dt><dd className="font-semibold text-forest-700">Active</dd></div>
        </dl>
        <ul className="mt-4 space-y-2.5 border-t border-cream-200 pt-4 text-sm">
          {["Unlimited Book Access", "Offline Reading & Sync", "Completely Ad-Free Experience"].map((f) => (
            <li key={f} className="flex items-center gap-2.5"><Check light />{f}</li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-gold flex-1 py-3.5">Start Reading Now</Link>
        <Link href="/library" className="btn-outline flex-1 py-3.5">Go to My Library</Link>
      </div>

      <section className="mt-14 hidden text-left md:block">
        <h2 className="text-center font-display text-3xl text-forest-800">Three easy steps to start your journey</h2>
        <div className="mt-6 grid grid-cols-3 gap-5">
          {STEPS.map(([t, d], i) => (
            <div key={t} className="rounded-2xl border border-cream-200 bg-white p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-forest-800 font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 font-semibold text-forest-800">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
