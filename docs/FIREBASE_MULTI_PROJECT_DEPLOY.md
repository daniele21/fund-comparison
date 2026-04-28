# Firebase Multi-Project Deploy

## Scope and Motivation

Questo runbook descrive come deployare lo stesso frontend Firebase Hosting su due progetti Firebase:

- `financial-suite`
- `accademia-previdenza`

L'obiettivo e' permettere un flusso branch-based senza duplicare `firebase.json` o mantenere versioni divergenti della configurazione infrastrutturale.

## Architecture

La configurazione sorgente resta unica:

- `.firebaserc` definisce alias progetto e mapping target Hosting.
- `firebase.json` continua a usare il target logico `hosting.target = "app"`.
- `scripts/deploy/deploy_frontend.sh` legge `FIREBASE_PROJECT_ID` dal file ambiente o lo riceve con `--firebase-project`.

Alias disponibili:

| Alias | Project ID |
|---|---|
| `financial` | `financial-suite` |
| `accademia` | `accademia-previdenza` |

Il target Hosting logico `app` punta al sito configurato nel progetto selezionato. Per `accademia-previdenza` il mapping assume che il sito Hosting si chiami `accademia-previdenza`.

## One-Time Setup

Verifica i siti Hosting effettivi:

```bash
firebase hosting:sites:list --project financial-suite
firebase hosting:sites:list --project accademia-previdenza
```

Se il sito di `accademia-previdenza` non si chiama `accademia-previdenza`, aggiorna il mapping:

```bash
firebase target:apply hosting app <SITE_ID> --project accademia-previdenza
```

Poi committa la `.firebaserc` aggiornata.

## Manual Deploy

Deploy su Financial Suite:

```bash
scripts/deploy/deploy_frontend.sh --env prod --firebase-project financial
```

Deploy su Accademia Previdenza:

```bash
scripts/deploy/deploy_frontend.sh --env prod --firebase-project accademia
```

Se i due progetti usano backend diversi, crea file ambiente separati e richiama lo script con `--config`:

```bash
scripts/deploy/deploy_frontend.sh \
  --env financial-suite \
  --config infra/deploy/environments/financial-suite.env

scripts/deploy/deploy_frontend.sh \
  --env accademia-previdenza \
  --config infra/deploy/environments/accademia-previdenza.env
```

Ogni file ambiente deve impostare almeno:

```bash
FIREBASE_PROJECT_ID=financial-suite
FIREBASE_DEPLOY_MODE=live
FIREBASE_HOSTING_TARGET=app
BACKEND_ENV_VARS_FILE=app/backend/env_financial_test.json
FRONTEND_VITE_API_BASE=https://<cloud-run-backend>
```

Non riusare lo stesso `app/backend/env_test.json` per progetti diversi. Ogni progetto Firebase/GCP deve avere un proprio file backend locale, per esempio:

```bash
app/backend/env_financial_test.json
app/backend/env_accademia_test.json
```

Questi file sono ignorati da git tramite `app/backend/env_*.json`.

Lo script passa automaticamente al build frontend tutte le variabili con prefisso `FRONTEND_VITE_`, rimuovendo `FRONTEND_`. Per esempio:

```bash
FRONTEND_VITE_FIREBASE_PROJECT_ID=accademia-previdenza
```

diventa:

```bash
VITE_FIREBASE_PROJECT_ID=accademia-previdenza
```

La configurazione web Firebase (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) non e' un secret, ma la API key deve essere limitata nelle impostazioni Google Cloud/Firebase quando possibile.

## Palette per Progetto

Il frontend lega la palette al progetto Firebase tramite `VITE_FIREBASE_PROJECT_ID`, risolta in `app/frontend/config/brandTokens.ts`:

| Firebase project | Brand style |
|---|---|
| `financial-suite` | `legacy` (palette verde attuale) |
| `accademia-previdenza` | `institutional` (palette blu `#071156`, `#0B196F`, `#122385`, `#5D8BF4`, `#D1D4EA`, testo `#333333`) |

Lo script di deploy passa tutte le variabili `FRONTEND_VITE_*` al build Vite. Ogni file ambiente deve quindi impostare `FRONTEND_VITE_FIREBASE_PROJECT_ID` coerente con `FIREBASE_PROJECT_ID`, altrimenti il bundle usa la palette default `legacy`.

## Branch-Based Deploy

Strategia consigliata:

| Branch | Firebase project | Command |
|---|---|---|
| `deploy/financial-suite` | `financial-suite` | `scripts/deploy/deploy_frontend.sh --env prod --firebase-project financial` |
| `deploy/accademia-previdenza` | `accademia-previdenza` | `scripts/deploy/deploy_frontend.sh --env prod --firebase-project accademia` |

In CI, evita di cambiare `.firebaserc` per branch. La pipeline deve solo scegliere il progetto Firebase e, se necessario, il file ambiente corretto.

## Firestore Rules and Indexes

Per deployare anche regole e indici Firestore:

```bash
firebase deploy --only firestore --project financial
firebase deploy --only firestore --project accademia
```

Nota: `firebase.json` usa il database ID `fund-comparison-db`. Entrambi i progetti Firebase devono avere lo stesso database ID oppure serve una configurazione Firebase separata per progetto.

## Verification

Dopo ogni deploy verifica:

- URL Hosting del progetto selezionato.
- Routing SPA su refresh diretto.
- Login/OAuth con dominio autorizzato corretto.
- Chiamate API verso il `VITE_API_BASE` atteso.
- Service worker e manifest caricati senza cache obsoleta.

## Risks and Rollback

Rischi principali:

- target Hosting `app` associato al sito sbagliato;
- `VITE_API_BASE` compilato verso il backend dell'altro progetto;
- OAuth redirect non autorizzato sul dominio Hosting scelto;
- database Firestore ID diverso tra i due progetti.

Rollback:

- Firebase Hosting: rollback della release dalla console Hosting o redeploy del commit precedente.
- Firestore rules/indexes: redeploy della versione precedente dei file in `infra/firebase/`.
- Config: revert della `.firebaserc` se il mapping target e' errato.
