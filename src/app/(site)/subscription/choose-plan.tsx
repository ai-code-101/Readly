"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "@/components/subscription/ui";
import { FREE_FEATURES, PLAN, PREMIUM_FEATURES } from "@/lib/plans";

type Choice = "free" | "daily";

/** Figma: subscription-paywall (mobile) + subscription-plans "Choose Your Plan" (desktop). */
export function ChoosePlan() {
  const router = useRouter();
  const [selected, setSelected] = useState<Choice>("daily");

  const cont = () => router.push(selected === "free" ? "/" : "/subscription/checkout");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-100 text-forest-700 md:hidden">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        </div>
        <span className="pill mt-4 hidden md:inline-flex">✨ Flexible reading memberships</span>
        <h1 className="mt-4 text-2xl font-bold text-forest-800 md:font-display md:text-6xl md:font-normal">
          <span className="md:hidden">Unlock Unlimited Reading</span>
          <span className="hidden md:inline">Choose Your Plan</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted md:text-base md:text-forest-900">
          Get instant access to thousands of bestsellers, classic literature, and indie publications.
        </p>
      </div>

      <Link href="/subscription/offer" className="mx-auto mt-6 flex max-w-md items-center justify-between gap-3 rounded-2xl bg-gold/20 px-4 py-3 text-sm md:max-w-xl">
        <span>
          <span className="mr-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-forest-950">Limited time</span>
          <span className="font-semibold text-forest-900">50% OFF Readly Premium</span>
        </span>
        <span className="font-semibold text-forest-700">Claim →</span>
      </Link>

      {/* Mobile: list of plans (Figma paywall) */}
      <div className="mx-auto mt-6 max-w-md space-y-3 md:hidden">
        <PlanRow id="free" selected={selected} onSelect={setSelected} title="Free Plan" subtitle="5 free books, basic library features" price="Free" />
        <PlanRow
          id="daily"
          selected={selected}
          onSelect={setSelected}
          title={PLAN.short}
          subtitle={PLAN.blurb}
          badge={PLAN.badge}
          price={<>Ksh. {PLAN.price}<span className="block text-[11px] font-semibold">Airtime / day</span></>}
          dark
        />
        <button onClick={cont} className="btn-primary mt-3 w-full py-3.5 text-base">
          {selected === "free" ? "Continue with Free" : `Subscribe · Ksh ${PLAN.price}/day`}
        </button>
        <p className="text-center text-xs text-muted">
          <Link href="/library" className="underline">Restore Purchase</Link> • <Link href="#" className="underline">Terms of Service</Link>
        </p>
      </div>

      {/* Desktop: Basic vs Premium (Figma subscription-plans) */}
      <div className="mt-10 hidden gap-6 md:grid md:grid-cols-2">
        <section className="flex flex-col rounded-3xl border border-cream-200 bg-white p-8">
          <h2 className="font-display text-3xl text-forest-800">Basic</h2>
          <p className="mt-1 text-sm text-muted">Perfect for starting your literary journey</p>
          <p className="mt-6 font-display text-5xl text-forest-800">Free</p>
          <ul className="mt-6 space-y-3 border-t border-cream-200 pt-6 text-sm">
            {FREE_FEATURES.map((f) => <li key={f} className="flex items-center gap-3"><Check />{f}</li>)}
          </ul>
          <Link href="/" className="btn-primary mt-8 w-full">Get Started</Link>
        </section>
        <section className="relative flex flex-col rounded-3xl bg-forest-800 p-8 text-white shadow-xl">
          <span className="absolute -top-3 right-6 rounded-full bg-[#a8c09a] px-3 py-1 text-[11px] font-bold uppercase text-forest-950">Most popular</span>
          <h2 className="font-display text-3xl">Readly Premium</h2>
          <p className="mt-1 text-sm text-forest-100/80">Unlimited access to our entire e-book catalog</p>
          <p className="mt-5 font-display text-5xl">
            KES {PLAN.price}
            <span className="ml-1 font-sans text-sm text-forest-100/80">/day</span>
          </p>
          <ul className="mt-6 space-y-3 border-t border-white/15 pt-6 text-sm">
            {PREMIUM_FEATURES.map((f) => <li key={f} className="flex items-center gap-3"><Check light />{f}</li>)}
          </ul>
          <button onClick={() => router.push("/subscription/checkout")} className="btn mt-8 w-full bg-cream-50 text-forest-800 hover:bg-white">
            Subscribe Now
          </button>
        </section>
      </div>
    </main>
  );
}

function PlanRow({
  id, selected, onSelect, title, subtitle, price, badge, dark,
}: {
  id: Choice; selected: string; onSelect: (id: Choice) => void;
  title: string; subtitle: string; price: React.ReactNode; badge?: string; dark?: boolean;
}) {
  const on = selected === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={on}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${dark ? "bg-forest-800 text-white" : "bg-white text-ink"} ${
        on ? "border-gold ring-2 ring-gold/40" : dark ? "border-forest-800" : "border-cream-200"
      }`}
    >
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-gold bg-gold" : dark ? "border-white/50" : "border-cream-300"}`}>
        {on && <span className="h-2 w-2 rounded-full bg-forest-900" />}
      </span>
      <span className="min-w-0 flex-1">
        {badge && <span className="mb-1 inline-block rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest-950">{badge}</span>}
        <span className="block font-bold">{title}</span>
        <span className={`block text-xs ${dark ? "text-forest-100/80" : "text-muted"}`}>{subtitle}</span>
      </span>
      <span className="text-right text-lg font-bold leading-tight">{price}</span>
    </button>
  );
}
