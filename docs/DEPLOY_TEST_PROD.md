# Deploy Test/Prod Runbook

Questo runbook unifica il deploy di backend (Cloud Run) e frontend (Firebase Hosting) con due ambienti: `test` e `prod`.

## Obiettivo

- Stessa procedura per i due ambienti.
- Separazione chiara tra:
  - variabili non sensibili (`env vars file`)
  - segreti (`Secret Manager`, passati con `--set-secrets`)
- Build frontend con `VITE_API_BASE` coerente con il backend target.

## Struttura introdotta

- Script deploy:
  - `scripts/deploy/deploy_backend.sh`
  - `scripts/deploy/deploy_frontend.sh`
  - `scripts/deploy/deploy_all.sh`
- Config ambiente (non versionare file reali):
  - `infra/deploy/environments/test.env.example`
  - `infra/deploy/environments/prod.env.example`
- Mapping segreti:
  - `infra/deploy/secrets/test.secrets.example`
  - `infra/deploy/secrets/prod.secrets.example`
- Template env backend:
  - `infra/deploy/backend/backend_env.test.json.example`
  - `infra/deploy/backend/backend_env.prod.json.example`

## Setup una tantum

1. Crea file configurazione reali:
   - `cp infra/deploy/environments/test.env.example infra/deploy/environments/test.env`
   - `cp infra/deploy/environments/prod.env.example infra/deploy/environments/prod.env`
2. Crea mapping segreti reali:
   - `cp infra/deploy/secrets/test.secrets.example infra/deploy/secrets/test.secrets`
   - `cp infra/deploy/secrets/prod.secrets.example infra/deploy/secrets/prod.secrets`
3. Crea env backend reali:
   - `cp infra/deploy/backend/backend_env.test.json.example app/backend/env_test.json`
   - `cp infra/deploy/backend/backend_env.prod.json.example app/backend/env_prod.json`
4. Aggiorna valori reali (URL Cloud Run, project id, client id, chat id, secret names).

## Deploy backend (Cloud Run)

Test:
```bash
scripts/deploy/deploy_backend.sh --env test --build
```

Prod:
```bash
scripts/deploy/deploy_backend.sh --env prod --build
```

Note:
- `--build` usa `gcloud builds submit app/backend --tag ...`.
- Lo script legge `BACKEND_SECRETS_MAPPING_FILE` e genera `--set-secrets`.

## Deploy frontend (Firebase Hosting)

Test (consigliato su preview channel):
```bash
scripts/deploy/deploy_frontend.sh --env test
```

Prod (live):
```bash
scripts/deploy/deploy_frontend.sh --env prod
```

Note:
- Il build usa `FRONTEND_VITE_API_BASE` dal file ambiente.
- In `test`, usa `FIREBASE_DEPLOY_MODE=channel` + `FIREBASE_CHANNEL_ID=test`.
- In `prod`, usa `FIREBASE_DEPLOY_MODE=live`.

## Deploy completo backend + frontend

Test:
```bash
scripts/deploy/deploy_all.sh --env test --build-backend
```

Prod:
```bash
scripts/deploy/deploy_all.sh --env prod --build-backend
```

## Regole env per evitare confusione

- Frontend (`app/frontend`): usare solo variabili `VITE_*`.
- Backend (`app/backend` / Cloud Run): usare variabili `APP_*` e segreti da Secret Manager.
- Non mettere variabili backend dentro file env frontend.
- Non mettere segreti in `env_*.json`.

## Local vs server

Locale:
- Backend: `app/backend/.env.development` (o `APP_ENVFILE` dedicato).
- Frontend: `app/frontend/.env.local` con `VITE_API_BASE=http://localhost:8001`.

Server:
- Backend: `app/backend/env_test.json` o `app/backend/env_prod.json` + `--set-secrets`.
- Frontend: build-time `VITE_API_BASE` dalla config ambiente deploy.

## Verifiche post-deploy

- Backend:
  - health endpoint (`/health`)
  - OAuth callback URL coerente con dominio frontend
- Frontend:
  - login
  - chiamate API verso URL Cloud Run corretto
  - routing SPA su refresh diretto

## Rollback

- Cloud Run: redeploy immagine/tag precedente.
- Firebase Hosting:
  - `channel`: redeploy della release precedente sullo stesso canale
  - `live`: rollback release da console Hosting (o redeploy commit precedente)
