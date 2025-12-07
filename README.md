# fund-comparison

Minimal repo for fund comparison utilities.

## Deploying the FastAPI backend (Cloud Run)

The repository contains a Dockerfile for the FastAPI backend under `app/backend/`. Build and push the container, then deploy to Cloud Run. Keep secrets in Secret Manager and reference them via `--set-secrets` when deploying.

1. Build and push the container image
   ```bash
   cd app/backend
   gcloud builds submit --tag gcr.io/financial-porforlio-analyser/fund-comparison-api
   ```

2. Deploy to Cloud Run
   ```bash
   gcloud run deploy fund-comparison-api \
     --image gcr.io/financial-porforlio-analyser/fund-comparison-api \
     --region europe-west1 \
     --allow-unauthenticated \
     --set-env-vars "APP_ENV=production,APP_LOG_LEVEL=INFO,APP_DEBUG=false,APP_RELOAD=false,APP_API_PORT=8000,APP_JWT_ALGORITHM=HS256,APP_JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60,APP_JWT_AUDIENCE=webapp-factory-dev,APP_JWT_ISSUER=webapp-factory-dev,APP_GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>,APP_OAUTH_REDIRECT_URI_TEMPLATE='https://your-frontend.example/auth/{provider}/callback',APP_GOOGLE_PROJECT_ID=financial-porforlio-analyser,APP_FIRESTORE_DATABASE_ID=fund-comparison-db,APP_USE_FIRESTORE_EMULATOR=false,VITE_PUBLIC_ANALYTICS_KEY=<PUBLIC_ANALYTICS_KEY>,APP_REDIS_URL=redis://redis-host:6379,APP_REDIS_DATABASE=0,APP_BASE_URL=https://api.example.com,APP_FRONTEND_BASE_URL=https://app.example.com,APP_LOG_FORMAT=json,APP_LOG_REQUESTS=true,APP_FEATURE_FLAGS_STORAGE=memory,APP_METRICS_ENABLED=true,APP_TRACING_ENABLED=true,APP_TELEGRAM_CHAT_ID=<TELEGRAM_CHAT_ID>,APP_FEEDBACK_REQUIRE_AUTH=true,APP_API_DOCS_ENABLED=false,APP_PROFILING_ENABLED=false,APP_STRIPE_PUBLIC_KEY=<STRIPE_PUBLISHABLE_KEY>,APP_CORS_ORIGINS=https://app.example.com,APP_COOKIE_NAME=webapp_factory_session,APP_COOKIE_SECURE=true,APP_COOKIE_HTTPONLY=true,APP_COOKIE_SAMESITE=lax,APP_CSRF_ENABLED=false,APP_RATE_LIMITING_ENABLED=false,APP_RATE_LIMIT_REQUESTS=100,APP_RATE_LIMIT_WINDOW_SECONDS=60,APP_MIN_PASSWORD_LENGTH=8,APP_PASSWORD_COMPLEXITY=low,APP_MAX_LOGIN_ATTEMPTS=5,APP_MFA_ENABLED=false,APP_MFA_REQUIRED_FOR_ADMIN=true,APP_DEFAULT_ROLES=user,APP_ADMIN_ROLES=admin,superadmin,APP_DEFAULT_PLAN=free" \
     --set-secrets "APP_JWT_SECRET_KEY=app-jwt-secret:latest,APP_GOOGLE_CLIENT_SECRET=google-oauth-secret:latest,APP_TELEGRAM_BOT_TOKEN=telegram-bot-secret:latest,APP_STRIPE_SECRET_KEY=stripe-secret:latest,APP_STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,APP_SHOPIFY_WEBHOOK_SECRET=shopify-webhook-secret:latest"
   ```

   Note: populate the rest of the environment variables from the example file `app/backend/.env.development`. For sensitive values (secrets, API keys, service account keys) store them in Secret Manager and pass them to Cloud Run with `--set-secrets` instead of `--set-env-vars`.

3. Grant Firestore access
   - Assign the Cloud Run service account the `Cloud Datastore User` role so it can talk to Firestore.
   - If you need to use a service-account key JSON, upload it to Secret Manager and mount it as `GOOGLE_APPLICATION_CREDENTIALS`.

4. Wire Hosting to the API (optional)
   Add a Hosting rewrite in `firebase.json` so `/api/**` requests proxy to Cloud Run:
   ```json
   {
     "source": "/api/**",
     "run": {
       "serviceId": "fund-comparison-api",
       "region": "europe-west1"
     }
   }
   ```

Environment variables (example names & recommended handling)

The file `app/backend/.env.development` contains a complete example of environment variables used by the backend. Below is a curated list grouped by purpose. Values marked as <SECRET> should come from Secret Manager.

- Environment
  - APP_ENV (e.g. production)

- API & runtime
  - APP_DEBUG (true|false)
  - APP_RELOAD (true|false)
  - APP_API_PORT (e.g. 8000)

