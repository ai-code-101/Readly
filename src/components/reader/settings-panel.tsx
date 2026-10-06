"use client";

import type { ReactNode } from "react";
import { THEMES, type ReaderSettings, type ReaderTheme, type FontFace, type Spacing } from "./settings";

/** Display settings sheet (Figma: reading-settings-panel). */
export function SettingsPanel({
  settings: s,
  onChange,
  onClose,
}: {
  settings: ReaderSettings;
  onChange: (s: ReaderSettings) => void;
  onClose: () => void;
}) {
  const set = <K extends keyof ReaderSettings>(k: K, v: ReaderSettings[K]) => onChange({ ...s, [k]: v });

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-start sm:justify-end" role="dialog" aria-modal="true" aria-label="Display settings">
      <button className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close settings" />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 text-ink shadow-2xl sm:mr-4 sm:mt-16 sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-cream-300 sm:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-forest-800">Display Settings</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream-100" aria-label="Close">✕</button>
        </div>

        <Row label="Font Size" value={`${s.fontSize}px`}>
          <div className="flex items-center gap-3">
            <span className="text-sm">A</span>
            <input type="range" min={14} max={28} step={1} value={s.fontSize} onChange={(e) => set("fontSize", Number(e.target.value))} className="flex-1 accent-forest-800" aria-label="Font size" />
            <span className="text-xl">A</span>
          </div>
        </Row>

        <Row label="Brightness" value={`${s.brightness}%`}>
          <div className="flex items-center gap-3">
            <SunIcon small />
            <input type="range" min={40} max={100} step={1} value={s.brightness} onChange={(e) => set("brightness", Number(e.target.value))} className="flex-1 accent-forest-800" aria-label="Brightness" />
            <SunIcon />
          </div>
        </Row>

        <Row label="Background Theme">
          <div className="flex gap-3">
            {(Object.keys(THEMES) as ReaderTheme[]).map((k) => (
              <button
                key={k}
                onClick={() => set("theme", k)}
                aria-pressed={s.theme === k}
                className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold ${s.theme === k ? "border-forest-700" : "border-cream-200"}`}
                style={{ background: THEMES[k].bg, color: THEMES[k].fg }}
              >
                {THEMES[k].label}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Font Face">
          <Segmented<FontFace>
            value={s.font}
            onChange={(v) => set("font", v)}
            options={[
              ["serif", <span key="s" className="font-reading">Serif</span>],
              ["sans", <span key="n" className="font-sans">Sans</span>],
            ]}
          />
        </Row>

        <Row label="Line Spacing" last>
          <Segmented<Spacing>
            value={s.spacing}
            onChange={(v) => set("spacing", v)}
            options={[["tight", "Tight"], ["normal", "Normal"], ["wide", "Wide"]]}
          />
        </Row>
      </div>
    </div>
  );
}

function Row({ label, value, last, children }: { label: string; value?: string; last?: boolean; children: ReactNode }) {
  return (
    <div className={last ? "" : "mb-5"}>
      <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-muted">
        <span>{label}</span>
        {value && <span className="text-forest-800">{value}</span>}
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, ReactNode][] }) {
  return (
    <div className="flex rounded-xl bg-cream-100 p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${value === v ? "bg-forest-800 text-white shadow" : "text-muted hover:text-ink"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SunIcon({ small }: { small?: boolean }) {
  const s = small ? 14 : 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="text-muted">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
