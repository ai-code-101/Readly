import type { Metadata } from "next";
import Link from "next/link";
import { PlanSummary, ScreenHeader, SecureNote } from "@/components/subscription/ui";
import { PLAN } from "@/lib/plans";

export const metadata: Metadata = { title: "Choose Payment Method" };

const METHODS = [
  {
    href: "/subscription/checkout/mpesa",
    name: "M-Pesa",
    desc: "Pay via Safaricom M-Pesa",
    icon: <span className="grid h-10 w-10 place-items-center rounded-full bg-[#43b02a] text-base font-black text-white">M</span>,
  },
  {
    href: "/subscription/checkout/card",
    name: "Bank Transfer",
    desc: "Pay with your bank card",
    icon: (
      <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-800 text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
      </span>
    ),
  },
];

/** Figma: payment-method-select (mobile) + payment-method-page order summary (desktop). */
export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6">
      <div className="grid gap-8 md:grid-cols-[1fr_360px]">
        <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-none">
          <ScreenHeader title="Choose Payment Method" back="/subscription" />
          <PlanSummary />
          <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-wider text-forest-800">Available Methods</p>
          <div className="space-y-3">
            {METHODS.map((m) => (
              <Link key={m.href} href={m.href} className="flex items-center gap-4 rounded-2xl border border-cream-200 bg-white px-4 py-4 transition hover:border-forest-700 hover:shadow-md">
                {m.icon}
                <span className="flex-1">
                  <span className="block font-bold text-ink">{m.name}</span>
                  <span className="block text-xs text-muted">{m.desc}</span>
                </span>
                <span className="text-xl text-forest-700" aria-hidden>›</span>
              </Link>
            ))}
          </div>
          <SecureNote />
        </div>

        <aside className="hidden self-start overflow-hidden rounded-3xl border border-cream-200 bg-white md:block">
          <div className="bg-forest-800 px-6 py-4 font-display text-2xl text-white">Order Summary</div>
          <dl className="space-y-3 p-6 text-sm">
            <div className="flex justify-between font-semibold"><dt>{PLAN.name}</dt><dd>KES {PLAN.price}</dd></div>
            <div className="flex justify-between text-muted"><dt>Billing Period</dt><dd>Daily</dd></div>
            <div className="flex justify-between border-t border-cream-200 pt-3"><dt>Subtotal</dt><dd>KES {PLAN.price}</dd></div>
            <div className="flex justify-between"><dt>Estimated Tax</dt><dd>KES 0.00</dd></div>
            <div className="flex justify-between border-t border-cream-200 pt-3 font-display text-2xl text-forest-800"><dt>Total</dt><dd>KES {PLAN.price}</dd></div>
          </dl>
          <p className="border-t border-cream-200 px-6 py-3 text-center text-xs text-muted">🔒 100% Secure Checkout — Payments processed securely.</p>
        </aside>
      </div>
    </main>
  );
}
