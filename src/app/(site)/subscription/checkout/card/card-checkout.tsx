"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PaymentSuccess, Screen, ScreenHeader, SecureNote, Spinner } from "@/components/subscription/ui";
import { PLAN } from "@/lib/plans";

// Presentation flow — card details are never sent or stored anywhere.
// Figma: bank-details-entry → payment-success-modal.
const group = (v: string, size: number, max: number, sep = " ") =>
  v.replace(/\D/g, "").slice(0, max).replace(new RegExp(`(\\d{${size}})(?=\\d)`, "g"), `$1${sep}`);

export function CardCheckout() {
  const router = useRouter();
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"form" | "paying" | "done">("form");

  const valid = card.replace(/\D/g, "").length >= 15 && /^\d{2} \/ \d{2}$/.test(exp) && cvv.length >= 3 && name.trim().length > 1;

  function pay(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setState("paying");
    setTimeout(() => setState("done"), 2200);
  }

  const field = "mt-1.5 w-full rounded-xl border-2 border-cream-200 bg-white px-4 py-3 text-base outline-none focus:border-forest-700";

  return (
    <Screen>
      <ScreenHeader title="Bank Payment" back="/subscription/checkout" />
      <form onSubmit={pay} autoComplete="off">
        <div className="flex items-center justify-between rounded-2xl bg-cream-200/60 px-4 py-3 text-sm">
          <span className="font-semibold">Total due</span>
          <span className="font-bold text-forest-800">Ksh {PLAN.price}</span>
        </div>
        <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-forest-800">
          Card Number
          <input inputMode="numeric" value={card} onChange={(e) => setCard(group(e.target.value, 4, 19))} placeholder="0000 0000 0000 0000" className={field} />
        </label>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-800">
            Expiry Date
            <input inputMode="numeric" value={exp} onChange={(e) => setExp(group(e.target.value, 2, 4, " / "))} placeholder="MM / YY" className={field} />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-800">
            CVV
            <input inputMode="numeric" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" className={field} />
          </label>
        </div>
        <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-forest-800">
          Cardholder Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={field} />
        </label>
        <button disabled={!valid || state !== "form"} className="btn-primary mt-8 w-full py-3.5 text-base">
          {state === "paying" ? <><Spinner /> Processing…</> : `Pay Ksh ${PLAN.price}`}
        </button>
        <SecureNote>Your payment is secured and encrypted</SecureNote>
      </form>
      {state === "done" && <PaymentSuccess onContinue={() => router.push("/subscription/welcome")} />}
    </Screen>
  );
}
