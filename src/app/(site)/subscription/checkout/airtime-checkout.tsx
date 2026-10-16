"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PaymentSuccess, PlanSummary, ScreenHeader, SecureNote, Spinner } from "@/components/subscription/ui";
import { PLAN } from "@/lib/plans";

// Presentation flow — nothing is charged. Readly is paid with Safaricom airtime only;
// the real confirmation will come from Safaricom's subscription flow.
type Step = "confirm" | "processing" | "done";

const PROCESS_MS = 2500;

export function AirtimeCheckout() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("confirm");

  useEffect(() => {
    if (step !== "processing") return;
    const t = setTimeout(() => setStep("done"), PROCESS_MS);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6">
      <div className="grid gap-8 md:grid-cols-[1fr_360px]">
        <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-none">
          <ScreenHeader title="Confirm Subscription" back="/subscription" />
          <PlanSummary />

          <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-wider text-forest-800">Payment Method</p>
          <div className="flex items-center gap-4 rounded-2xl border-2 border-forest-700 bg-white px-4 py-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-800 text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>
            </span>
            <span className="flex-1">
              <span className="block font-bold text-ink">Airtime</span>
              <span className="block text-xs text-muted">Ksh {PLAN.price} from your Safaricom airtime each day</span>
            </span>
            <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-gold bg-gold" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-forest-900" />
            </span>
          </div>

          <ul className="mt-5 space-y-2.5 text-sm text-forest-900">
            <li className="flex gap-2"><Dot />Renews daily while you have enough airtime.</li>
            <li className="flex gap-2"><Dot />Turn on Safaricom mobile data to subscribe; after that, read on Wi-Fi too.</li>
            <li className="flex gap-2"><Dot />Cancel anytime from My Subscription.</li>
          </ul>

          <button
            onClick={() => setStep("processing")}
            disabled={step !== "confirm"}
            className="btn-primary mt-8 flex w-full items-center justify-center gap-2 py-3.5 text-base"
          >
            {step === "confirm" ? `Subscribe · Ksh ${PLAN.price}/day` : <><Spinner /> Confirming subscription…</>}
          </button>
          <SecureNote>Billed to your Safaricom line</SecureNote>
        </div>

        <aside className="hidden self-start overflow-hidden rounded-3xl border border-cream-200 bg-white md:block">
          <div className="bg-forest-800 px-6 py-4 font-display text-2xl text-white">Order Summary</div>
          <dl className="space-y-3 p-6 text-sm">
            <div className="flex justify-between font-semibold"><dt>{PLAN.name}</dt><dd>KES {PLAN.price}</dd></div>
            <div className="flex justify-between text-muted"><dt>Billing Period</dt><dd>Daily</dd></div>
            <div className="flex justify-between text-muted"><dt>Payment Method</dt><dd>Airtime</dd></div>
            <div className="flex justify-between border-t border-cream-200 pt-3 font-display text-2xl text-forest-800"><dt>Total per day</dt><dd>KES {PLAN.price}</dd></div>
          </dl>
        </aside>
      </div>

      {step === "done" && <PaymentSuccess onContinue={() => router.push("/subscription/welcome")} />}
    </main>
  );
}

function Dot() {
  return <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />;
}
