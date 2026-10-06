# Readly

The reader-facing web app for **Readly**, a digital library of EPUB books. Built with Next.js 16
(App Router) and Tailwind CSS 4, following the Readly Figma designs.

Part of three repos:

| Repo | What it is | Port |
|---|---|---|
| **readly** (this) | Reader site: browse, book pages, EPUB reader | 3000 |
| [readly-api](https://github.com/ai-code-101/readly-api) | Go + PostgreSQL API; stores books, covers and EPUBs | 8080 |
| [readly-admin](https://github.com/ai-code-101/readly-admin) | Admin app for uploading books and managing categories | 3001 |

## What's included

- **Home**: hero with Book of the Day, stats, genres, Trending, Free to read, New releases
- **Categories**: all categories with Trending and Staff Picks rows, plus a page per category with sort
  (Most Popular / New Releases / Highest Rated / A–Z), search and pagination
- **Discover**: search across the whole library; filters for trending, staff picks and free books
- **Book page**: cover, rating, category, page count, reading time, synopsis, Start/Continue Reading,
  Save to Library, You May Also Like
- **Reader** (`/read/[slug]`), built on [epub.js](https://github.com/futurepress/epub.js):
  - paginated, one page on phones and two on wide screens
  - swipe, arrow keys, or tap/click to turn pages
  - table of contents, with the current chapter shown in the header
  - progress bar, "% completed" and "Page X of Y" (Y is the page count set in the admin)
  - display settings: font size, brightness, White / Grey / Dark themes, Serif / Sans, line spacing
  - reopens at the page where you stopped
- **My Library**: your current read with its progress, books you're also reading, and saved books

Until user accounts exist, reading progress, saved books and reader settings are stored in the
browser's `localStorage`.

## Run everything locally

```bash
# 1. API + Postgres (in readly-api)
docker compose up -d db && cp .env.example .env && make seed && make run

# 2. Admin (in readly-admin): upload a few EPUBs at http://localhost:3001
cp .env.example .env.local && npm install && npm run dev

# 3. Reader (here)
cp .env.example .env.local && npm install && npm run dev   # http://localhost:3000
```

`READLY_API_URL` (default `http://localhost:8080`) is used for server-side data fetching. Requests to
`/api/v1/*` from the browser (covers, EPUB files) are forwarded to the API through a rewrite in
`next.config.ts`.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npm run typecheck`

## Planned next

- Sign up / login (email OTP from support@peakmobile.co.ke, Google sign-in)
- Free plan: 5 free books, then the paywall; M-Pesa (Safaricom STK push) subscriptions
  (hook points are marked `TODO(paywall)`)
- Server-side progress and library sync, highlights, word definitions / My Vocabulary
