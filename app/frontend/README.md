# Frontend (Vite + React)

This package contains the SPA for the fund comparison experience. It is built with Vite and React 19 and expects the FastAPI backend to provide OAuth/login flows and API data.

## Prerequisites

- Node.js 18+ (align with the version used by Firebase Hosting)
- pnpm (preferred) or another package manager that understands the lockfile
- Running backend at http://localhost:8000 for local development (can be overridden)

## Environment Variables

Create `app/frontend/.env` (ignored by git) with the values needed for your environment:

```bash
VITE_API_BASE=http://localhost:8000        # Backend origin used for API calls
VITE_PUBLIC_ANALYTICS_KEY=dev-analytics    # Optional analytics identifier
VITE_FIREBASE_PROJECT_ID=accademia-previdenza # Selects brand and palette
```

Any variable prefixed with `VITE_` becomes available via `import.meta.env`.
Do not place backend variables (`APP_*`) in frontend env files.

### Project-Bound Brand Selection

Brand copy, links, logos and colors are centralized in `config/brandTokens.ts` and exposed to the app through `BRAND_TOKENS` plus CSS variables in `index.css`. Set `VITE_FIREBASE_PROJECT_ID` at build time:

- `financial-suite` uses the legacy Financial Suite preset.
- `accademia-previdenza` uses the Accademia Previdenza preset.

Do not hardcode component colors, names, logos, links, charts, focus rings, or primary actions. Add new project brand presets in `BRAND_CONFIGS` and update the related CSS variable block instead.

## Install & Run

```bash
pnpm install
pnpm dev
```

The dev server runs on http://localhost:5173 and proxies API requests to `VITE_API_BASE`. To log in with Google in development, ensure the backend is reachable at that URL and that OAuth redirects include the dev origin.

## Production Build

```bash
pnpm build
```

Artifacts land in `app/frontend/dist/`. Use `pnpm preview` to verify the production bundle before hosting.

## PWA Baseline

The frontend ships with a real PWA setup:

- `public/manifest.webmanifest` for install metadata and icons.
- `public/sw.js` for service worker lifecycle, cache versioning and runtime caching.
- `public/offline.html` as explicit offline fallback.
- SW registration in `index.tsx` via `utils/pwa.ts`.
- Update UX banner in-app (`components/common/PwaUpdateBanner.tsx`) with manual confirm.

Offline strategy:

- App shell and key assets are pre-cached at SW install.
- Navigation requests use network-first with cached shell fallback.
- Static assets (script/style/font/image) use stale-while-revalidate.
- API `GET` caching is enabled only for safe allowlist endpoints (e.g. `/auth/config`, `/api/public/*`).

Release note:

- When updating cache rules or shell assets, bump `CACHE_VERSION` in `public/sw.js`.

## Deploying to Firebase Hosting

The repository root contains `firebase.json` configured to serve `dist`. Typical workflow:

```bash
pnpm build
firebase deploy --only hosting
```

Remember to set the appropriate `VITE_API_BASE`, `VITE_FIREBASE_PROJECT_ID` and other env vars before building. In CI, use the deploy environment file and let `scripts/deploy/deploy_frontend.sh` derive `VITE_FIREBASE_PROJECT_ID` from `FIREBASE_PROJECT_ID`.

## Developing Against Authentication

The SPA opens a popup to `/auth/google/login` when users click “Inizia a Confrontare”. If you need to bypass the flow locally, you can:

- Point `VITE_API_BASE` to a backend that already returns a session on `/auth/me`, or
- Temporarily adjust the `view` handling in `App.tsx` for rapid UI iterations.

Keep the real login path intact before committing to avoid regressions in production.
