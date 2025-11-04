# User Management Template

This backend module gives every project a consistent way to store and serve user metadata while staying agnostic to which identity provider you plug in. It is built on FastAPI, Pydantic models, and Firestore, and ships with guardrails for auth, pagination, and timestamps so product teams can focus on onboarding flows instead of plumbing.

---

## Stack & Entry Points

- FastAPI application lives in `apps/api/main.py`. On startup it wires security middleware, logging, CORS, and mounts Prometheus metrics at `/metrics`.
- Feature-specific routers (including `users`) are registered under `apps/api/routes`. Each router depends on the service layer and shared auth dependencies.
- The service and repository layers reside in `apps/api/services` and `apps/api/repositories`. They isolate database operations behind typed interfaces and allow future swaps to other datastores.
- Config is provided by `api.settings` which hydrates values from `.env.*` files plus strongly-typed modules in `apps/api/config`.

Keeping these layers separate lets you reuse business logic in background jobs or other transports without rewriting HTTP handlers.

---

## Running Locally

1. Copy `apps/api/.env.development` to a new file that matches your environment (for example `.env.development` or point `APP_ENVFILE` to a custom path).
2. Install dependencies and start the dev server:
   ```bash
   cd apps/api
   make install
   make dev
   ```
   The server runs on `http://127.0.0.1:8000` with docs at `/docs`.
3. Firestore access uses the `firestore-access.json` checked into the repo if no other credentials are configured. To use the emulator, set `APP_USE_FIRESTORE_EMULATOR=true` and ensure `APP_FIRESTORE_EMULATOR_HOST` points at your emulator host.

`make test` exercises the service layer (including Firestore interactions via fixtures) so you can validate changes before shipping.

---

## Configuration Cheatsheet

The settings module chooses an env file in this order: `APP_ENVFILE`, `.env.<APP_ENV>`, `.env`. The most relevant keys for user management are:

- `APP_JWT_SECRET_KEY`, `APP_JWT_ALGORITHM`, `APP_JWT_ACCESS_TOKEN_EXPIRE_MINUTES` – controls token signing/verification.
- `APP_GOOGLE_CLIENT_ID`, `APP_GOOGLE_CLIENT_SECRET`, `APP_OAUTH_REDIRECT_URI_TEMPLATE` – drives OAuth login and callback handling. Additional identity providers can be added to `OAUTH_PROVIDERS` in `auth_service.py`.
- `APP_GOOGLE_PROJECT_ID`, `APP_FIRESTORE_DATABASE_ID`, `APP_FIRESTORE_EMULATOR_HOST` – configure Firestore project, database, and emulator usage.
- `APP_CORS_ORIGINS` – list of allowed browser origins for API access.

You can override collection names (for multi-tenant or namespaced deployments) in `config.<env>.json` under `database.firestore.collections.users`.

---

## Auth & Session Flow

- Requests hit dependencies in `apps/api/auth/deps.py`.
- `auth_required` first looks for a `Bearer` token, falling back to server-side session cookies via `auth_service.get_current_user()`.
- Claims are normalized into `AuthClaims`, which exposes helpers such as `belongs_to_org`.
- Role checks (`require_roles("admin")`) ensure that write operations stay restricted. Plan and feature flag requirements are available via `require_plan` and `require_feature`.
- OAuth login is handled by `apps/api/routes/google_auth.py` which calls `auth_service.build_login_url()` and `auth_service.exchange_code()`. Successful logins call `user_service.upsert_user(..., mark_login=True)` so the user document always has the latest `last_login_at` timestamp.

Keep the JWT issuer/audience aligned with the front-end to avoid signature errors when tokens are minted elsewhere.

---

## Firestore Data Model

`users/{userId}` documents store:

