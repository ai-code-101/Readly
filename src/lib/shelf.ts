// Per-device reading state kept in localStorage until user accounts exist.
// When login lands, these become API calls; the shapes are kept deliberately small.

export type BookRef = { slug: string; title: string; author: string; thumbUrl: string };

export type Progress = BookRef & {
  cfi: string; // epub.js location (EPUB CFI)
  percent: number; // 0..1
  chapter: string;
  updatedAt: number;
};

export type Saved = BookRef & { addedAt: number };

const PROGRESS_PREFIX = "readly:progress:";
const SAVED_KEY = "readly:saved";
export const SHELF_EVENT = "readly:shelf";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(SHELF_EVENT));
  } catch {
    // Storage full or unavailable (private mode): reading still works, progress just isn't kept.
  }
}

export const getProgress = (slug: string) => read<Progress>(PROGRESS_PREFIX + slug);
export const setProgress = (p: Progress) => write(PROGRESS_PREFIX + p.slug, p);

export function allProgress(): Progress[] {
  const out: Progress[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PROGRESS_PREFIX)) {
        const p = read<Progress>(k);
        if (p) out.push(p);
      }
    }
  } catch {}
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}

export const getSaved = () => read<Saved[]>(SAVED_KEY) ?? [];
export const isSaved = (slug: string) => getSaved().some((s) => s.slug === slug);

export function toggleSaved(book: BookRef): boolean {
  const saved = getSaved();
  if (saved.some((s) => s.slug === book.slug)) {
    write(SAVED_KEY, saved.filter((s) => s.slug !== book.slug));
    return false;
  }
  write(SAVED_KEY, [{ ...book, addedAt: Date.now() }, ...saved]);
  return true;
}
