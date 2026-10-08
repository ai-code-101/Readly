// Reader access: subscription (server, via the session cookie) and the
// 5 free books (tracked in this browser until accounts are required).
"use client";

export const FREE_BOOK_LIMIT = 5;
const FREE_KEY = "readly:free-books";
export const ACCESS_EVENT = "readly:access";

export type Me = {
  user: { id: string; phone: string; createdAt: string };
  subscription: { id: string; plan: string; amountKes: number; startsAt: string; endsAt: string } | null;
  subscribed: boolean;
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public retryAfter?: number) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, { credentials: "same-origin", cache: "no-store", ...init });
  if (!res.ok) {
    let msg = "Something went wrong. Please try again.";
    try {
      const b = await res.json();
      if (b?.error) msg = b.error;
    } catch {}
    throw new ApiError(res.status, msg, Number(res.headers.get("retry-after")) || undefined);
  }
  return (res.status === 204 ? undefined : res.json()) as T;
}

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export type Purpose = "subscribe" | "login";

export const auth = {
  /** The signed-in reader, or null. */
  me: () => call<Me>("/me").catch((e) => (e instanceof ApiError && e.status === 401 ? null : Promise.reject(e))),
  requestCode: (phone: string, purpose: Purpose) =>
    call<{ phone: string; expiresIn: number; resendIn: number }>("/auth/otp/request", post({ phone, purpose })),
  verifyCode: (phone: string, code: string, purpose: Purpose) =>
    call<Me>("/auth/otp/verify", post({ phone, code, purpose })),
  logout: () => call<void>("/auth/logout", { method: "POST" }),
};

export type ServerProgress = { slug: string; title: string; author: string; thumbUrl: string; cfi: string; percent: number; chapter: string; updatedAt: string };

export const progressApi = {
  list: () => call<ServerProgress[]>("/me/progress"),
  get: (slug: string) =>
    call<ServerProgress>(`/me/progress/${encodeURIComponent(slug)}`).catch((e) =>
      e instanceof ApiError && e.status === 404 ? null : Promise.reject(e),
    ),
  put: (slug: string, p: { cfi: string; percent: number; chapter: string; updatedAt: string }) =>
    call<void>(`/me/progress/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
      keepalive: true, // lets the last save finish while the page closes
    }),
};

// ---- free books (browser) -------------------------------------------------------

export function freeBooks(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(FREE_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Uses one of the free-book slots for this book. Returns false if none are left. */
export function unlockFreeBook(slug: string): boolean {
  const list = freeBooks();
  if (list.includes(slug)) return true;
  if (list.length >= FREE_BOOK_LIMIT) return false;
  try {
    localStorage.setItem(FREE_KEY, JSON.stringify([...list, slug]));
    window.dispatchEvent(new Event(ACCESS_EVENT));
  } catch {
    return false;
  }
  return true;
}

export function notifyAccessChanged() {
  window.dispatchEvent(new Event(ACCESS_EVENT));
}

/** "254743410697" -> "0743 410 697" */
export function prettyPhone(p: string) {
  const local = p.startsWith("254") ? "0" + p.slice(3) : p;
  return local.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
}
