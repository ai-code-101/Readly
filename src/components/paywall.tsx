"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FREE_BOOK_LIMIT, freeBooks, unlockFreeBook } from "@/lib/access";
import { PLAN } from "@/lib/plans";

export type PaywallBook = { slug: string; title: string; author: string; thumbUrl: string };

/** Subscription wall for paid books (Figma: subscription-paywall). */
// "Daily Payment" continues to the subscription checkout; the Safaricom
// subscription flow will plug in there.
export function Paywall({ book, onClose, onUnlocked }: { book: PaywallBook; onClose: () => void; onUnlocked: () => void }) {
  const router = useRouter();
  const [plan, setPlan] = useState<"daily" | "free">("daily");
  const [error, setError] = useState<string | null>(null);
  const [freeUsed] = useState(freeBooks);
  const freeLeft = Math.max(0, FREE_BOOK_LIMIT - freeUsed.length);

  // Close on Escape; keep the page behind from scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function chooseContinue() {
    if (plan === "free") {
      if (unlockFreeBook(book.slug)) onUnlocked();
      else setError("You've used all 5 free books. Subscribe to keep reading.");
      return;
    }
    onClose();
    router.push("/subscription/checkout");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="paywall-title">
      <button className="absolute inset-0 bg-forest-950/60 backdrop-blur-[2px]" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream-50 px-6 pb-8 pt-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="w-9" />
          <span className="text-base font-bold text-forest-800">Readly</span>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200" aria-label="Close">✕</button>
        </div>

        <LockIcon />
        <h2 id="paywall-title" className="mt-4 text-center text-2xl font-bold text-forest-800">Unlock Unlimited Reading</h2>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-muted">
          <span className="font-semibold text-ink">{book.title}</span> is a premium book. Subscribe for instant access to the whole library, or use one of your free books.
        </p>

        <div className="mt-6 space-y-3">
          <PlanCard
            selected={plan === "free"}
            disabled={freeLeft === 0}
            onSelect={() => setPlan("free")}
            title="Free Plan"
            subtitle={freeLeft === 0 ? "You've used all 5 free books" : `${freeLeft} of ${FREE_BOOK_LIMIT} free books left`}
            price="Free"
          />
          <PlanCard
            selected={plan === "daily"}
            onSelect={() => setPlan("daily")}
            badge="Best value"
            title="Daily Payment"
            subtitle="Full premium access to every book"
            price={<>Ksh. {PLAN.price}<span className="block text-[11px] font-semibold">Airtime / day</span></>}
            dark
          />
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p>}
        <button onClick={chooseContinue} className="btn-primary mt-6 w-full py-3.5 text-base">
          {plan === "free" ? "Read with a free book" : `Subscribe · Ksh ${PLAN.price}/day`}
        </button>
      </div>
    </div>
  );
}

function PlanCard({
  selected, disabled, onSelect, title, subtitle, price, badge, dark,
}: {
  selected: boolean; disabled?: boolean; onSelect: () => void; title: string; subtitle: string; price: ReactNode; badge?: string; dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`relative flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
        dark ? "bg-forest-800 text-white" : "bg-white text-ink"
      } ${selected ? "border-gold ring-2 ring-gold/40" : dark ? "border-forest-800" : "border-cream-200"}`}
    >
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-gold bg-gold" : dark ? "border-white/50" : "border-cream-300"}`}>
        {selected && <span className="h-2 w-2 rounded-full bg-forest-900" />}
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

function LockIcon() {
  return (
    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-100 text-forest-700">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
    </div>
  );
}
