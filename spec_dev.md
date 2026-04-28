# spec_dev.md

## Feature Specification Template
Usa questo template per feature, bugfix importanti, refactor o cambi architetturali.

## 1. Overview
- Feature name:
- Owner:
- Date:
- Status: `draft | in-progress | review | done`
- Related issue/PR:

## 2. Problem Statement
- Current behavior:
- Pain points:
- Impatto su utenti/business:

## 3. Goals and Non-Goals
### Goals
- 

### Non-Goals
- 

## 4. Scope
- Frontend scope (`app/frontend/...`):
- Backend scope (`app/backend/...`):
- Data/config scope (`data/`, `infra/`, env vars):
- Out of scope:

## 5. User and UX Definition
- User persona principale:
- User journey principale:
- Entry points (route/component):
- Stati UX richiesti:
  - Loading:
  - Empty:
  - Error:
  - Success:

## 6. Technical Design
- API endpoints toccati/nuovi:
- Request/response contracts:
- Validation strategy:
- Service/domain logic changes:
- External integrations coinvolte (Firestore, Stripe, Telegram, OAuth, Redis):
- Error handling strategy:
- Backward compatibility considerations:

## 7. Security and Permissions
- Auth model coinvolto:
- Role/plan checks richiesti:
- Dati sensibili trattati:
- Rischi sicurezza e mitigazioni:

## 8. Responsiveness and Accessibility (if UI touched)
- Breakpoint verificati:
- Keyboard/focus behavior:
- Label/semantics requirements:
- Note mobile-specific:

## 9. Performance Considerations
- Rendering strategy (client/server boundaries):
- Query/API performance notes:
- Caching/debouncing/throttling notes:
- Observability/logging notes:

## 10. Testing Strategy
- Unit tests:
- Route/API tests:
- Integration tests:
- UI/manual QA scenarios:
- Edge cases:
- Failure path cases:
- Commands to run:
  - Backend:
  - Frontend:

## 11. Documentation Deliverables
- Files da aggiornare in `docs/`:
- `README.md` update richiesto: `yes/no`
- Runbook/operational notes:

## 12. Rollout and Risk Management
- Rollout plan:
- Deploy targets: `local | test | production`
- Env/secrets changes:
- Monitoring after deploy:
- Rollback plan:

## 13. Acceptance Criteria (Definition of Done)
- [ ] Scope implementato senza regressioni note.
- [ ] Contratti input/output aggiornati e validati.
- [ ] Controlli auth/permessi verificati (se rilevante).
- [ ] UX states principali coperti (se rilevante).
- [ ] Test pertinenti aggiunti/aggiornati.
- [ ] Verifiche locali eseguite con evidenza.
- [ ] Documentazione aggiornata.

## 14. Implementation Log (Optional)
- Decision 1:
- Decision 2:
- Tradeoff note:

---

## Feature Note - Firebase Multi-Project Deploy

## 1. Overview
- Feature name: Deploy Firebase selezionabile tra Financial Suite e Accademia Previdenza
- Owner: Codex
- Date: 2026-04-28
- Status: `done`
- Related issue/PR: n/a

## 2. Problem Statement
- Current behavior: `.firebaserc` puntava solo a `financial-suite` e la documentazione conteneva project id legacy non allineati.
- Pain points: per dedicare branch diversi a progetti Firebase diversi sarebbe stato necessario modificare configurazioni per branch, aumentando il rischio di divergenza.
- Impatto su utenti/business: deploy piu' esposto a errori di progetto, target Hosting o backend API.

## 3. Goals and Non-Goals
### Goals
- Aggiungere alias Firebase per `financial-suite` e `accademia-previdenza`.
- Mantenere `firebase.json` unico con target logico `app`.
- Consentire override progetto nello script frontend per CI branch-based.
- Documentare setup, verifica, rischi e rollback.

### Non-Goals
- Nessun deploy eseguito.
- Nessuna modifica a Cloud Run, auth, billing, ruoli o Firestore rules.
- Nessuna introduzione di segreti o file env reali versionati.

## 4. Scope
- Frontend scope (`app/frontend/...`): nessuno.
- Backend scope (`app/backend/...`): nessuno.
- Data/config scope (`data/`, `infra/`, env vars): `.firebaserc`, deploy frontend script, documentazione Firebase.
- Out of scope: provisioning dei siti Firebase e creazione database Firestore.