| Field           | Type               | Notes |
| --------------- | ------------------ | ----- |
| `email`         | string (lowercase) | Primary lookup key; always normalised. |
| `name`          | string             | Display name from IdP or profile edit. |
| `picture`       | string (URL)       | Avatar URL. |
| `roles`         | array[string]      | Authorisation roles (e.g. `admin`, `member`). |
| `plan`          | string             | Subscription plan identifier. |
| `credits`       | integer            | Usage or billing credits (defaults to `0`). |
| `metadata`      | map                | Arbitrary JSON-safe attributes. |
| `hd`            | string             | Google Workspace domain (optional). |
| `created_at`    | timestamp          | Set on first write. |
| `updated_at`    | timestamp          | Updated on every write. |
| `last_login_at` | timestamp          | Timestamp of the most recent login. |

The default collection name is `users`. Override it via `database.firestore.collections.users` when you need an alternate namespace.

---

## Repository & Service Layers

`apps/api/repositories/user_repository.py` provides a Firestore-backed implementation:

- `get(user_id)` / `get_by_email(email)` – lookups by primary key or email.
- `upsert(user_id, payload)` – create/update with ISO timestamp serialization and automatic email normalization.
- `list(limit, cursor)` – cursor-based pagination using `created_at` ordering.
- `delete(user_id)` – removes the document.

Firestore operations run inside `anyio.to_thread.run_sync` to keep the async request handlers responsive. The client is cached and configured through `providers/firestore.py`, which respects emulator settings and fills in credentials if `firestore-access.json` is present.

`apps/api/services/user_service.py` wraps the repository and exposes Pydantic models:

- `create_user()` rejects duplicates and fills in defaults.
- `upsert_user(mark_login=True)` is used by IdP callbacks to both provision and mark a login.
- `update_user()` applies partial updates for admin consoles.
- `list_users()` returns a `UserListResponse` including pagination cursor.
- `delete_user()` and `get_user_by_*` share centralized error translation via `handle_service_error()`.

Service functions are what you should call from new routers, background jobs, or webhooks so validation stays consistent.

---

## HTTP API

All endpoints live in `apps/api/routes/users.py` and sit behind JWT/session auth:

- `GET /users` – Admins receive a paginated list; non-admins are auto-scoped to their own profile. Accepts `limit` (1–100) and `cursor` query parameters.
- `GET /users/{user_id}` – Admin override or self-service access. Returns `404` when no record is found and `403` if the caller lacks permission.
- `POST /users` – Admin-only create. Expects `UserProfileCreate` payload; conflict returns `409`.
- `PATCH /users/{user_id}` – Admin-only partial update using `UserProfileUpdate`.
- `DELETE /users/{user_id}` – Admin-only delete; returns `204` on success and `404` if the user does not exist.

When integrating with the front-end, reuse `UserProfile` from `apps/api/schemas/user.py` so TypeScript types can be generated automatically.

### Example Payload

```http
POST /users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "auth0|123",
  "email": "founder@example.com",
  "name": "Founding User",
  "roles": ["admin"],
  "plan": "enterprise",
  "credits": 0,
  "metadata": { "team": "growth" }
}
```

Successful responses return the hydrated `UserProfile` structure with ISO timestamps.

---

## Observability & Error Handling

- Structured request logging and correlation IDs are set up via `RequestIDMiddleware` and `LoggingMiddleware`.
- CORS is controlled by `settings.cors_origins` so admin portals and public apps can share the API.
- All service-level errors are converted to FastAPI `HTTPException`s in one place (`handle_service_error`) which keeps route handlers lean and consistent.
- Metrics are available on `/metrics` for Prometheus scraping; enable or disable via `APP_METRICS_ENABLED`.

---

## Extending The Module

- Add extra user fields in the schema (`apps/api/schemas/user.py`) and pass them through repository + service layers. Update Firestore indexes in `infra/firebase/firestore.indexes.json` if you plan to query on the new data.
- Replace Firestore with another backend by implementing a repository that honours the same method signatures. Wire it up in `repositories/__init__.py` or behind a feature flag.
- Gate sensitive operations behind feature flags (`packages/feature-flags`) or plans using the existing dependency helpers.
- For custom provisioning flows (e.g. syncing from Shopify orders), call `user_service.upsert_user()` to keep timestamps and defaults correct.

By treating the repository/service boundary as the contract, the rest of the codebase (routers, jobs, CLI tools) can evolve without duplicating persistence or auth rules.
