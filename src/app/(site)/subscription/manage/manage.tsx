"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccess } from "@/components/access-provider";
import { Screen, ScreenHeader } from "@/components/subscription/ui";
import { prettyPhone } from "@/lib/access";
import { PLAN } from "@/lib/plans";

const fmt = (d: Date) => d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

/** Figma: manage-subscription. Uses the signed-in reader's real renewal date when there is one. */
export function ManageSubscription() {
  const router = useRouter();
  const access = useAccess();
  const [autoRenew, setAutoRenew] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const [fallback] = useState(() => new Date(Date.now() + 24 * 3600 * 1000));
  const renews = access.me?.subscription ? new Date(access.me.subscription.endsAt) : fallback;

  return (
    <Screen>
      <ScreenHeader title="My Subscription" back="/library" />

      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Current Plan</p>
      <div className="rounded-2xl bg-forest-800 p-5 text-white">
        <div className="flex items-center justify-between">
          <p className="font-bold">{PLAN.name} Daily</p>
          <span className="rounded-full bg-[#a8c09a] px-2.5 py-0.5 text-[11px] font-bold text-forest-950">Active</span>
        </div>
        <p className="mt-2 text-xs text-forest-100/80">
          {autoRenew ? `Renews automatically on ${fmt(renews)}` : `Ends on ${fmt(renews)}`}
        </p>
        <p className="mt-1 text-sm font-semibold">Ksh {PLAN.price} / day</p>
        {access.me && <p className="mt-3 border-t border-white/15 pt-3 text-xs text-forest-100/80">Billed to {prettyPhone(access.me.user.phone)} · Airtime</p>}
      </div>

      <p className="mb-2 mt-7 text-xs font-bold uppercase tracking-wider text-muted">Settings</p>
      <div className="divide-y divide-cream-200 rounded-2xl border border-cream-200 bg-white">
        <label className="flex cursor-pointer items-center justify-between px-4 py-4">
          <span>
            <span className="block text-sm font-semibold">Auto-renew daily</span>
            <span className="block text-xs text-muted">Ksh {PLAN.price} is charged each day</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={autoRenew}
            onClick={() => setAutoRenew(!autoRenew)}
            className={`relative h-6 w-11 rounded-full transition ${autoRenew ? "bg-forest-700" : "bg-cream-300"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${autoRenew ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </label>
        <div className="px-4 py-4">
          <span className="block text-sm font-semibold">Payment method</span>
          <span className="block text-xs text-muted">Safaricom Airtime · Ksh {PLAN.price}/day</span>
        </div>
      </div>

      <button onClick={() => setConfirming(true)} className="mx-auto mt-8 block text-sm font-semibold text-red-700 underline">
        Cancel Subscription
      </button>

      {confirming && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-forest-950/60 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="w-full max-w-md rounded-t-3xl bg-cream-50 p-6 sm:rounded-3xl">
            <h2 id="cancel-title" className="text-xl font-bold text-forest-800">Cancel your subscription?</h2>
            <p className="mt-2 text-sm text-muted">You&apos;ll keep Premium until {fmt(renews)}. After that you&apos;ll lose:</p>
            <ul className="mt-3 space-y-2 text-sm">
              {["Unlimited access to every book", "Offline reading and sync across devices", "Early access to staff picks"].map((x) => (
                <li key={x} className="flex items-center gap-2"><span className="text-red-600">✕</span>{x}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirming(false)} className="btn-primary flex-1">Keep Premium</button>
              <button onClick={() => router.push("/subscription/expired")} className="btn flex-1 border border-red-200 text-red-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