- JWT Authentication (secrets)
  - APP_JWT_SECRET_KEY=<SECRET>
  - APP_JWT_ALGORITHM (e.g. HS256)
  - APP_JWT_ACCESS_TOKEN_EXPIRE_MINUTES (integer)
  - APP_JWT_AUDIENCE
  - APP_JWT_ISSUER

- OAuth Configuration (client secrets should be stored in Secret Manager)
  - APP_GOOGLE_CLIENT_ID
  - APP_GOOGLE_CLIENT_SECRET=<SECRET>
  - APP_OAUTH_REDIRECT_URI_TEMPLATE
  - APP_AUTH_MODE (google|invite_code|none)
  - APP_AUTH_INVITE_CODES (comma-separated list when invite_code)
  - APP_AUTH_INVITE_PLAN (plan assigned to invite users, default full-access)
  - APP_AUTH_INVITE_REQUIRE_EMAIL (true|false)

- Firestore / Google Cloud
  - APP_GOOGLE_PROJECT_ID
  - APP_FIRESTORE_DATABASE_ID
  - APP_FIRESTORE_EMULATOR_HOST (dev only)
  - APP_USE_FIRESTORE_EMULATOR (true|false)
  - FIRESTORE_EMULATOR_HOST (optional override)
  - GOOGLE_APPLICATION_CREDENTIALS (if using a mounted service-account key; prefer Workload Identity or Secret Manager)

- Frontend / Analytics
  - VITE_PUBLIC_ANALYTICS_KEY

- Redis
  - APP_REDIS_URL
  - APP_REDIS_DATABASE

- URLs
  - APP_BASE_URL
  - APP_FRONTEND_BASE_URL

- Logging
  - APP_LOG_LEVEL (DEBUG|INFO|WARN|ERROR)
  - APP_LOG_FORMAT (json|text)
  - APP_LOG_REQUESTS (true|false)

- Feature flags / Observability
  - APP_FEATURE_FLAGS_STORAGE (memory|redis|file)
  - APP_METRICS_ENABLED (true|false)
  - APP_TRACING_ENABLED (true|false)

- Notifications / Feedback (tokens are secrets)
  - APP_TELEGRAM_BOT_TOKEN=<SECRET>
  - APP_TELEGRAM_CHAT_ID
  - APP_FEEDBACK_REQUIRE_AUTH (true|false)

- Development / Tools
  - APP_API_DOCS_ENABLED (true|false)
  - APP_PROFILING_ENABLED (true|false)

- Billing / Stripe (secrets)
  - APP_STRIPE_PUBLIC_KEY
  - APP_STRIPE_SECRET_KEY=<SECRET>
  - APP_STRIPE_WEBHOOK_SECRET=<SECRET>

- Shopify
  - APP_SHOPIFY_WEBHOOK_SECRET=<SECRET>

- CORS / Cookies / CSRF / Rate-limiting / Auth policy
  - APP_CORS_ORIGINS (comma-separated)
  - APP_COOKIE_NAME
  - APP_COOKIE_SECURE (true|false)
  - APP_COOKIE_HTTPONLY (true|false)
  - APP_COOKIE_SAMESITE (lax|strict|none)
  - APP_CSRF_ENABLED (true|false)
  - APP_RATE_LIMITING_ENABLED (true|false)
  - APP_RATE_LIMIT_REQUESTS (int)
  - APP_RATE_LIMIT_WINDOW_SECONDS (int)
  - APP_MIN_PASSWORD_LENGTH (int)
  - APP_PASSWORD_COMPLEXITY (low|medium|high)
  - APP_MAX_LOGIN_ATTEMPTS (int)
  - APP_MFA_ENABLED (true|false)
  - APP_MFA_REQUIRED_FOR_ADMIN (true|false)

- Roles & Plans
  - APP_DEFAULT_ROLES (comma-separated)
  - APP_ADMIN_ROLES (comma-separated)
  - APP_DEFAULT_PLAN

Example: set a secret from Secret Manager when deploying to Cloud Run

1. Upload a secret value (e.g. JWT key) to Secret Manager
   ```bash
   echo -n "your-jwt-secret" | gcloud secrets create app-jwt-secret --data-file=- --replication-policy="automatic"
   ```

2. Grant the Cloud Run runtime access to the secret (the service account running Cloud Run needs access)
   ```bash
   # replace <SERVICE_ACCOUNT_EMAIL> with the Cloud Run service account
   gcloud secrets add-iam-policy-binding app-jwt-secret \
     --member="serviceAccount:<SERVICE_ACCOUNT_EMAIL>" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. Deploy and mount the secret into Cloud Run as an environment variable
   ```bash
   gcloud run deploy fund-comparison-api \
     --image gcr.io/financial-porforlio-analyser/fund-comparison-api \
     --set-secrets APP_JWT_SECRET_KEY=app-jwt-secret:latest \
     --region europe-west1 --allow-unauthenticated
   ```

4. Repeat for other secrets (OAuth client secret, Stripe secret, Telegram token, etc.).

For local development, copy `app/backend/.env.development` to `app/backend/.env` and update values. Avoid checking `.env` into git.
