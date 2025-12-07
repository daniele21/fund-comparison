# Frontend (Vite + React)

This package contains the SPA for the fund comparison experience. It is built with Vite and React 19 and expects the FastAPI backend to provide OAuth/login flows and API data.

## Prerequisites

- Node.js 18+ (align with the version used by Firebase Hosting)
- pnpm (preferred) or another package manager that understands the lockfile
- Running backend at http://localhost:8000 for local development (can be overridden)

## Environment Variables

Create `app/frontend/.env.local` (ignored by git) with the values needed for your environment:

```bash
VITE_API_BASE=http://localhost:8000        # Backend origin used for API calls
VITE_PUBLIC_ANALYTICS_KEY=dev-analytics    # Optional analytics identifier
```

Any variable prefixed with `VITE_` becomes available via `import.meta.env`.

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

## Deploying to Firebase Hosting

The repository root contains `firebase.json` configured to serve `dist`. Typical workflow:

```bash
pnpm build
firebase deploy --only hosting
```

Remember to set the appropriate `VITE_API_BASE` (and other env vars) before building. In CI, you can export them as environment variables or write them to a temporary `.env.local`.

## Developing Against Authentication

The SPA opens a popup to `/auth/google/login` when users click “Inizia a Confrontare”. If you need to bypass the flow locally, you can:

- Point `VITE_API_BASE` to a backend that already returns a session on `/auth/me`, or
- Temporarily adjust the `view` handling in `App.tsx` for rapid UI iterations.

Keep the real login path intact before committing to avoid regressions in production.
