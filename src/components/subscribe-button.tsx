"use client";

import { useAccess } from "./access-provider";

/** Figma Home: "Subscribe Now" in the top bar; subscribers see a Premium badge instead. */
export function SubscribeButton({ className = "" }: { className?: string }) {
  const access = useAccess();
  if (access.me === undefined) return null; // still loading: avoid flashing the button for subscribers
  if (access.subscribed) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5 text-xs font-bold text-forest-900 ${className}`}>
        ★ Premium
      </span>
    );
  }
  return (
    <button onClick={() => access.openSubscribe()} className={`btn-primary px-5 py-3 ${className}`}>
      Subscribe Now
    </button>
  );
}