## 5. Technical Design
- API endpoints toccati/nuovi: nessuno.
- Request/response contracts: nessuno.
- Validation strategy: lo script valida `--env` con caratteri sicuri e richiede `FIREBASE_PROJECT_ID` dopo eventuale override.
- Frontend env mapping: tutte le variabili `FRONTEND_VITE_*` vengono passate al build come `VITE_*`, inclusa eventuale configurazione Firebase web per progetto.
- External integrations coinvolte: Firebase Hosting e Firestore deploy CLI.
- Backward compatibility considerations: i comandi `scripts/deploy/deploy_frontend.sh --env test|prod` restano validi.

## 6. Security and Permissions
- Auth model coinvolto: nessun impatto.
- Role/plan checks richiesti: nessun impatto.
- Dati sensibili trattati: nessuno.
- Rischi sicurezza e mitigazioni: nessun secret aggiunto; project selection esplicita in script e docs.

## 7. Testing Strategy
- Unit tests: n/a.
- Route/API tests: n/a.
- Integration tests: n/a.
- UI/manual QA scenarios: n/a.
- Commands to run:
  - Config: `bash -n scripts/deploy/deploy_frontend.sh`
  - Docs/config inspection: `git diff --check`

## 8. Documentation Deliverables
- Files aggiornati in `docs/`: `docs/FIREBASE_MULTI_PROJECT_DEPLOY.md`, `docs/DEPLOY_TEST_PROD.md`.
- `README.md` update richiesto: `yes`.
- Runbook/operational notes: `infra/firebase/README.md`.

## 9. Rollout and Risk Management
- Rollout plan: verificare site id Hosting nei due progetti, poi usare branch CI con `--firebase-project`.
- Deploy targets: `financial-suite | accademia-previdenza`.
- Env/secrets changes: nessun secret; eventuali file env reali devono restare ignorati.
- Monitoring after deploy: URL Hosting, SPA refresh, OAuth redirect, API base, service worker.
- Rollback plan: rollback release Hosting o revert `.firebaserc`/script.

## 10. Acceptance Criteria
- [x] Alias Firebase configurati per entrambi i progetti.
- [x] Deploy frontend selezionabile da CLI/CI senza modificare file per branch.
- [x] Variabili frontend per-progetto supportate tramite mapping `FRONTEND_VITE_*`.
- [x] Documentazione aggiornata con setup, comandi, rischi e rollback.

---

## Feature Note - Branding Accademia Previdenza e Rating Comparti

## 1. Overview
- Feature name: Branding configurabile Accademia Previdenza + rating comparti
- Owner: Codex
- Date: 2026-04-28
- Status: `done`
- Related issue/PR: n/a

## 2. Problem Statement
- Current behavior: la UI usava branding Financial Suite/Comparatore e mostrava costi/rendimenti senza rating sintetico.
- Pain points: identita non allineata al materiale Accademia Previdenza e assenza di un indicatore netto sintetico vicino ai fondi.
- Impatto su utenti/business: confronto meno leggibile e brand meno riconoscibile.

## 3. Goals and Non-Goals
### Goals
- Centralizzare il brand kit in configurazione semplice da cambiare.
- Calcolare rating per ogni comparto FPN/FPA/PIP usando il documento `docs/calcolo-rating.md`.
- Mostrare rating accanto ai fondi, nelle card mobile e nel dettaglio.

### Non-Goals
- Nessuna migrazione backend: `/funds` resta mock e la UI usa dataset statico.
- Nessun redesign esteso del layout.
- Nessuna nuova sorgente dati per data nascita comparto o rendimenti 15/25 anni.

## 4. Scope
- Frontend scope (`app/frontend/...`): brand tokens, asset PWA, rating model, tabella, card mobile, modale dettaglio, ordinamento.
- Backend scope (`app/backend/...`): nessuno.
- Data/config scope (`data/`, `infra/`, env vars): rigenerazione `app/frontend/data/funds.ts` da CSV esistenti; nessuna env var.
- Out of scope: API funds production, auth, billing, ruoli.

