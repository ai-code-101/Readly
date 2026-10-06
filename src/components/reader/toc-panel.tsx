"use client";

import type { THEMES } from "./settings";

export type TocEntry = { label: string; href: string; depth: number };

export function TocPanel({
  entries,
  current,
  theme,
  onSelect,
  onClose,
}: {
  entries: TocEntry[];
  current: string;
  theme: (typeof THEMES)[keyof typeof THEMES];
  onSelect: (href: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Table of contents">
      <button className="flex-1 bg-black/40" onClick={onClose} aria-label="Close contents" />
      <div className="flex h-full w-[85%] max-w-sm flex-col shadow-2xl" style={{ background: theme.bg, color: theme.fg }}>
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-2xl">Contents</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5" aria-label="Close">✕</button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-6">
          {entries.map((e, i) => {
            const active = e.label === current;
            return (
              <button
                key={`${e.href}-${i}`}
                onClick={() => onSelect(e.href)}
                className={`block w-full rounded-lg py-2.5 pr-3 text-left text-sm hover:bg-black/5 ${active ? "font-bold" : ""}`}
                style={{ paddingLeft: 12 + e.depth * 16, color: active ? theme.link : undefined }}
              >
                {e.label || "Untitled section"}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
