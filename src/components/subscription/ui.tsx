"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { PLAN } from "@/lib/plans";

/** Mobile-style screen header: back arrow + centred title (Figma subscription screens). */
export function ScreenHeader({ title, back }: { title: string; back?: string }) {
  return (
    <div className="relative mb-6 flex h-11 items-center justify-center">
      {back && (
        <Link href={back} className="absolute left-0 grid h-10 w-10 place-items-center rounded-full bg-cream-200/70 text-forest-800 hover:bg-cream-200" aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
      )}
      <h1 className="text-lg font-bold text-forest-800">{title}</h1>
    </div>
  );
}

export function Screen({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <main className={`mx-auto w-full px-4 pb-16 pt-6 ${wide ? "max-w-5xl" : "max-w-md"}`}>{children}</main>;
}

/** Dark green summary of the plan being paid for. */
export function PlanSummary() {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-forest-800 px-5 py-4 text-white">
      <div>
        <p className="text-xs text-forest-100/80">Subscription</p>
        <p className="font-bold">{PLAN.name}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold">Ksh {PLAN.price}</p>
        <p className="text-xs text-forest-100/80">/ day</p>
      </div>
    </div>
  );
}

export function SecureNote({ children = "Secured payment processed by Readly" }: { children?: ReactNode }) {
  return (
    <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
      {children}
    </p>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />;
}

/** Figma: payment-success-modal. */
export function PaymentSuccess({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-forest-950/60 p-6" role="dialog" aria-modal="true" aria-labelledby="pay-ok">
      <div className="w-full max-w-xs rounded-3xl bg-cream-50 p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-800 text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5L20 7" /></svg>
        </div>
        <h2 id="pay-ok" className="mt-4 text-xl font-bold text-forest-800">Payment Successful!</h2>
        <p className="mt-2 text-sm text-muted">Your Readly Premium subscription is now active. Enjoy unlimited reading!</p>
        <button onClick={onContinue} className="btn-gold mt-5 w-full">Start Reading</button>
      </div>
    </div>
  );
}

export function Check({ light = false }: { light?: boolean }) {
  return (
    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${light ? "bg-forest-100 text-forest-800" : "bg-forest-800 text-white"}`}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5L20 7" /></svg>
    </span>
  );
}