## 5. User and UX Definition
- User persona principale: utente che confronta fondi pensione e vuole un indicatore sintetico leggibile.
- User journey principale: lista fondi -> ordinamento rating -> apertura dettaglio -> lettura breakdown.
- Entry points: `choose-fund`, `have-fund`, modale dettaglio fondo.
- Stati UX richiesti:
  - Loading: invariato.
  - Empty: invariato.
  - Error: rating non calcolabile mostra motivazione.
  - Success: classe rating, score e ISC usato visibili.

## 6. Technical Design
- API endpoints toccati/nuovi: nessuno.
- Request/response contracts: esteso tipo frontend `PensionFund.rating`.
- Validation strategy: calcolo puro in `utils/fundRating.ts` con `null` espliciti per dati mancanti.
- Service/domain logic changes: rating calcolato in generazione dataset e riusabile dai componenti.
- External integrations coinvolte: nessuna.
- Error handling strategy: comparti senza rendimento 3 anni o ISC mostrano `N/D` e motivo esclusione.
- Backward compatibility considerations: componenti che ricevono `PensionFund` richiedono dataset rigenerato.

## 7. Security and Permissions
- Auth model coinvolto: nessun impatto.
- Role/plan checks richiesti: nessun impatto.
- Dati sensibili trattati: nessuno.
- Rischi sicurezza e mitigazioni: nessun nuovo input utente o secret.

## 8. Responsiveness and Accessibility
- Breakpoint verificati: rating in colonna desktop e badge/metrica mobile.
- Keyboard/focus behavior: invariato; ordinamento rating usa header button esistente.
- Label/semantics requirements: badge rating con `aria-label` e title descrittivo.
- Note mobile-specific: card mantiene metriche compatte senza nascondere costo/rendimento.

## 9. Performance Considerations
- Rendering strategy: rating calcolato una volta nel dataset statico generato.
- Query/API performance notes: nessuna query nuova.
- Caching/debouncing/throttling notes: service worker versionato per nuovi asset brand.
- Observability/logging notes: n/a.

## 10. Testing Strategy
- Unit tests: non aggiunti per assenza di runner frontend configurato.
- Route/API tests: n/a.
- Integration tests: n/a.
- UI/manual QA scenarios: lista fondi desktop/mobile, ordinamento rating, modale dettaglio, PWA metadata.
- Edge cases: rendimento 3 anni mancante, ISC 10 anni assente con fallback 5 anni, score negativo.
- Failure path cases: rating non calcolabile con motivazione.
- Commands to run:
  - Frontend: `pnpm build`.

## 11. Documentation Deliverables
- Files aggiornati in `docs/`: `docs/rating-fondi.md`.
- `README.md` update richiesto: `yes`.
- Runbook/operational notes: incluso rollback in `docs/rating-fondi.md`.

## 12. Rollout and Risk Management
- Rollout plan: deploy frontend standard.
- Deploy targets: `local | test | production`.
- Env/secrets changes: nessuno.
- Monitoring after deploy: verifica asset brand, manifest, cache PWA, tabella rating.
- Rollback plan: revert brand assets/config e rigenerazione dataset senza rating.

## 13. Acceptance Criteria
- [x] Scope implementato senza regressioni note sul build Vite.
- [x] Contratti frontend aggiornati.
- [x] UX rating copre stati calcolabile/non calcolabile.
- [x] Documentazione aggiornata.
- [x] Verifica `pnpm build` eseguita.

---

## Feature Note - Tour Guidato Contestuale con Highlight Dinamico

## 1. Overview
- Feature name: Tour guidato contestuale con spotlight componente
- Owner: Codex
- Date: 2026-02-26
- Status: `done`
- Related issue/PR: n/a

## 2. Problem Statement
- Current behavior: il tour era un modal centrale statico non ancorato ai componenti.
- Pain points: nessuno spotlight reale, nessun auto-scroll contestuale, comprensione UX inferiore.
- Impatto su utenti/business: onboarding meno efficace e più abbandono nel capire i blocchi principali.

## 3. Goals and Non-Goals
### Goals
- Introdurre tour contestuale con highlight reale sui target.
- Mantenere API esterna del componente `GuidedTour` compatibile.
- Applicare il comportamento a tutti i tour esistenti.

