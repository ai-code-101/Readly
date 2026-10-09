# Readly

The reader-facing web app for **Readly**, a digital library of EPUB books. Built with Next.js 16
(App Router) and Tailwind CSS 4, following the Readly Figma designs.

Part of three repos:

| Repo | What it is | Port |
|---|---|---|
| **readly** (this) | Reading platform: home, browse, book pages, paywall, EPUB reader | 3000 |
| [readly-website](https://github.com/ai-code-101/readly-website) | Marketing site; "Start Reading" links here | 3002 |
| [readly-api](https://github.com/ai-code-101/readly-api) | Go + PostgreSQL API; stores books, covers and EPUBs | 8080 |
| [readly-admin](https://github.com/ai-code-101/readly-admin) | Admin app for uploading books and managing categories | 3001 |

## What's included

- **Home** (Figma "Home"): search, today's trending books ("What everyone is reading"), then a shelf
  per category; shows free books left / subscription status and "continue reading"
- **Paywall** on premium books, with two options:
  - **Free Plan** — use one of **5 free books** (counted in this browser)
  - **Daily Payment, Ksh 10 airtime** — enter a phone number, verify the SMS code, and the
    subscription is active for 24 h ("Subscription Successful!"). Airtime billing isn't connected yet,
    so verifying the number is enough for now.
  - "Already subscribed? Sign in with your number" restores access and progress on another device
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

Reading progress is kept in the browser for everyone. Once a reader has subscribed (and is signed in
with their number) it is also saved to the database, so it follows them to other devices. Saved books
and reader settings stay in the browser.

## Run everything locally

```bash
# 1. API + Postgres (in readly-api)
docker compose up -d db && cp .env.example .env && make seed && make run

# 2. Admin (in readly-admin): upload a few EPUBs at http://localhost:3001
cp .env.example .env.local && npm install && npm run dev

# 3. Platform (here)
cp .env.example .env.local && npm install && npm run dev   # http://localhost:3000
```

`READLY_API_URL` (default `http://localhost:8080`) is the API's base URL. The server uses it to load
pages, and browser requests to `/api/v1/*` (covers, EPUB files, sign-in, progress) are proxied to it by
`src/app/api/v1/[...path]/route.ts`, which also passes the session cookie through. Admin endpoints are
never proxied.

### Hosting (Netlify, Vercel, …)

Set `READLY_API_URL` in the host's environment variables to the public API URL (e.g. an ngrok
tunnel such as `https://your-name.ngrok-free.dev`, no trailing slash needed) and redeploy. Requests to
the API carry `ngrok-skip-browser-warning`, so free ngrok tunnels don't answer with their HTML warning
page. Because the site is served over HTTPS, set `COOKIE_SECURE=true` in the API's `.env`.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npm run typecheck`

## Planned next

- Real airtime billing for the daily plan
- Enforcing the paywall on the API's EPUB download too (today it is enforced in the app)
- Highlights, word definitions / My Vocabulary
