# Portfolio Builder

Build an animated portfolio website, preview it live, then download it or deploy it to Netlify.
No accounts and no database: data lives in the browser (`localStorage`), with JSON backup/restore.

## Features

- **One generator** (`lib/generateSite.ts`) produces a single self-contained `index.html`.
  The live preview, the ZIP download and the Netlify deploy all use it, so the preview is exactly
  what gets published. All user input is HTML-escaped and links are limited to http(s)/mailto.
- 14 theme presets, 5 layouts (grid, minimal, brutalist, neon, terminal), custom colors and fonts,
  scroll animations and canvas backgrounds (respects `prefers-reduced-motion`), optional hover sounds.
  SEO meta, Open Graph and JSON-LD included.
- **AI** (Groq, server-side key; default model `openai/gpt-oss-120b`):
  - import from a pasted resume / LinkedIn profile
  - write the bio, polish project descriptions, suggest skills
  - generate a theme from a description ("dark navy with warm orange accents")
  - floating assistant that knows your current portfolio
- **Deploy**: Netlify personal access token → creates a site on first deploy, updates the same
  site afterwards. The token passes through `/api/deploy` (Netlify has no browser CORS) and is never stored server-side.

## Setup

```bash
npm install
cp .env.example .env.local   # add GROQ_API_KEY
npm run dev
```

Works without a key; the AI buttons will say AI isn't configured.

## Deploy the builder

Any Node host (Vercel, Netlify, Docker). Set `GROQ_API_KEY`.

### Rate limiting

AI requests are limited per visitor IP (default 8/minute and 100/day) plus an app-wide cap
(60/minute) so many IPs together can't drain your Groq quota. Deploys are limited to 6/minute
and 60/day. Blocked requests get a 429 with `Retry-After`, and the browser stops sending AI calls
until the wait is over. Tune the limits with the variables in `.env.example`.

Counts are kept in memory unless `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set.
On serverless hosts each instance has its own memory, so add a free Upstash Redis database there
for limits that actually hold.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run typecheck`