### Non-Goals
- Nessuna modifica backend/API.
- Nessun redesign globale del layout.

## 4. Scope
- Frontend scope (`app/frontend/...`):
  - `components/common/GuidedTour.tsx` refactor su `react-joyride`.
  - `components/simulator/StepMontante.tsx` aggiunta target `data-tour=\"simulator-inputs\"`.
  - `package.json` e `pnpm-lock.yaml` aggiornati per dipendenza `react-joyride`.
- Backend scope (`app/backend/...`): nessuno.
- Data/config scope (`data/`, `infra/`, env vars): nessuno.
- Out of scope: business logic fondi, auth, billing, ruoli.

## 5. User and UX Definition
- User persona principale: utente nuovo che esplora simulator/comparison.
- User journey principale: banner primo accesso -> avvio tour -> navigazione step contestuali.
- Entry points (route/component): `SimulatorPage`, sezione `choose-fund`, sezione `have-fund`.
- Stati UX richiesti:
  - Loading: n/a.
  - Empty: se non ci sono target validi, fallback a `body`.
  - Error: target non trovato gestito senza blocco tour.
  - Success: step con spotlight e avanzamento progressivo.

## 6. Technical Design
- API endpoints toccati/nuovi: nessuno.
- Request/response contracts: nessuna modifica.
- Validation strategy: mapping step tipizzato `TourStep` -> `Joyride Step`.
- Service/domain logic changes: nessuno.
- External integrations coinvolte: `react-joyride` lato frontend.
- Error handling strategy: callback `TARGET_NOT_FOUND` con fallback/skip allo step successivo.
- Backward compatibility considerations: props pubbliche `GuidedTour` mantenute.

## 7. Security and Permissions
- Auth model coinvolto: nessun impatto.
- Role/plan checks richiesti: nessun impatto.
- Dati sensibili trattati: nessuno.
- Rischi sicurezza e mitigazioni: overlay bloccante, nessuna esposizione dati.

## 8. Responsiveness and Accessibility (if UI touched)
- Breakpoint verificati: impostazione `scrollOffset` e tooltip width compatibili mobile/desktop.
- Keyboard/focus behavior: gestione Joyride standard con ESC abilitato.
- Label/semantics requirements: labels localizzati (`Indietro`, `Avanti`, `Salta`, `Finito`).
- Note mobile-specific: spotlight e tooltip su target con auto-scroll.

## 9. Performance Considerations
- Rendering strategy: mapping steps memoizzato.
- Query/API performance notes: nessun impatto.
- Caching/debouncing/throttling notes: n/a.
- Observability/logging notes: n/a.

## 10. Testing Strategy
- Unit tests: non presenti nel repository per questo scope.
- Route/API tests: n/a.
- Integration tests: n/a.
- UI/manual QA scenarios:
  - Avvio da banner e da pulsante "Tour Guidato".
  - Passi con spotlight su target in `simulator`, `choose-fund`, `have-fund`.
  - Skip/close/completion con persistenza `localStorage`.
- Edge cases: target non trovato -> fallback a `body` o skip step.
- Failure path cases: close durante run non blocca sezione.
- Commands to run:
  - Frontend: `pnpm exec tsc --noEmit`, `pnpm build`.

## 11. Documentation Deliverables
- Files da aggiornare in `docs/`: nota dedicata aggiornamento tour contestuale.
- `README.md` update richiesto: `no`
- Runbook/operational notes: incluso comando reset chiavi localStorage tour.

## 12. Rollout and Risk Management
- Rollout plan: deploy frontend standard.
- Deploy targets: `local | production`.
- Env/secrets changes: nessuno.
- Monitoring after deploy: verifica manuale tour su tre sezioni principali.
- Rollback plan: revert di `GuidedTour.tsx`, `StepMontante.tsx`, dipendenza `react-joyride`.

## 13. Acceptance Criteria (Definition of Done)
- [x] Scope implementato senza regressioni note.
- [x] Contratti input/output aggiornati e validati.
- [x] UX states principali coperti (tour run/skip/complete).
- [x] Verifiche locali eseguite con evidenza.
- [x] Documentazione aggiornata.

---

## Feature Note - Prompt Pagamento + Demo vs Richiesta in Attesa

