# Pension Fund Comparator

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=fff)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-hosting_%2B_auth_%2B_firestore-FFCA28?logo=firebase&logoColor=111)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)](https://web.dev/explore/progressive-web-apps)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-backend-4285F4?logo=googlecloud&logoColor=fff)](https://cloud.google.com/run)

Pension Fund Comparator is a Progressive Web App, branded for Accademia Previdenza, for comparing Italian pension funds, understanding costs, ratings and returns, simulating retirement scenarios, and managing free, subscriber, and admin access through a FastAPI backend.

The project combines a guided frontend experience with static pension fund data, protected APIs, Google OAuth or invite-code authentication, role management, operational notifications, and separate deployment flows for `test` and `prod` environments.

## Mission

Help people choose a pension fund with more confidence by turning hard-to-read data into clear comparisons, guided flows, and understandable simulations.

The product focuses on:

- fast pension fund comparison with comparable metrics;
- practical explanations for non-specialist users;
- a retirement simulator for estimating accumulated capital and tax scenarios;
- freemium access with role- and plan-controlled upgrades;
- a modular backend where auth, billing, notifications, and admin logic are separated from the UI;
- an installable PWA with a documented offline fallback.

## Problem It Solves

Choosing a pension fund requires comparing costs, categories, historical performance, time horizon, and tax rules. Official sources are authoritative, but they are not always easy to use for day-to-day decisions.

This repository builds a more operational experience: users can explore funds, select a subset, compare them visually, read contextual guides, and use the simulator to understand the impact of contributions, returns, and tax deductibility.

## Key Features

- Home screen with entry points for the simulator, fund comparison, guides, and guided flows.
- Pension fund dataset loaded in the frontend from static sources in `data/`.
- Fund table with filters, sorting, fund details, and multi-selection.
- Per-comparto rating based on historical returns net of selected ISC, shown in fund lists and details.
- Visual comparison of selected funds with charts and insights.
- Retirement simulator with steps for accumulated capital, comparison, and taxation.
- Guides, FAQ, glossary, and educational content through dedicated APIs.
- Contextual guided tours for the simulator, fund comparison, and fund analysis.
- Free plan with limited visible results and full-access plan for subscribers.
- Google OAuth, invite codes, and no-auth mode for controlled development.
- Session handling through HttpOnly cookies/JWT and backend role/plan guards.
- Admin dashboard for users, approvals, roles, status, and feedback.
- Telegram notifications for admin events and user requests.
- Stripe integration prepared for billing and webhooks.
- PWA with Accademia Previdenza manifest/icons, versioned service worker, offline fallback, and update banner.
- Backend deployment on Cloud Run and frontend deployment on Firebase Hosting.

## Product Preview

The screenshots below show the main app flows: mobile-first entry, retirement simulation, fund comparison, filterable fund list, and result analysis. The mobile view reflects the everyday PWA experience; the desktop view highlights denser screens where simulations, charts, and tables need more space.

| Mobile home | Desktop simulator |
|---|---|
| <img src="screenshots/mobile/Screenshot%202026-04-27%20alle%2011.48.34.png" alt="Mobile home screen of Pension Fund Comparator with simulator and fund comparison CTAs" width="220"> | <img src="screenshots/desktop/Screenshot%202026-04-27%20alle%2011.51.25.png" alt="Desktop simulator view with sliders for capital, contribution, gross income, and years to retirement" width="430"> |
| First entry with bottom navigation, dark theme, and primary actions always within reach. | Guided inputs, privacy banner, and main parameters arranged in a desktop grid. |

| Desktop simulation results | Desktop comparison | Desktop fund list |
|---|---|---|
| <img src="screenshots/desktop/Screenshot%202026-04-27%20alle%2011.51.31.png" alt="Desktop simulator results with accumulated capital, investment gain, and growth chart" width="300"> | <img src="screenshots/desktop/Screenshot%202026-04-27%20alle%2011.51.45.png" alt="Desktop comparison between two funds with performance and ISC cost charts" width="300"> | <img src="screenshots/desktop/Screenshot%202026-04-27%20alle%2011.51.54.png" alt="Desktop fund table with filters, search, selection, and cost and return metrics" width="300"> |
| Summary of contributions, estimated accumulated capital, returns, and year-by-year growth curve. | Side-by-side comparison of performance and costs to quickly identify the more efficient fund. | Wide table with search, filters, categories, fund type, annual cost, and historical returns. |

## Privacy and Security

The application perimeter handles user data, sessions, roles, feedback, notifications, and payments. The main rules are:

- secrets must not live in the frontend and must be managed through Secret Manager in deployed environments;
- the frontend only uses `VITE_*` variables;
- the backend uses `APP_*` variables, secure cookies, configured CORS, and security middleware;
- role and plan checks are centralized in `auth/`, `security/`, and backend services;
- admin routes require explicit permissions;
- webhooks and external integrations must verify signatures and handle idempotency;
- operational notifications must not expose more sensitive data than necessary.

For details, see [AUTH_AND_NOTIFICATIONS.md](docs/AUTH_AND_NOTIFICATIONS.md), [ROLE_MANAGEMENT.md](docs/ROLE_MANAGEMENT.md), [ADMIN_CONFIGURATION.md](docs/ADMIN_CONFIGURATION.md), and [PWA_RUNBOOK.md](docs/PWA_RUNBOOK.md).

## Technical Stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS 3, CSS custom properties |
| UI and animations | Radix Dialog, Lucide React, Framer Motion, React Joyride |
| Data fetching | Axios, TanStack Query |
| Charts | Recharts |
| Backend | FastAPI, Pydantic v2, Uvicorn |
| Auth | Google OAuth, Firebase Admin, PyJWT, HttpOnly cookies |
| Database/cache | Firestore, optional Redis |
| Billing/notifications | Stripe, Telegram |
| Observability | Logging middleware, request id, Prometheus metrics |
| Deploy | Cloud Run, Firebase Hosting, Firebase Firestore rules |

## Repository Architecture

```text
app/
  frontend/                 React SPA, components, PWA, and client data
    components/             UI, guided flows, admin, simulator, and comparison
    components/common/      Shared molecules and application banners
    features/dashboard/     Dashboard routing and configuration
    utils/                  PWA, simulator calculations, labels, and colors
    public/                 Manifest, service worker, and offline fallback

  backend/                  FastAPI API
    routes/                 HTTP routes for auth, funds, simulator, admin, content
    services/               Application logic and operational integrations
    auth/                   Auth models, dependencies, and guards
    security/               Authorization guards and policies
    providers/              Firestore, Firebase Auth, Redis, Stripe, Shopify
    middleware/             Security headers, request id, and logging
    config/                 Settings, env, feature flags, and policies

data/                       Static datasets and local pension fund inputs
docs/                       Runbooks, operational guides, and architecture notes
infra/                      Firebase rules, indexes, and deployment configuration
scripts/                    Automation for deploy, tests, and admin configuration
spec_dev.md                 Feature template and notes
```

Contribution and quality rules are in [AGENTS.md](AGENTS.md). Before changing auth, billing, roles, notifications, PWA behavior, or API contracts, also read the relevant documentation in `docs/`.

## Running Locally

Prerequisites:

- Node.js 18+;
- pnpm;
- Python 3.11+;
- a Python virtual environment is recommended;
- Firebase credentials/configuration only if you use Google OAuth or a real Firestore instance.

### Backend

1. Install dependencies:

   ```bash
   cd app/backend
   pip install -r requirements.txt
   ```

2. Prepare the local configuration:

   ```bash
   cp .env.development .env
   ```

3. Update `.env` with real or development values. For quick development, you can use `APP_AUTH_MODE=invite_code`.

4. Start the API from the repository root:

   ```bash
   cd /Users/moltisantid/Personal/fund-comparison/app
   uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
   ```

Useful endpoints:

- `GET http://127.0.0.1:8001/health`
- `GET http://127.0.0.1:8001/docs` if `APP_API_DOCS_ENABLED=true`
- `GET http://127.0.0.1:8001/metrics`

### Frontend

1. Install dependencies:

   ```bash
   cd app/frontend
   pnpm install
   ```

2. Create `app/frontend/.env.local`:

   ```bash
   VITE_API_BASE=http://127.0.0.1:8001
   VITE_PUBLIC_ANALYTICS_KEY=dev-analytics
   ```

3. Start Vite:

   ```bash
   pnpm dev
   ```

The frontend is served by Vite at `http://localhost:5173`.

## Auth and Access Configuration

Supported modes:

| Mode | Variable | Usage |
|---|---|---|
| Google OAuth | `APP_AUTH_MODE=google` | Real flow with Google, Firebase Auth, and Firestore |
| Invite code | `APP_AUTH_MODE=invite_code` | Development or controlled access through codes |
| No auth | `APP_AUTH_MODE=none` | Local-only UI/API iterations for non-sensitive work |

Main roles:

- `free`: demo access and first results available;
- `subscriber`: full access after request or approval;
- `admin`: full access plus dashboard and user management.

For the full setup, see [GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md), [AUTH_AND_NOTIFICATIONS.md](docs/AUTH_AND_NOTIFICATIONS.md), and [ROLE_MANAGEMENT.md](docs/ROLE_MANAGEMENT.md).

## PWA

The frontend includes a real PWA baseline:

- `app/frontend/public/manifest.webmanifest`;
- `app/frontend/public/sw.js`;
- `app/frontend/public/offline.html`;
- service worker registration in `app/frontend/utils/pwa.ts`;
- update banner in `app/frontend/components/common/PwaUpdateBanner.tsx`;
- Firebase Hosting no-cache headers for the service worker, manifest, and offline fallback.

When changing cache behavior, app shell, or precached assets, update `CACHE_VERSION` in `sw.js` and follow [PWA_RUNBOOK.md](docs/PWA_RUNBOOK.md).

## Available Scripts

### Frontend

| Command | Purpose |
|---|---|
| `pnpm dev` | Starts Vite in development |
| `pnpm build` | Generates the production build |
| `pnpm preview` | Serves the build locally |

### Backend

| Command | Purpose |
|---|---|
| `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001` | Starts the local API from the `app/` directory |
| `pytest` | Runs the available Python tests |
| `python scripts/oauth_preflight.py --envfile .env` | Verifies OAuth configuration from the backend |

### Deploy

| Command | Purpose |
|---|---|
| `scripts/deploy/deploy_backend.sh --env test --build` | Builds and deploys the test backend to Cloud Run |
| `scripts/deploy/deploy_frontend.sh --env test` | Builds and deploys the test frontend to Firebase Hosting |
| `scripts/deploy/deploy_all.sh --env test --build-backend` | Runs a full test deployment |
| `scripts/deploy/deploy_all.sh --env prod --build-backend` | Runs a full production deployment |

## Test/Prod Deployment

The recommended workflow is documented in [DEPLOY_TEST_PROD.md](docs/DEPLOY_TEST_PROD.md).

One-time setup:

```bash
cp infra/deploy/environments/test.env.example infra/deploy/environments/test.env
cp infra/deploy/environments/prod.env.example infra/deploy/environments/prod.env
cp infra/deploy/secrets/test.secrets.example infra/deploy/secrets/test.secrets
cp infra/deploy/secrets/prod.secrets.example infra/deploy/secrets/prod.secrets
cp infra/deploy/backend/backend_env.test.json.example app/backend/env_test.json
cp infra/deploy/backend/backend_env.prod.json.example app/backend/env_prod.json
```

Test deployment:

```bash
scripts/deploy/deploy_all.sh --env test --build-backend
```

Production deployment:

```bash
scripts/deploy/deploy_all.sh --env prod --build-backend
```

Operational rules:

- non-sensitive values live in environment files;
- secrets live in Secret Manager and `*.secrets` mappings;
- `VITE_API_BASE` must match the target backend before building the frontend;
- after deployment, verify `/health`, login, SPA routing, and API calls.

## Quality and Verification

For frontend changes:

```bash
cd app/frontend
pnpm build
```

For backend changes:

```bash
cd app/backend
pytest
```

The repository currently does not expose dedicated frontend `lint` or `typecheck` scripts in `package.json`; if a change requires them, add the script or document the manual verification performed.

For non-trivial features, update `spec_dev.md` and the relevant documentation in `docs/`, including scope, impacts, test plan, risks, and rollback.

## Useful Documentation

- [Google OAuth + Telegram quickstart](QUICKSTART.md)
- [PWA runbook](docs/PWA_RUNBOOK.md)
- [Test/prod deployment](docs/DEPLOY_TEST_PROD.md)
- [Auth and notifications](docs/AUTH_AND_NOTIFICATIONS.md)
- [Role management](docs/ROLE_MANAGEMENT.md)
- [Admin configuration](docs/ADMIN_CONFIGURATION.md)
- [Admin troubleshooting](docs/ADMIN_TROUBLESHOOTING.md)
- [Google OAuth setup](docs/GOOGLE_OAUTH_SETUP.md)
- [Telegram setup](docs/TELEGRAM_SETUP.md)
- [Retirement simulator plan](docs/PIANO_SIMULATORE_PREVIDENZIALE.md)

## Project Status

Pension Fund Comparator is an evolving PWA. The current scope includes fund comparison, retirement simulator, educational content, auth, roles, admin, feedback, notifications, and multi-environment deployment.

Areas that require special care: API contracts, secrets configuration, OAuth flows, role/plan checks, payments, service worker behavior, and the pension fund dataset.
