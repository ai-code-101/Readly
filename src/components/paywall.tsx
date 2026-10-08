"use client";

/* eslint-disable @next/next/no-img-element -- covers are served by the Readly API */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ApiError, auth, FREE_BOOK_LIMIT, freeBooks, notifyAccessChanged, prettyPhone, unlockFreeBook, type Me, type Purpose } from "@/lib/access";

export type PaywallBook = { slug: string; title: string; author: string; thumbUrl: string };

type Step =
  | { kind: "choose" }
  | { kind: "phone"; purpose: Purpose }
  | { kind: "code"; purpose: Purpose; phone: string; resendAt: number }
  | { kind: "success"; me: Me; purpose: Purpose };

const PRICE_KES = 10;

/** Subscription wall for paid books (Figma: subscription-paywall, payment-success-modal). */
// Without a book it opens straight on "sign in with your number" (e.g. from My Library).
export function Paywall({ book, onClose, onUnlocked }: { book?: PaywallBook; onClose: () => void; onUnlocked: () => void }) {
  const [step, setStep] = useState<Step>(book ? { kind: "choose" } : { kind: "phone", purpose: "login" });
  const [plan, setPlan] = useState<"daily" | "free">("daily");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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

  const go = (s: Step) => {
    setError(null);
    setNotice(null);
    setStep(s);
  };

  function chooseContinue() {
    if (plan === "free" && book) {
      if (unlockFreeBook(book.slug)) onUnlocked();
      else setError("You've used all 5 free books. Subscribe to keep reading.");
      return;
    }
    go({ kind: "phone", purpose: "subscribe" });
  }

  async function sendCode(purpose: Purpose, e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await auth.requestCode(phone, purpose);
      setPhone(prettyPhone(res.phone));
      setCode("");
      go({ kind: "code", purpose, phone: res.phone, resendAt: Date.now() + res.resendIn * 1000 });
      setNotice(`We sent a 6-digit code to ${prettyPhone(res.phone)}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    if (step.kind !== "code") return;
    setBusy(true);
    setError(null);
    try {
      const me = await auth.verifyCode(step.phone, code, step.purpose);
      notifyAccessChanged();
      if (step.purpose === "login" && !me.subscribed && book) {
        go({ kind: "choose" });
        setPlan("daily");
        setNotice(`You're signed in as ${prettyPhone(me.user.phone)}, but there's no active subscription on this number.`);
        return;
      }
      go({ kind: "success", me, purpose: step.purpose });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? err.message : (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="paywall-title">
      <button className="absolute inset-0 bg-forest-950/60 backdrop-blur-[2px]" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream-50 px-6 pb-8 pt-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-2 flex items-center justify-between">
          {step.kind === "code" || (step.kind === "phone" && book) ? (
            <button onClick={() => go(step.kind === "code" ? { kind: "phone", purpose: step.purpose } : { kind: "choose" })} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200" aria-label="Back">
              ‹
            </button>
          ) : (
            <span className="w-9" />
          )}
          <span className="text-base font-bold text-forest-800">Readly</span>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200" aria-label="Close">✕</button>
        </div>

        {step.kind === "choose" && book && (
          <>
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
                price={<>Ksh. {PRICE_KES}<span className="block text-[11px] font-semibold">Airtime / day</span></>}
                dark
              />
            </div>

            <Messages error={error} notice={notice} />
            <button onClick={chooseContinue} className="btn-primary mt-6 w-full py-3.5 text-base">
              {plan === "free" ? "Read with a free book" : `Subscribe · Ksh ${PRICE_KES}/day`}
            </button>
            <p className="mt-4 text-center text-xs text-muted">
              Already subscribed?{" "}
              <button onClick={() => go({ kind: "phone", purpose: "login" })} className="font-semibold text-forest-700 underline">
                Sign in with your number
              </button>
            </p>
          </>
        )}

        {step.kind === "phone" && (
          <form onSubmit={(e) => sendCode(step.purpose, e)}>
            <PhoneIcon />
            <h2 id="paywall-title" className="mt-4 text-center text-2xl font-bold text-forest-800">
              {step.purpose === "subscribe" ? "Enter your phone number" : "Sign in with your number"}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm text-muted">
              {step.purpose === "subscribe"
                ? `We'll send a verification code by SMS. Your subscription of Ksh ${PRICE_KES} airtime per day is linked to this number.`
                : "We'll send a verification code to the number you subscribed with."}
            </p>
            <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-forest-800" htmlFor="pw-phone">Phone number</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-cream-200 bg-white px-4 py-3 focus-within:border-forest-700">
              <span className="text-sm font-semibold text-forest-800">🇰🇪 +254</span>
              <input
                id="pw-phone"
                inputMode="tel"
                autoComplete="tel"
                autoFocus
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="712 345 678"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/60"
              />
            </div>
            <Messages error={error} notice={notice} />
            <button disabled={busy || phone.replace(/\D/g, "").length < 9} className="btn-primary mt-6 w-full py-3.5 text-base">
              {busy ? "Sending…" : "Send code"}
            </button>
          </form>
        )}

        {step.kind === "code" && (
          <form onSubmit={verify}>
            <PhoneIcon />
            <h2 id="paywall-title" className="mt-4 text-center text-2xl font-bold text-forest-800">Enter the code</h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm text-muted">
              Sent to <span className="font-semibold text-ink">{prettyPhone(step.phone)}</span>.{" "}
              <button type="button" onClick={() => go({ kind: "phone", purpose: step.purpose })} className="font-semibold text-forest-700 underline">
                Change
              </button>
            </p>
            <CodeInput value={code} onChange={(v) => { setCode(v); setError(null); }} />
            <Messages error={error} notice={notice} />
            <button disabled={busy || code.length !== 6} className="btn-primary mt-6 w-full py-3.5 text-base">
              {busy ? "Verifying…" : step.purpose === "subscribe" ? "Verify & subscribe" : "Verify & sign in"}
            </button>
            <Resend at={step.resendAt} onResend={() => sendCode(step.purpose)} disabled={busy} />
          </form>
        )}

        {step.kind === "success" && (
          <div className="text-center">
            <div className="mx-auto mt-4 grid h-16 w-16 place-items-center rounded-full bg-forest-800 text-white shadow-lg">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5L20 7" /></svg>
            </div>
            <h2 id="paywall-title" className="mt-5 text-2xl font-bold text-forest-800">
              {step.purpose === "subscribe" ? "Subscription Successful!" : "Welcome back!"}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
              {step.me.subscribed ? (
                <>
                  Your Readly Premium subscription is active
                  {step.me.subscription && <> until <span className="font-semibold text-ink">{formatEnd(step.me.subscription.endsAt)}</span></>}. Enjoy unlimited reading
                </>
              ) : (
                <>You&apos;re signed in. There&apos;s no active subscription on this number right now</>
              )}{" "}
              — your reading progress is saved to <span className="font-semibold text-ink">{prettyPhone(step.me.user.phone)}</span>.
            </p>
            {book && (
              <div className="mx-auto mt-5 flex max-w-xs items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm">
                {book.thumbUrl ? <img src={book.thumbUrl} alt="" className="h-16 w-11 rounded object-cover" /> : <div className="h-16 w-11 rounded bg-forest-700" />}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{book.title}</p>
                  <p className="truncate text-xs text-muted">{book.author}</p>
                </div>
              </div>
            )}
            <button onClick={onUnlocked} className="btn-gold mt-6 w-full py-3.5 text-base">{book ? "Start Reading" : "Continue"}</button>
          </div>
        )}
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

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative mx-auto mt-6 w-fit" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        autoFocus
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="6-digit code"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="absolute inset-0 h-full w-full opacity-0"
      />
      <div className="flex gap-2" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className={`grid h-14 w-11 place-items-center rounded-xl border-2 bg-white text-2xl font-bold text-forest-800 ${
              i === value.length ? "border-forest-700" : "border-cream-200"
            }`}
          >
            {value[i] ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function Resend({ at, onResend, disabled }: { at: number; onResend: () => void; disabled: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.ceil((at - now) / 1000));
  return (
    <p className="mt-4 text-center text-xs text-muted">
      Didn&apos;t get it?{" "}
      {left > 0 ? (
        <span>Resend in {left}s</span>
      ) : (
        <button type="button" onClick={onResend} disabled={disabled} className="font-semibold text-forest-700 underline">
          Resend code
        </button>
      )}
    </p>
  );
}

function Messages({ error, notice }: { error: string | null; notice: string | null }) {
  return (
    <>
      {notice && <p className="mt-4 rounded-xl bg-forest-50 px-3 py-2 text-center text-sm text-forest-800">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p>}
    </>
  );
}

function LockIcon() {
  return (
    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-100 text-forest-700">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
    </div>
  );
}

function PhoneIcon() {
  return (
    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-100 text-forest-700">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>
    </div>
  );
}

function formatEnd(iso: string) {
  return new Date(iso).toLocaleString("en-KE", { weekday: "short", hour: "numeric", minute: "2-digit", day: "numeric", month: "short" });
}
