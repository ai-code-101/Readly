"use client";

/* eslint-disable @next/next/no-img-element -- covers are served by the Readly API */
import Link from "next/link";
import { useEffect, useState } from "react";
import { allProgress, SHELF_EVENT, type Progress } from "@/lib/shelf";
import { prettyPhone } from "@/lib/access";
import { useAccess } from "./access-provider";

/** Small personal strip on Home: subscription state (subscribers only) + "continue reading". */
export function HomeGreeting() {
  const access = useAccess();
  const [current, setCurrent] = useState<Progress | null>(null);

  useEffect(() => {
    const sync = () => setCurrent(allProgress()[0] ?? null);
    sync();
    window.addEventListener(SHELF_EVENT, sync);
    return () => window.removeEventListener(SHELF_EVENT, sync);
  }, []);

  if (access.me === undefined || (!access.subscribed && !current)) return null;

  return (
    <div className="mx-auto mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
      {access.subscribed && access.me ? (
        <div className="rounded-2xl bg-gold/15 px-4 py-3 text-sm">
          <p className="font-bold text-forest-900">Readly Premium · active</p>
          <p className="text-xs text-forest-900/80">
            {prettyPhone(access.me.user.phone)} · until{" "}
            {access.me.subscription && new Date(access.me.subscription.endsAt).toLocaleString("en-KE", { weekday: "short", hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
      ) : null}
      {current && (
        <Link href={`/read/${current.slug}`} className="flex items-center gap-3 rounded-2xl border border-cream-200 bg-white px-3 py-2.5 hover:border-forest-700">
          {current.thumbUrl ? <img src={current.thumbUrl} alt="" className="h-12 w-8 rounded object-cover" /> : <span className="h-12 w-8 rounded bg-forest-700" />}
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-forest-700">Continue reading · {Math.round(current.percent * 100)}%</span>
            <span className="block truncate text-sm font-semibold">{current.title}</span>
          </span>
          <span aria-hidden className="text-forest-700">›</span>
        </Link>
      )}
    </div>
  );
}