## 1. Overview
- Feature name: Banner accesso (demo vs richiesta attivazione)
- Owner: Codex
- Date: 2026-02-27
- Status: `done`
- Related issue/PR: n/a

## 2. Problem Statement
- Current behavior: i nuovi utenti risultavano spesso `pending` (ambiguità: pending=pagato?).
- Pain points: UX poco chiara e backlog admin rumoroso.
- Impatto su utenti/business: confusione sullo stato di accesso e sulle limitazioni della demo.

## 3. Goals and Non-Goals
### Goals
- `pending` significa solo: utente ha dichiarato di aver pagato / richiesta inviata (in attesa approvazione).
- UX: chiedere all’utente se ha pagato; se demo, dichiarare il limite principale.

### Non-Goals
- Implementare la verifica pagamento (Stripe) lato client.
- Cambiare le policy di accesso alle feature premium (rimangono basate su `status` e ruoli).

## 4. Scope
- Frontend scope (`app/frontend/...`):
  - Banner fisso in basso con stati `question | demo | pending`.
  - Persistenza scelta demo per device via LocalStorage.
- Backend scope (`app/backend/...`):
  - Nuovo endpoint `POST /auth/subscription/request`.
  - Default nuovi utenti: `plan=free`, `status=active`, `roles=[free]`.

## 5. UX Rules (Source of Truth)
- Demo: `plan=free` + `status=active`
  - Limite dichiarato: mostra solo i primi `FREE_PLAN_LIMIT` fondi nei risultati.
  - LocalStorage key: `app.demo_ack_v1 = "1"`.
- Richiesta inviata: `plan=full-access` + `status=pending`
  - UI: “Richiesta in attesa”.
- Abilitato: `plan=full-access` + `status=active`
  - Accesso completo.

## 6. API Contract
- `POST /auth/subscription/request`
  - Auth: session cookie o `Authorization: Bearer <token>`
  - Side effects:
    - `status=pending`, `plan=full-access`, `roles=[subscriber]`
    - `metadata.subscription_request = { requested_at, source="self_report_banner" }`
    - notifica admin (solo su transizione verso pending via endpoint)


## Feature Note - Deploy Multi-Environment (test/prod)

## 1. Overview
- Feature name: Runbook e script deploy unificati per test/prod
- Owner: Codex
- Date: 2026-02-26
- Status: `done`
- Related issue/PR: n/a

## 2. Problem Statement
- Current behavior: deploy backend/frontend gestito con comandi manuali sparsi e configurazioni non allineate.
- Pain points: difficile separare test/prod, alta probabilita di errore su env vars e secret mapping.
- Impatto su utenti/business: rischio deploy su ambiente sbagliato e regressioni runtime.

## 3. Goals and Non-Goals
### Goals
- Standardizzare deploy `test` e `prod` con script versionati.
- Separare variabili non sensibili da secrets.
- Rendere esplicito il flusso locale vs server.

### Non-Goals
- Nessun refactor di auth/business logic backend.
- Nessun cambio su schema API.

## 4. Scope
- Frontend scope (`app/frontend/...`): doc env frontend aggiornata (`README.md`).
- Backend scope (`app/backend/...`): nessuna modifica runtime applicativa.
- Data/config scope (`data/`, `infra/`, env vars):
  - aggiunti template in `infra/deploy/` per `test`/`prod`.
  - aggiunti script in `scripts/deploy/`.
- Out of scope: pipeline CI/CD completa.

## 6. Technical Design
- Script nuovi:
  - `scripts/deploy/deploy_backend.sh`
  - `scripts/deploy/deploy_frontend.sh`
  - `scripts/deploy/deploy_all.sh`
- Config ambiente:
  - `infra/deploy/environments/*.env.example`
  - `infra/deploy/secrets/*.secrets.example`
  - `infra/deploy/backend/*.json.example`
- Runbook operativo:
  - `docs/DEPLOY_TEST_PROD.md`

## 7. Security and Permissions
- Dati sensibili trattati: secret mapping verso Secret Manager.
- Mitigazioni:
  - nessun secret hardcoded nei file versionati.
  - `.gitignore` aggiornato per evitare commit di file env reali (`*.env`, `*.secrets`, `env_test.json`).

