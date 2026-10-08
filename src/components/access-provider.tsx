"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ACCESS_EVENT, auth, FREE_BOOK_LIMIT, freeBooks, type Me } from "@/lib/access";
import { Paywall, type PaywallBook } from "./paywall";

type Access = {
  /** undefined while loading, null when signed out */
  me: Me | null | undefined;
  subscribed: boolean;
  freeUsed: string[];
  freeLeft: number;
  canRead: (book: { slug: string; isFree: boolean }) => boolean;
  /** Opens the paywall for a book; resolves to true once the reader may open it. */
  openPaywall: (book: PaywallBook, then?: () => void) => void;
  /** Sign in with a phone number (to restore progress on a new device). */
  openSignIn: () => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<Access | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [freeUsed, setFreeUsed] = useState<string[]>([]);
  const [paywall, setPaywall] = useState<{ book?: PaywallBook; then?: () => void } | null>(null);

  const refresh = useCallback(async () => {
    setFreeUsed(freeBooks());
    try {
      setMe(await auth.me());
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    // Initial load of browser + server state (external systems).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const onChange = () => refresh();
    window.addEventListener(ACCESS_EVENT, onChange);
    return () => window.removeEventListener(ACCESS_EVENT, onChange);
  }, [refresh]);

  const subscribed = !!me?.subscribed;
  const value = useMemo<Access>(
    () => ({
      me,
      subscribed,
      freeUsed,
      freeLeft: Math.max(0, FREE_BOOK_LIMIT - freeUsed.length),
      canRead: (b) => b.isFree || subscribed || freeUsed.includes(b.slug),
      openPaywall: (book, then) => setPaywall({ book, then }),
      openSignIn: () => setPaywall({}),
      refresh,
      signOut: async () => {
        await auth.logout().catch(() => {});
        await refresh();
      },
    }),
    [me, subscribed, freeUsed, refresh],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {paywall && (
        <Paywall
          book={paywall.book}
          onClose={() => setPaywall(null)}
          onUnlocked={() => {
            const then = paywall.then;
            setPaywall(null);
            then?.();
          }}
        />
      )}
    </Ctx.Provider>
  );
}

export function useAccess() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAccess must be used inside <AccessProvider>");
  return v;
}
