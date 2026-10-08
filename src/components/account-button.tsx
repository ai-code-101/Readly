"use client";

import Link from "next/link";
import { useState } from "react";
import { prettyPhone } from "@/lib/access";
import { useAccess } from "./access-provider";

/** Header account control: library link for visitors, phone + plan + sign out for signed-in readers. */
export function AccountButton() {
  const access = useAccess();
  const [open, setOpen] = useState(false);

  if (!access.me) {
    return (
      <Link href="/library" className="btn-primary px-5 py-2.5">My Library</Link>
    );
  }
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full border border-cream-300 bg-white py-1.5 pl-1.5 pr-4 text-sm" aria-expanded={open}>
        <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${access.subscribed ? "bg-gold text-forest-950" : "bg-cream-200 text-muted"}`}>
          {access.subscribed ? "★" : "•"}
        </span>
        <span className="font-semibold text-forest-900">{prettyPhone(access.me.user.phone)}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-cream-200 bg-white p-4 text-sm shadow-xl">
          <p className="font-bold text-forest-800">{access.subscribed ? "Readly Premium" : "No active subscription"}</p>
          {access.me.subscription && (
            <p className="text-xs text-muted">Active until {new Date(access.me.subscription.endsAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}</p>
          )}
          <Link href="/library" onClick={() => setOpen(false)} className="mt-3 block rounded-lg px-2 py-1.5 hover:bg-cream-100">My Library</Link>
          <button onClick={() => { setOpen(false); access.signOut(); }} className="block w-full rounded-lg px-2 py-1.5 text-left text-red-700 hover:bg-red-50">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
