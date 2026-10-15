"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { PaymentSuccess, Screen, ScreenHeader, Spinner } from "@/components/subscription/ui";
import { PLAN } from "@/lib/plans";

// Presentation flow — no STK push is actually sent and no money moves.
// Figma: mpesa-phone-entry → mpesa-stk-prompt → (mpesa-pin-entry, on the phone) → payment-success-modal.
type Step = "phone" | "waiting" | "done";

const WAIT_MS = 6000;

function pretty(raw: string) {
  const d = raw.replace(/\D/g, "").replace(/^(254|0)/, "");
  return `+254 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)}`.trim();
}

export function MpesaCheckout() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [attempt, setAttempt] = useState(0);

  // While "waiting", show the prompt for a few seconds, then confirm.
  useEffect(() => {
    if (step !== "waiting") return;
    const t = setTimeout(() => setStep("done"), WAIT_MS);
    return () => clearTimeout(t);
  }, [step, attempt]);

  const digits = phone.replace(/\D/g, "").replace(/^(254|0)/, "");
  const valid = /^[71]\d{8}$/.test(digits);

  function send(e: FormEvent) {
    e.preventDefault();
    if (valid) setStep("waiting");
  }

  if (step === "phone") {
    return (
      <Screen>
        <ScreenHeader title="M-Pesa Payment" back="/subscription/checkout" />
        <form onSubmit={send}>
          <p className="text-center text-xs text-muted">Amount to Pay</p>
          <p className="text-center text-4xl font-bold text-forest-800">Ksh {PLAN.price}</p>
          <p className="text-center text-xs text-muted">{PLAN.name} · per day</p>
          <label htmlFor="mpesa-phone" className="mt-8 block text-xs font-bold uppercase tracking-wider text-forest-800">M-Pesa Phone Number</label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-cream-200 bg-white px-4 py-3 focus-within:border-forest-700">
            <span className="text-sm font-semibold text-forest-800">🇰🇪 +254</span>
            <input
              id="mpesa-phone"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="7XX XXX XXX"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/60"
            />
          </div>
          <p className="mt-2 text-xs text-muted">Enter your Safaricom M-Pesa number</p>
          <button disabled={!valid} className="btn-primary mt-8 w-full py-3.5 text-base">Send STK Push</button>
          <p className="mt-3 text-center text-xs text-muted">You will receive a payment prompt on your phone</p>
        </form>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="M-Pesa Payment" back="/subscription/checkout" />
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest-100 text-forest-700">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2M3 9a5 5 0 0 1 0 6M21 9a5 5 0 0 0 0 6" /></svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-forest-800">Check Your Phone</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
          We sent a payment request to <span className="font-semibold text-ink">{pretty(phone)}</span>. Enter your M-Pesa PIN on your phone to complete payment.
        </p>
      </div>

      {/* What the reader sees on their phone (the PIN is only ever entered there). */}
      <div className="mx-auto mt-6 w-56 rounded-[2rem] border-[6px] border-ink/80 bg-[#0b4a3b] p-4 text-center text-white shadow-xl" aria-hidden>
        <p className="text-sm font-black tracking-wide">M-PESA</p>
        <p className="mt-3 text-[10px] uppercase text-white/70">Pay merchant</p>
        <p className="text-sm font-semibold">Readly Premium</p>
        <p className="mt-1 text-xl font-bold">Ksh {PLAN.price}.00</p>
        <p className="mt-3 text-[10px] text-white/70">Enter your M-Pesa PIN</p>
        <div className="mt-2 flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => <span key={i} className="h-3 w-3 rounded-full border border-white/70" />)}
        </div>
        <div className="mt-3 rounded-full bg-[#43b02a] py-1.5 text-xs font-bold">Confirm</div>
        <p className="mt-1.5 text-[10px] text-white/60">Cancel</p>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
        <Spinner /> Waiting for confirmation...
      </p>
      <div className="mt-6 flex justify-between text-xs font-semibold text-forest-700">
        <button onClick={() => setAttempt((a) => a + 1)} className="underline">Resend STK Push</button>
        <button onClick={() => setStep("phone")} className="underline">Use Different Number</button>
      </div>

      {step === "done" && <PaymentSuccess onContinue={() => router.push("/subscription/welcome")} />}
    </Screen>
  );
}
