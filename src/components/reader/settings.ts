export type ReaderTheme = "white" | "grey" | "dark";
export type FontFace = "serif" | "sans";
export type Spacing = "tight" | "normal" | "wide";

export type ReaderSettings = {
  fontSize: number; // px
  brightness: number; // 40..100 (%)
  theme: ReaderTheme;
  font: FontFace;
  spacing: Spacing;
};

export const DEFAULT_SETTINGS: ReaderSettings = { fontSize: 18, brightness: 100, theme: "white", font: "serif", spacing: "normal" };

// Figma: reading-theme-white / -grey / -dark
export const THEMES: Record<ReaderTheme, { label: string; bg: string; fg: string; chrome: string; muted: string; link: string }> = {
  white: { label: "White", bg: "#fbf9f4", fg: "#1d2a25", chrome: "#fbf9f4", muted: "#6b7a73", link: "#11604d" },
  grey: { label: "Grey", bg: "#e6e5e1", fg: "#22272a", chrome: "#e6e5e1", muted: "#5f6669", link: "#11604d" },
  dark: { label: "Dark", bg: "#141917", fg: "#e4e0d5", chrome: "#141917", muted: "#99a39e", link: "#8fcfb5" },
};

export const LINE_HEIGHT: Record<Spacing, number> = { tight: 1.35, normal: 1.65, wide: 1.95 };

export const FONT_STACK: Record<FontFace, string> = {
  serif: "'Literata', Georgia, 'Times New Roman', serif",
  sans: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
};

export const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400&family=Inter:wght@400;600&display=swap";

const KEY = "readly:reader-settings";

export function loadSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(s: ReaderSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

/** CSS injected into each EPUB page so the reader's settings win over the book's own styles. */
export function contentCss(s: ReaderSettings) {
  const t = THEMES[s.theme];
  return `
    html, body { background: ${t.bg} !important; color: ${t.fg} !important; }
    body {
      font-family: ${FONT_STACK[s.font]} !important;
      font-size: ${s.fontSize}px !important;
      line-height: ${LINE_HEIGHT[s.spacing]} !important;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    p, li, blockquote, dd, dt, td, span, div { font-family: inherit !important; line-height: inherit !important; color: inherit !important; }
    p, li, blockquote { font-size: 1em !important; }
    a, a:visited { color: ${t.link} !important; }
    ::selection { background: rgba(227, 178, 60, 0.35); }
  `;
}
