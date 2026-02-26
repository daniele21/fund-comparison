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
