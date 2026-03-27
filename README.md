# CimaNow

Next.js streaming-style application with Arabic RTL UI, category pages, detail pages, watch/download flows, dashboard auth, and Vercel-safe production behavior.

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Production Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Required Environment Variables

Copy from `.env.example` and set:

```bash
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=change-this-password
DASHBOARD_AUTH_SECRET=change-this-secret
```

## Vercel Safety

To avoid deployment failures:

- Production homepage/category APIs use local JSON catalogs from `lib/movies.json`, `lib/series.json`, and `lib/shows.json`
- The app does not depend on Google Fonts during build
- Build-time scraping of the core catalog was removed from production mode

See [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md) for deployment notes.