## 10. Testing Strategy
- Verifica sintassi script:
  - `bash -n scripts/deploy/deploy_backend.sh`
  - `bash -n scripts/deploy/deploy_frontend.sh`
  - `bash -n scripts/deploy/deploy_all.sh`
- QA manuale ripetibile:
  - deploy `test` end-to-end con `deploy_all.sh`.
  - deploy `prod` end-to-end con `deploy_all.sh`.

## 11. Documentation Deliverables
- Files aggiornati in `docs/`: `docs/DEPLOY_TEST_PROD.md`.
- `README.md` update richiesto: `yes`.
- Runbook/operational notes: inclusi per locale/server e rollback.

## 12. Rollout and Risk Management
- Rollout plan: adozione progressiva script nuovi mantenendo fallback ai comandi manuali.
- Deploy targets: `local | test | production`.
- Env/secrets changes:
  - introdotti template e mapping separati per ambiente.
- Monitoring after deploy:
  - check URL Cloud Run, login, chiamate API frontend.
- Rollback plan:
  - deploy immagine precedente Cloud Run.
  - rollback release Firebase Hosting.

## 13. Acceptance Criteria (Definition of Done)
- [x] Scope implementato senza regressioni note.
- [x] Contratti input/output aggiornati e validati.
- [x] Verifiche locali eseguite con evidenza.
- [x] Documentazione aggiornata.

---

## Feature Note - PWA Baseline Solida (Manifest + SW + Offline)

## 1. Overview
- Feature name: PWA baseline solida e strutturata
- Owner: Codex
- Date: 2026-02-27
- Status: `done`
- Related issue/PR: n/a

## 2. Problem Statement
- Current behavior: frontend non installabile come PWA reale, nessun service worker registrato, assenza fallback offline esplicito.
- Pain points: UX fragile su rete instabile e assenza di strategia update cache.
- Impatto su utenti/business: minore affidabilita mobile e impossibilita di uso app-like offline.

## 3. Goals and Non-Goals
### Goals
- Rendere l'app installabile con manifest valido.
- Introdurre service worker versionato e registrazione robusta.
- Definire una strategia offline minima verificabile.

### Non-Goals
- Nessuna modifica backend/API.
- Nessun redesign UI completo.

## 4. Scope
- Frontend scope (`app/frontend/...`):
  - `public/manifest.webmanifest`
  - `public/sw.js`
  - `public/offline.html`
  - `utils/pwa.ts`
  - `components/common/PwaUpdateBanner.tsx`
  - `index.tsx`
  - `index.html`
- Backend scope (`app/backend/...`): nessuno.
- Data/config scope (`data/`, `infra/`, env vars):
  - `firebase.json` (headers caching SW/manifest/offline).
- Out of scope: caching dati API dinamici cross-origin.

## 6. Technical Design
- API endpoints toccati/nuovi: nessuno.
- Request/response contracts: nessuna modifica.
- Validation strategy: n/a.
- Service/domain logic changes: n/a.
- External integrations coinvolte: Service Worker API, Web App Manifest.
- Error handling strategy:
  - fallback shell/offline page quando rete non disponibile;
  - update SW gestito con banner utente e apply esplicito (`SKIP_WAITING`) + reload su `controllerchange`.
- Backward compatibility considerations:
  - app resta funzionante anche senza supporto SW o in ambiente non sicuro.

## 8. Responsiveness and Accessibility (if UI touched)
- Breakpoint verificati: pagina `offline.html` responsive su mobile/desktop.
- Keyboard/focus behavior: bottone `Ricarica` attivabile via keyboard.
- Label/semantics requirements: testo chiaro su stato rete assente.
- Note mobile-specific: installabilita migliorata via manifest + icone.

## 9. Performance Considerations
- Caching strategy:
  - app shell precache;
  - static asset stale-while-revalidate;
  - navigation network-first con fallback;
  - API GET cacheata solo su allowlist sicura (`/auth/config`, `/api/public/*`).
- Observability/logging notes:
  - errore registrazione SW loggato su console.

## 10. Testing Strategy
- Unit tests: n/a per questo scope.
- Route/API tests: n/a.
- UI/manual QA scenarios:
  - verifica installabilita PWA;
  - verifica update SW su cambio versione cache;
  - verifica fallback offline.
