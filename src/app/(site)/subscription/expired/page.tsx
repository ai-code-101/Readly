import type { Metadata } from "next";
import Link from "next/link";
import { ScreenHeader } from "@/components/subscription/ui";
import { PLAN } from "@/lib/plans";

export const metadata: Metadata = { title: "Subscription Ended" };

/** Figma: subscription-expired. */
export default function ExpiredPage() {
  const lapsed = new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-6">
      <ScreenHeader title="Subscription Ended" back="/" />
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-600">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M12 3l9.5 16.5h-19z" /><path d="M12 10v4M12 17h.01" /></svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-forest-800">Your subscription has ended</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
          Your premium pass expired and automatic renewal was unsuccessful. Don&apos;t worry, you can restore your library access instantly.
        </p>
      </div>
      <div className="mt-6 rounded-2xl border border-cream-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Premium Pass Status</span>
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">Expired</span>
        </div>
        <p className="mt-1 text-xs text-muted">Lapsed on {lapsed}</p>
      </div>
      <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wider text-muted">What you are missing out on</p>
      <ul className="space-y-2 text-sm">
        {["Access to every book in the Readly library", "Custom typography and offline reading sync", "Early access to staff picks"].map((x) => (
          <li key={x} className="flex items-center gap-2"><span className="text-red-600">⊘</span>{x}</li>
        ))}
      </ul>
      <Link href="/subscription/checkout" className="btn-primary mt-8 w-full py-3.5 text-base">Renew Now (Ksh {PLAN.price}/day)</Link>
      <Link href="/subscription" className="mt-4 block text-center text-sm font-semibold text-forest-700 underline">View Subscription Plans</Link>
    </main>
  );
}
