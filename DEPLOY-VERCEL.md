# Vercel Deployment Guide

## Important

This project is now configured to avoid relying on live scraping during production builds.
On Vercel production builds, the homepage, featured content, movies, series, and shows use the local JSON catalogs in `lib/*.json`.
This prevents `403` errors from external sites during `next build`.

## Recommended Project Settings

1. Import the repository into Vercel as a `Next.js` project.
2. Keep the default framework preset: `Next.js`.
3. Use Node.js `20.x`.
4. Do not override the build command unless needed.

## Required Environment Variables

Add these in Vercel Project Settings -> Environment Variables:

```bash
DASHBOARD_USERNAME=your-dashboard-username
DASHBOARD_PASSWORD=your-strong-password
DASHBOARD_AUTH_SECRET=your-long-random-secret
```

If you do not set them, the dashboard login route will intentionally stay unavailable.

## Why Deployments Should Now Be Stable

- No Google Fonts fetch is required during build.
- Production catalog routes use local JSON instead of scraping external pages.
- Listing APIs in production support paging/search against local data.
- Images are served from local files or through the app image proxy.

## Before Clicking Deploy

Run locally:

```bash
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

## If Vercel Still Shows Old 403 Build Logs

That usually means Vercel is building an older commit.

Make sure:

1. The latest commit is pushed to `main`.
2. Vercel is connected to the same repository.
3. You trigger a fresh redeploy from the latest commit.

## Notes

- `mix` pages may still depend on live remote fetching at runtime if you keep using the live source there.
- Core landing/category pages are protected from build-time scraping failures.
