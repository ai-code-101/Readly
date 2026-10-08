"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type Book from "epubjs/types/book";
import type Rendition from "epubjs/types/rendition";
import type { Location } from "epubjs/types/rendition";
import type { NavItem } from "epubjs/types/navigation";
import { getProgress, setProgress, type Progress } from "@/lib/shelf";
import { progressApi } from "@/lib/access";
import { contentCss, FONT_CSS_URL, loadSettings, saveSettings, THEMES, type ReaderSettings } from "./settings";
import { SettingsPanel } from "./settings-panel";
import { TocPanel, type TocEntry } from "./toc-panel";

export type ReaderBook = {
  slug: string;
  title: string;
  author: string;
  thumbUrl: string;
  epubUrl: string;
  pageCount: number;
};

type Status = { kind: "loading"; percent: number | null } | { kind: "ready" } | { kind: "error"; message: string };

const LOCATION_CHARS = 1200;

/** syncToServer: the reader is signed in, so progress is also saved to (and restored from) the API. */
export function Reader({ book: meta, syncToServer = false }: { book: ReaderBook; syncToServer?: boolean }) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const tocRef = useRef<TocEntry[]>([]);

  const [status, setStatus] = useState<Status>({ kind: "loading", percent: null });
  // Rendered client-only (see reader-client.tsx), so localStorage is available here.
  const [settings, setSettings] = useState<ReaderSettings>(loadSettings);
  const [panel, setPanel] = useState<"settings" | "toc" | null>(null);
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [chapter, setChapter] = useState("");
  const [percent, setPercent] = useState<number | null>(null); // whole-book progress, once locations exist
  const [chapterPage, setChapterPage] = useState<{ page: number; total: number } | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Pages opened later read the current settings from here (see the content hook below).
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
    saveSettings(settings);
    const css = contentCss(settings);
    for (const c of (renditionRef.current?.getContents() ?? []) as unknown as { document: Document }[]) {
      upsertStyle(c.document, css);
    }
  }, [settings]);

  // Open the book once.
  useEffect(() => {
    if (bookRef.current) return;
    let cancelled = false;
    // Keyboard (inside and outside the book iframe) and swipe page turning.
    const nav = createNavigation(() => renditionRef.current);
    // epub.js reports 0% while locations are still being generated, so only trust
    // percentages once generation (or loading from cache) has finished.
    let locationsReady = false;
    window.addEventListener("keyup", nav.onKey);

    (async () => {
      try {
        const data = await download(meta.epubUrl, (p) => !cancelled && setStatus({ kind: "loading", percent: p }));
        if (cancelled) return;
        const { default: ePub } = await import("epubjs");
        const book = ePub(data);
        bookRef.current = book;
        await book.ready;

        const rendition = book.renderTo(viewerRef.current!, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "auto",
          minSpreadWidth: 1000,
          allowScriptedContent: false,
        });
        renditionRef.current = rendition;
        // Style every page as it is rendered. (epub.js's own themes API doesn't
        // re-apply CSS-string themes to pages opened later, so we inject our own <style>.)
        rendition.hooks.content.register((contents: { document: Document; addStylesheet: (url: string) => Promise<boolean> }) => {
          upsertStyle(contents.document, contentCss(settingsRef.current));
          return contents.addStylesheet(FONT_CSS_URL);
        });

        const navigation = await book.loaded.navigation;
        const entries = flattenToc(navigation.toc);
        tocRef.current = entries;
        setToc(entries);

        rendition.on("relocated", (loc: Location) => onRelocated(loc));
        rendition.on("keyup", nav.onKey);
        rendition.on("touchstart", nav.onTouchStart);
        rendition.on("touchend", nav.onTouchEnd);

        // Resume from whichever position is newer: this browser's or the account's.
        let saved = getProgress(meta.slug);
        if (syncToServer) {
          const remote = await progressApi.get(meta.slug).catch(() => null);
          if (remote && (!saved || Date.parse(remote.updatedAt) > saved.updatedAt)) {
            saved = { ...(saved ?? { slug: meta.slug, title: meta.title, author: meta.author, thumbUrl: meta.thumbUrl }), cfi: remote.cfi, percent: remote.percent, chapter: remote.chapter, updatedAt: Date.parse(remote.updatedAt) };
          }
        }
        await rendition.display(saved?.cfi || undefined).catch(() => rendition.display());
        if (cancelled) return;
        setStatus({ kind: "ready" });

        // Whole-book percentages need "locations"; generating them takes a moment
        // for long books, so cache them per book file.
        const cacheKey = `readly:locations:${meta.slug}:${data.byteLength}`;
        const cached = safeGet(cacheKey);
        if (cached) book.locations.load(cached);
        else {
          await book.locations.generate(LOCATION_CHARS);
          safeSet(cacheKey, book.locations.save());
        }
        locationsReady = true;
        if (!cancelled) {
          const loc = rendition.currentLocation() as unknown as Location;
          if (loc?.start) onRelocated(loc);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus({ kind: "error", message: "This book could not be opened. Please try again later." });
      }
    })();

    function onRelocated(loc: Location) {
      const book = bookRef.current;
      if (!book || !loc?.start) return;
      const href = loc.start.href;
      const title = chapterTitle(tocRef.current, href);
      setChapter(title);
      setAtStart(loc.atStart);
      setAtEnd(loc.atEnd);
      setChapterPage(loc.start.displayed);
      const p = locationsReady ? (loc.atEnd ? 1 : book.locations.percentageFromCfi(loc.start.cfi)) : null;
      if (p !== null) setPercent(p);
      const progress: Progress = {
        slug: meta.slug,
        title: meta.title,
        author: meta.author,
        thumbUrl: meta.thumbUrl,
        cfi: loc.start.cfi,
        percent: p ?? getProgress(meta.slug)?.percent ?? 0,
        chapter: title,
        updatedAt: Date.now(),
      };
      setProgress(progress);
      if (syncToServer) {
        pending = progress;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(flush, 2000);
      }
    }

    // Saves to the account are batched: at most one request per 2 s of reading,
    // plus a final one when the reader leaves the page.
    let pending: Progress | null = null;
    let syncTimer: ReturnType<typeof setTimeout> | undefined;
    function flush() {
      if (!pending) return;
      const p = pending;
      pending = null;
      progressApi
        .put(p.slug, { cfi: p.cfi, percent: p.percent, chapter: p.chapter, updatedAt: new Date(p.updatedAt).toISOString() })
        .catch(() => {});
    }
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cancelled = true;
      clearTimeout(syncTimer);
      flush();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("keyup", nav.onKey);
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
      renditionRef.current = null;
      bookRef.current = null;
    };
    // Open once per book; settings changes are applied by the effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.epubUrl]);

  const next = useCallback(() => renditionRef.current?.next(), []);
  const prev = useCallback(() => renditionRef.current?.prev(), []);
  const theme = THEMES[settings.theme];
  const totalPages = meta.pageCount || null;
  const pageLabel =
    percent !== null && totalPages
      ? `Page ${Math.min(totalPages, Math.max(1, Math.round(percent * totalPages)))} of ${totalPages}`
      : chapterPage
        ? `Page ${chapterPage.page} of ${chapterPage.total} in chapter`
        : "";

  return (
    <div
      className="fixed inset-0 flex flex-col transition-colors"
      style={{ background: theme.bg, color: theme.fg, filter: `brightness(${settings.brightness / 100})` }}
    >
      {/* Header (Figma: book-reading-page) */}
      <header className="flex h-14 shrink-0 items-center gap-2 px-3 sm:px-6" style={{ background: theme.chrome }}>
        <Link href={`/books/${meta.slug}`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5" aria-label="Back to book details">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-bold">{meta.title}</p>
          <p className="truncate text-xs" style={{ color: theme.muted }}>{chapter || meta.author}</p>
        </div>
        <button onClick={() => setPanel(panel === "toc" ? null : "toc")} className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5" aria-label="Table of contents" disabled={!toc.length}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        </button>
        <button onClick={() => setPanel(panel === "settings" ? null : "settings")} className="grid h-10 w-10 place-items-center rounded-full font-display text-xl hover:bg-black/5" aria-label="Display settings">
          Aa
        </button>
      </header>

      {/* Book */}
      <div className="relative min-h-0 flex-1">
        <div ref={viewerRef} className="absolute inset-0 mx-auto max-w-6xl px-2 sm:px-10" />
        {status.kind === "ready" && (
          <>
            <button onClick={prev} disabled={atStart} className="absolute inset-y-0 left-0 z-10 hidden w-12 items-center justify-center opacity-40 hover:opacity-90 disabled:invisible sm:flex" aria-label="Previous page">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={next} disabled={atEnd} className="absolute inset-y-0 right-0 z-10 hidden w-12 items-center justify-center opacity-40 hover:opacity-90 disabled:invisible sm:flex" aria-label="Next page">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </>
        )}
        {status.kind !== "ready" && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center" style={{ background: theme.bg }}>
            {status.kind === "loading" ? (
              <div className="w-64">
                <p className="font-display text-2xl">{meta.title}</p>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>Opening book…</p>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div
                    className={`h-full rounded-full bg-gold transition-all ${status.percent === null ? "w-1/3 animate-pulse" : ""}`}
                    style={status.percent !== null ? { width: `${Math.round(status.percent * 100)}%` } : undefined}
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="font-display text-2xl">Something went wrong</p>
                <p className="mt-2 text-sm" style={{ color: theme.muted }}>{status.message}</p>
                <Link href={`/books/${meta.slug}`} className="btn-primary mt-6">Back to book</Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer: progress */}
      <footer className="shrink-0 px-5 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 sm:px-10" style={{ background: theme.chrome }}>
        <div className="mx-auto max-w-3xl">
          <div className="h-1 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-gold transition-[width] duration-300" style={{ width: `${(percent ?? 0) * 100}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs" style={{ color: theme.muted }}>
            <span>{percent !== null ? `${Math.round(percent * 100)}% completed` : "Calculating progress…"}</span>
            {/* Mobile tap targets */}
            <span className="flex gap-1 sm:hidden">
              <button onClick={prev} disabled={atStart} className="rounded-full px-3 py-1 disabled:opacity-30" aria-label="Previous page">‹ Prev</button>
              <button onClick={next} disabled={atEnd} className="rounded-full px-3 py-1 disabled:opacity-30" aria-label="Next page">Next ›</button>
            </span>
            <span>{pageLabel}</span>
          </div>
        </div>
      </footer>

      {panel === "settings" && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setPanel(null)} />
      )}
      {panel === "toc" && (
        <TocPanel
          entries={toc}
          current={chapter}
          theme={theme}
          onSelect={(href) => {
            renditionRef.current?.display(href);
            setPanel(null);
          }}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  );
}

function upsertStyle(doc: Document, css: string) {
  let el = doc.getElementById("readly-theme");
  if (!el) {
    el = doc.createElement("style");
    el.id = "readly-theme";
    (doc.head ?? doc.documentElement).appendChild(el);
  }
  el.textContent = css;
}

/** Page turning via keyboard and horizontal swipes. */
function createNavigation(getRendition: () => Rendition | null) {
  let touch: { x: number; y: number; t: number } | null = null;
  const next = () => getRendition()?.next();
  const prev = () => getRendition()?.prev();
  return {
    next,
    prev,
    onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "PageDown") next();
      if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
    },
    onTouchStart(e: TouchEvent) {
      const t = e.changedTouches[0];
      touch = { x: t.screenX, y: t.screenY, t: Date.now() };
    },
    onTouchEnd(e: TouchEvent) {
      const start = touch;
      touch = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.screenX - start.x;
      const dy = t.screenY - start.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - start.t < 800) {
        if (dx < 0) next();
        else prev();
      }
    },
  };
}

async function download(url: string, onProgress: (p: number | null) => void): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const total = Number(res.headers.get("content-length")) || 0;
  if (!res.body || !total) return res.arrayBuffer();
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(received / total);
  }
  const out = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out.buffer;
}

function flattenToc(items: NavItem[], depth = 0): TocEntry[] {
  return items.flatMap((i) => [{ label: i.label.trim(), href: i.href, depth }, ...flattenToc(i.subitems ?? [], depth + 1)]);
}

/** Title of the TOC entry for the given spine href (ignoring #fragments). */
function chapterTitle(entries: TocEntry[], href: string) {
  const base = (h: string) => h.split("#")[0].replace(/^\.?\//, "");
  const target = base(href);
  const match = entries.find((e) => base(e.href) === target || target.endsWith(base(e.href)) || base(e.href).endsWith(target));
  return match?.label ?? "";
}

function safeGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {}
}
