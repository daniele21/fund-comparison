# Comparatore Fondi Pensione

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=fff)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-hosting_%2B_auth_%2B_firestore-FFCA28?logo=firebase&logoColor=111)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-installabile-5A0FC8)](https://web.dev/explore/progressive-web-apps)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-backend-4285F4?logo=googlecloud&logoColor=fff)](https://cloud.google.com/run)

Comparatore Fondi Pensione è una Progressive Web App per confrontare fondi pensione italiani, capire costi e rendimenti, simulare scenari previdenziali e gestire accessi free, subscriber e admin tramite backend FastAPI.

Il progetto combina un'esperienza frontend guidata con dati statici sui fondi, API protette, autenticazione Google o invite code, gestione ruoli, notifiche operative e deploy separato per ambienti `test` e `prod`.

## Missione

Aiutare una persona a scegliere con più consapevolezza un fondo pensione, trasformando dati difficili da leggere in confronti chiari, percorsi guidati e simulazioni comprensibili.

Il prodotto privilegia:

- confronto rapido tra fondi pensione con metriche comparabili;
- spiegazioni pratiche per utenti non specialisti;
- simulatore previdenziale per stimare scenari di montante e fiscalità;
- accesso freemium con upgrade controllato da ruoli e piano;
- backend modulare con auth, pagamenti, notifiche e admin separati dalla UI;
- PWA installabile con fallback offline documentato.

## Problema che risolve

Scegliere un fondo pensione richiede di confrontare costi, categorie, performance storiche, orizzonte temporale e regole fiscali. Le fonti ufficiali sono autorevoli ma non sempre facili da usare in una decisione quotidiana.

Questo repository costruisce un'esperienza più operativa: l'utente può esplorare i fondi, selezionarne alcuni, confrontarli visivamente, leggere guide contestuali e usare il simulatore per capire l'impatto di contribuzione, rendimento e deducibilità.

## Funzionalità principali

- Home con ingresso a simulatore, confronto fondi, guide e flussi guidati.
- Dataset fondi pensione caricato nel frontend da sorgenti statiche in `data/`.
- Tabella fondi con filtri, ordinamento, dettaglio fondo e selezione multipla.
- Confronto visuale tra fondi selezionati con grafici e insight.
- Simulatore previdenziale con step su montante, confronto e fiscalità.
- Guide, FAQ, glossario e contenuti educativi via API dedicate.
- Tour guidati contestuali per simulatore, confronto fondi e analisi fondo.
- Piano free con limite sui risultati visibili e piano full access per subscriber.
- Google OAuth, invite code e modalità no-auth per sviluppo controllato.
- Sessione tramite cookie HttpOnly/JWT e guardie ruolo/piano lato backend.
- Dashboard admin per utenti, approvazioni, ruoli, status e feedback.
- Notifiche Telegram per eventi admin e richieste utente.
- Integrazione Stripe predisposta per billing e webhook.
- PWA con manifest, service worker versionato, fallback offline e banner update.
- Deploy backend su Cloud Run e frontend su Firebase Hosting.

## Anteprima funzionale

Le schermate seguenti mostrano i flussi principali dell'app: ingresso mobile-first, simulazione previdenziale, confronto tra fondi, lista fondi filtrabile e lettura dei risultati. Il mobile racconta l'esperienza PWA quotidiana; il desktop evidenzia le viste più dense, dove simulazione, grafici e tabelle hanno bisogno di più spazio.

| Home mobile | Simulatore desktop |
|---|---|
| <img src="screenshots/mobile/Screenshot%202026-04-27%20alle%2011.48.34.png" alt="Home mobile del Comparatore Fondi Pensione con CTA per simulatore e confronto fondi" width="220"> | <img src="screenshots/desktop/Screenshot%202026-04-27%20alle%2011.51.25.png" alt="Vista desktop del simulatore con slider per capitale, contributo, RAL e anni alla pensione" width="430"> |
| Primo ingresso con navigazione bottom, tema scuro e azioni principali sempre raggiungibili. | Input guidati, privacy banner e parametri principali disposti su griglia desktop. |

| Risultati simulazione desktop | Confronto desktop | Lista fondi desktop |
|---|---|---|
| <img src="screenshots/desktop/Screenshot%202026-04-27%20alle%2011.51.31.png" alt="Vista desktop dei risultati del simulatore con capitale accumulato, guadagno dai rendimenti e grafico di crescita" width="300"> | <img src="screenshots/desktop/Screenshot%202026-04-27%20alle%2011.51.45.png" alt="Vista desktop del confronto tra due fondi con grafici performance e costi ISC" width="300"> | <img src="screenshots/desktop/Screenshot%202026-04-27%20alle%2011.51.54.png" alt="Vista desktop della tabella fondi con filtri, ricerca, selezione e metriche di costo e rendimento" width="300"> |
| Sintesi di versato, montante stimato, rendimento e curva di crescita anno per anno. | Confronto affiancato di performance e costi per capire velocemente quale fondo e' piu' efficiente. | Tabella ampia con ricerca, filtri, categorie, tipo fondo, costo annuo e rendimenti storici. |

## Privacy e sicurezza

Il perimetro applicativo tratta dati utente, sessioni, ruoli, feedback, notifiche e pagamenti. Le regole principali sono:

- i segreti non devono stare nel frontend e vanno gestiti con Secret Manager in deploy;
- il frontend usa solo variabili `VITE_*`;
- il backend usa variabili `APP_*`, cookie sicuri, CORS configurato e middleware di sicurezza;
- i controlli di ruolo e piano sono centralizzati in `auth/`, `security/` e nei service backend;
- le route admin richiedono permessi espliciti;
- webhook e integrazioni esterne devono verificare firma e idempotenza;
- le notifiche operative non devono esporre dati sensibili oltre il necessario.

Per i dettagli vedere [AUTH_AND_NOTIFICATIONS.md](docs/AUTH_AND_NOTIFICATIONS.md), [ROLE_MANAGEMENT.md](docs/ROLE_MANAGEMENT.md), [ADMIN_CONFIGURATION.md](docs/ADMIN_CONFIGURATION.md) e [PWA_RUNBOOK.md](docs/PWA_RUNBOOK.md).

## Stack tecnico

| Area | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS 3, CSS custom properties |
| UI e animazioni | Radix Dialog, Lucide React, Framer Motion, React Joyride |
| Data fetching | Axios, TanStack Query |
| Grafici | Recharts |
| Backend | FastAPI, Pydantic v2, Uvicorn |
| Auth | Google OAuth, Firebase Admin, PyJWT, cookie HttpOnly |
| Database/cache | Firestore, Redis opzionale |
| Billing/notifiche | Stripe, Telegram |
| Observability | Logging middleware, request id, Prometheus metrics |
| Deploy | Cloud Run, Firebase Hosting, Firebase Firestore rules |

## Architettura del repo

```text
app/
  frontend/                 SPA React, componenti, PWA e dati client
    components/             UI, flussi guidati, admin, simulatore e confronto
    components/common/      Molecole condivise e banner applicativi
    features/dashboard/     Routing e configurazione dashboard
    utils/                  PWA, calcoli simulatore, label e colori
    public/                 manifest, service worker e fallback offline

  backend/                  API FastAPI
    routes/                 Route HTTP per auth, fondi, simulator, admin, content
    services/               Logica applicativa e integrazioni operative
    auth/                   Modelli, dipendenze e guardie auth
    security/               Guardie e policy autorizzative
    providers/              Firestore, Firebase Auth, Redis, Stripe, Shopify
    middleware/             Security headers, request id e logging
    config/                 Settings, env, feature flags e policy

data/                       Dataset statici e input locali sui fondi
docs/                       Runbook, guide operative e note architetturali
infra/                      Firebase rules, indexes e configurazioni deploy
scripts/                    Automazioni per deploy, test e configurazione admin
spec_dev.md                 Template e note feature
```

Le regole di contribuzione e qualità sono in [AGENTS.md](AGENTS.md). Prima di modificare auth, billing, ruoli, notifiche, PWA o contratti API, leggere anche la documentazione in `docs/`.

## Come eseguire in locale

Prerequisiti:

- Node.js 18+;
- pnpm;
- Python 3.11+;
- ambiente virtuale Python consigliato;
- credenziali/configurazione Firebase solo se si usa Google OAuth o Firestore reale.

### Backend

1. Installa le dipendenze:

   ```bash
   cd app/backend
   pip install -r requirements.txt
   ```

2. Prepara la configurazione locale:

   ```bash
   cp .env.development .env
   ```

3. Aggiorna `.env` con valori reali o di sviluppo. Per sviluppo rapido puoi usare `APP_AUTH_MODE=invite_code`.

4. Avvia l'API dalla root del repository:

   ```bash
   cd /Users/moltisantid/Personal/fund-comparison/app
   uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
   ```

Endpoint utili:

- `GET http://127.0.0.1:8001/health`
- `GET http://127.0.0.1:8001/docs` se `APP_API_DOCS_ENABLED=true`
- `GET http://127.0.0.1:8001/metrics`

### Frontend

1. Installa le dipendenze:

   ```bash
   cd app/frontend
   pnpm install
   ```

2. Crea `app/frontend/.env.local`:

   ```bash
   VITE_API_BASE=http://127.0.0.1:8001
   VITE_PUBLIC_ANALYTICS_KEY=dev-analytics
   ```

3. Avvia Vite:

   ```bash
   pnpm dev
   ```

Il frontend viene servito da Vite su `http://localhost:5173`.

## Configurazione auth e accessi

Modalità supportate:

| Modalità | Variabile | Uso |
|---|---|---|
| Google OAuth | `APP_AUTH_MODE=google` | Flusso reale con Google, Firebase Auth e Firestore |
| Invite code | `APP_AUTH_MODE=invite_code` | Sviluppo o accesso controllato tramite codici |
| No auth | `APP_AUTH_MODE=none` | Solo iterazioni locali UI/API non sensibili |

Ruoli principali:

- `free`: accesso demo e primi risultati disponibili;
- `subscriber`: accesso completo dopo richiesta o approvazione;
- `admin`: accesso completo più dashboard e gestione utenti.

Per setup completo vedere [GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md), [AUTH_AND_NOTIFICATIONS.md](docs/AUTH_AND_NOTIFICATIONS.md) e [ROLE_MANAGEMENT.md](docs/ROLE_MANAGEMENT.md).

## PWA

Il frontend include una baseline PWA reale:

- `app/frontend/public/manifest.webmanifest`;
- `app/frontend/public/sw.js`;
- `app/frontend/public/offline.html`;
- registrazione service worker in `app/frontend/utils/pwa.ts`;
- banner update in `app/frontend/components/common/PwaUpdateBanner.tsx`;
- header Firebase Hosting no-cache per service worker, manifest e fallback offline.

Quando cambi cache, shell o asset precache, aggiorna `CACHE_VERSION` in `sw.js` e segui [PWA_RUNBOOK.md](docs/PWA_RUNBOOK.md).

## Script disponibili

### Frontend

| Comando | Scopo |
|---|---|
| `pnpm dev` | Avvia Vite in sviluppo |
| `pnpm build` | Genera la build di produzione |
| `pnpm preview` | Serve localmente la build |

### Backend

| Comando | Scopo |
|---|---|
| `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001` | Avvia API in locale dalla directory `app/` |
| `pytest` | Esegue i test Python disponibili |
| `python scripts/oauth_preflight.py --envfile .env` | Verifica configurazione OAuth dal backend |

### Deploy

| Comando | Scopo |
|---|---|
| `scripts/deploy/deploy_backend.sh --env test --build` | Build e deploy backend test su Cloud Run |
| `scripts/deploy/deploy_frontend.sh --env test` | Build e deploy frontend test su Firebase Hosting |
| `scripts/deploy/deploy_all.sh --env test --build-backend` | Deploy completo test |
| `scripts/deploy/deploy_all.sh --env prod --build-backend` | Deploy completo produzione |

## Deploy test/prod

Il workflow consigliato è documentato in [DEPLOY_TEST_PROD.md](docs/DEPLOY_TEST_PROD.md).

Setup una tantum:

```bash
cp infra/deploy/environments/test.env.example infra/deploy/environments/test.env
cp infra/deploy/environments/prod.env.example infra/deploy/environments/prod.env
cp infra/deploy/secrets/test.secrets.example infra/deploy/secrets/test.secrets
cp infra/deploy/secrets/prod.secrets.example infra/deploy/secrets/prod.secrets
cp infra/deploy/backend/backend_env.test.json.example app/backend/env_test.json
cp infra/deploy/backend/backend_env.prod.json.example app/backend/env_prod.json
```

Deploy test:

```bash
scripts/deploy/deploy_all.sh --env test --build-backend
```

Deploy produzione:

```bash
scripts/deploy/deploy_all.sh --env prod --build-backend
```

Regole operative:

- valori non sensibili nei file env di ambiente;
- segreti in Secret Manager e mapping `*.secrets`;
- `VITE_API_BASE` coerente con il backend target prima della build frontend;
- verifica post-deploy su `/health`, login, routing SPA e chiamate API.

## Qualità e verifiche

Per modifiche frontend:

```bash
cd app/frontend
pnpm build
```

Per modifiche backend:

```bash
cd app/backend
pytest
```

Il repository non espone al momento script frontend dedicati per `lint` o `typecheck` in `package.json`; se una modifica li richiede, aggiungere lo script o documentare la verifica manuale eseguita.

Per feature non banali aggiornare `spec_dev.md` e la documentazione pertinente in `docs/`, includendo scope, impatti, piano test, rischi e rollback.

## Documentazione utile

- [Quickstart Google OAuth + Telegram](QUICKSTART.md)
- [PWA runbook](docs/PWA_RUNBOOK.md)
- [Deploy test/prod](docs/DEPLOY_TEST_PROD.md)
- [Auth e notifiche](docs/AUTH_AND_NOTIFICATIONS.md)
- [Gestione ruoli](docs/ROLE_MANAGEMENT.md)
- [Configurazione admin](docs/ADMIN_CONFIGURATION.md)
- [Troubleshooting admin](docs/ADMIN_TROUBLESHOOTING.md)
- [Setup Google OAuth](docs/GOOGLE_OAUTH_SETUP.md)
- [Setup Telegram](docs/TELEGRAM_SETUP.md)
- [Piano simulatore previdenziale](docs/PIANO_SIMULATORE_PREVIDENZIALE.md)

## Stato del progetto

Comparatore Fondi Pensione è un'app PWA in evoluzione. Il perimetro attuale include confronto fondi, simulatore previdenziale, contenuti educativi, auth, ruoli, admin, feedback, notifiche e deploy multi-ambiente.

Sono aree da trattare con particolare attenzione: contratti API, configurazione segreti, flussi OAuth, controlli ruolo/piano, pagamenti, service worker e dataset dei fondi.