- Commands to run:
  - Frontend: `pnpm exec tsc --noEmit`, `pnpm build`.
- Risultati esecuzione locale (2026-02-27):
  - `pnpm build`: ok.
  - `pnpm exec tsc --noEmit`: fallisce per errori TypeScript preesistenti in componenti `animations/*` e tipi `recharts`.
  - `pnpm lint`: script non configurato nel package frontend.

## 11. Documentation Deliverables
- Files da aggiornare in `docs/`: `docs/PWA_RUNBOOK.md`.
- `README.md` update richiesto: `yes`.
- Runbook/operational notes: inclusi, con istruzioni bump `CACHE_VERSION`.

## 12. Rollout and Risk Management
- Rollout plan: deploy frontend standard su Firebase Hosting.
- Deploy targets: `local | test | production`.
- Env/secrets changes: nessuno.
- Monitoring after deploy:
  - verifica install prompt e stato SW in browser devtools.
- Rollback plan:
  - restore versione precedente `sw.js`/manifest e redeploy hosting.

## 13. Acceptance Criteria (Definition of Done)
- [x] Scope implementato senza regressioni note.
- [x] PWA installabile con manifest referenziato.
- [x] Offline fallback documentato e testabile.
- [x] Verifiche locali eseguite con evidenza.
- [x] Documentazione aggiornata.

---

## Feature Note - Upgrade Simulatore + Confronto Fondi a Orizzonte Uniforme (2026-02-28)

### Scope e motivazione
- Correzione tour Step 2: soglia copy aggiornata a `€5.300`.
- Simulatore:
  - input importi con separatore migliaia e box più ampi;
  - avviso esplicito quando il rendimento proxy usa storico `< 10 anni`;
  - calcolo TFR automatico da RAL: `(RAL / 13.5) * (1 - 0.005)`;
  - separazione tra contributo volontario e TFR datore;
  - deducibilità fiscale applicata solo al contributo volontario;
  - nuovo grafico dedicato ai soli importi versati.
- Confronta Fondi:
  - CTA verso Simulatore;
  - vincolo selezione `2-3` fondi;
  - selettore orizzonte confronto `3/5/10 anni`;
  - selezione bloccata per fondi senza storico sull’orizzonte scelto.

### Impatti frontend/backend/config
- Frontend toccato:
  - `app/frontend/components/simulator/*` (step e grafici);
  - `app/frontend/components/guided/GuidedComparatorContext.tsx`;
  - `app/frontend/components/VisualComparison.tsx`;
  - `app/frontend/components/FundTable.tsx`;
  - `app/frontend/components/guided/ChooseFundFlow.tsx`;
  - `app/frontend/components/PerformanceChart.tsx`;
  - `app/frontend/config/tourSteps.tsx`;
  - `app/frontend/utils/simulatorCalc.ts`;
  - `app/frontend/utils/fundPerformance.ts` (nuovo).
- Backend/config deploy: nessun impatto.

### Contratti/tipi aggiornati
- `ComparisonHorizon = 3 | 5 | 10` nel dominio frontend.
- `RendimentoProxyInfo` esteso con `years: 1 | 3 | 5 | 10 | 20`.
- `MontanteSeriesPoint` esteso con `versatoCumulato` (opzionale).

### Piano test e risultati
- Verifiche previste:
  - tour copy aggiornata a `5.300`;
  - input `12000 / 9500 / 100000` con visualizzazione migliaia corretta;
  - warning storico breve visibile solo con proxy `<10 anni`;
  - TFR automatico aggiornato al cambio RAL;
  - deducibilità calcolata solo sul volontario;
  - confronto limitato a 2-3 fondi con stesso orizzonte;
  - build frontend verde.
- Evidenza comandi: vedi output sezione finale attività agente.

### Rischi aperti e rollback
- Rischio principale: regressioni UX su componenti tabella/confronto in mobile.
- Rollback:
  1. ripristino file toccati in `components/simulator`, `guided`, `PerformanceChart`;
  2. ripristino costanti/utility (`simulatorCalc.ts`, `fundPerformance.ts`);
  3. redeploy frontend.
