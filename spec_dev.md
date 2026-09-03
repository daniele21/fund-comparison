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

## Feature Note - Dataset comparti 2026 e progressive disclosure

## 1. Overview
- Feature name: Migrazione dataset comparti 2026
- Owner: Codex
- Date: 2026-06-10
- Status: `done`
- Related issue/PR: n/a

## 2. Problem Statement
- Current behavior: il frontend usava `app/frontend/data/funds.ts` generato da piu' CSV storici, mentre il backend `/funds` resta mock.
- Pain points: il nuovo CSV contiene molte informazioni aggiuntive non modellate, con rischio di sovraccaricare tabella e confronto; la versione aggiornata include anche rendimenti storici 10Y/20Y non ancora mappati.
- Impatto su utenti/business: maggiore qualita' informativa su costi, rendimenti di lungo periodo, garanzia, benchmark, portafoglio e sostenibilita'.

## 3. Goals and Non-Goals
### Goals
- Usare `data/database_comparti_2026-06-10.csv` come dataset canonico.
- Estendere il contratto `PensionFund` senza perdere compatibilita' con rating e comparatore esistenti.
- Mappare `Performance 10Y` e `Performance 20Y` verso `rendimenti.ultimi10Anni` e `rendimenti.ultimi20Anni`.
- Mappare i link alla nota informativa disponibili in `Link_fondi.xlsx` verso i fondi corrispondenti.
- Mostrare le nuove informazioni con progressive disclosure.
- Documentare validazione, test, rischi e rollback.

### Non-Goals
- Nessuna migrazione backend in questa iterazione.
- Nessuna normalizzazione numerica dei costi testuali operativi.
- Nessuna sostituzione del rating interno con il rating sorgente.

## 4. Scope
- Frontend scope (`app/frontend/...`): tipi fondo, dataset generato, lista fondi, modale dettaglio.
- Backend scope (`app/backend/...`): nessuno.
- Data/config scope (`data/`, `scripts/`): CSV canonico e generatore TypeScript.
- Mapping statico note informative: `app/frontend/data/fundInformativeNotes.ts`, chiave `tipo + N. Albo`.
- Out of scope: API fondi production, Firestore, auth, billing, ruoli.

## 5. User and UX Definition
- User persona principale: utente che confronta fondi pensione e deve capire rapidamente se un comparto e' adatto.
- User journey principale: lista fondi -> segnali sintetici -> dettaglio fondo -> lettura costi/benchmark/portafoglio -> apertura nota informativa quando disponibile.
- Entry points: `FundTable`, `FundDetailModal`.
- Stati UX richiesti:
  - Loading: invariato.
  - Empty: invariato.
  - Error: validazione dataset gestita in fase di generazione.
  - Success: chip sintetici in lista e sezioni dettagliate nella modale.

## 6. Technical Design
- API endpoints toccati/nuovi: nessuno.
- Request/response contracts: nessuno.
- Validation strategy: `scripts/generate_fp_to_ts.js` valida colonne, 489 righe, chiavi uniche e mapping COVIP.
- Service/domain logic changes: `PensionFund` esteso con costi dettagliati, rendimenti 10/20 anni, garanzia, benchmark, asset allocation, data quotazione, sostenibilita', `sourceRating` e `notaInformativa`.
- External integrations coinvolte: link esterni SharePoint alle note informative, solo come URL aperti dall'utente.
- Error handling strategy: generazione fallisce in modo esplicito se il CSV non rispetta il contratto.
- Backward compatibility considerations: `rating` resta calcolato internamente; `sourceRating` e' separato.

## 7. Security and Permissions
- Auth model coinvolto: nessun impatto.
- Role/plan checks richiesti: nessun impatto.
- Dati sensibili trattati: nessuno.
- Rischi sicurezza e mitigazioni: nessun secret o input utente introdotto; link esterni aperti con `target="_blank"` e `rel="noopener noreferrer"`.

## 8. Responsiveness and Accessibility
- Breakpoint verificati: build completata; QA visuale manuale browser non eseguita in questa iterazione.
- Keyboard/focus behavior: controlli esistenti mantenuti.
- Label/semantics requirements: chip informativi non sostituiscono i dettagli accessibili nella modale; il link alla nota informativa ha `aria-label` e title descrittivo.
- Note mobile-specific: card mobile mostra solo indicatori compatti e rimanda ai dettagli.

## 9. Performance Considerations
- Rendering strategy: dataset ancora statico nel bundle frontend.
- Query/API performance notes: n/a.
- Caching/debouncing/throttling notes: n/a.
- Observability/logging notes: n/a.
- Nota bundle: Vite segnala chunk oltre 500 kB; prossima iterazione consigliata su API/lazy loading dataset.

## 10. Testing Strategy
- Unit tests: n/a.
- Route/API tests: n/a.
- Integration tests: n/a.
- UI/manual QA scenarios: lista fondi e modale dettaglio da verificare su mobile/desktop.
- Edge cases: campi testuali vuoti, URL mancanti, nota informativa assente, rating sorgente mancante, categoria COVIP non mappata, performance 10Y/20Y non disponibili per tutti i comparti.
- Failure path cases: CSV con colonne mancanti, righe duplicate o numero righe inatteso.
- Commands run:
  - Data: `node scripts/generate_fp_to_ts.js`
  - Data QA: confronto `Link_fondi.xlsx` vs `app/frontend/data/fundInformativeNotes.ts` senza mismatch
  - Data QA: verifica copertura generata `382` valori `ultimi10Anni`, `141` valori `ultimi20Anni` e `49` comparti con `notaInformativa`
  - Frontend: `cd app/frontend && pnpm build`
  - Frontend typecheck: `cd app/frontend && pnpm exec tsc --noEmit` non verde per errori preesistenti su Framer Motion/Recharts e file locale non tracciato `app/frontend/data/funds copy.ts`
  - UI browser QA: non eseguita, dev server locale bloccato da sandbox e permesso elevato non concesso

## 11. Documentation Deliverables
- Files aggiornati in `docs/`: `docs/DATASET_COMPARTI_2026_MIGRATION.md`.
- `README.md` update richiesto: `no`.
- Runbook/operational notes: incluse nella nota di migrazione.

## 12. Rollout and Risk Management
- Rollout plan: deploy frontend dopo QA mobile/desktop.
- Deploy targets: `local | test | production`.
- Env/secrets changes: nessuno.
- Monitoring after deploy: caricamento lista, apertura dettaglio, dimensione bundle, errori runtime.
- Rollback plan: ripristinare precedente generatore/dataset, rimuovere `app/frontend/data/fundInformativeNotes.ts` e rimuovere campi UI aggiunti.

## 13. Acceptance Criteria
- [x] CSV canonico copiato in `data/`.
- [x] Generatore aggiornato e validante.
- [x] `PensionFund` esteso con i nuovi campi.
- [x] Mapping note informative integrato per i fondi disponibili.
- [x] Lista fondi arricchita con chip progressivi.
- [x] Dettaglio fondo arricchito con costi, portafoglio, sostenibilita' e nota informativa.
- [x] Documentazione aggiornata.
- [x] Build frontend completata.

---

## Feature Note - Firebase Multi-Project Deploy

## 1. Overview
- Feature name: Deploy Firebase selezionabile per Accademia Previdenza
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
- Current behavior: la UI usava branding non allineato ad Accademia Previdenza e mostrava costi/rendimenti senza rating sintetico.
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
- Entry points storici: `choose-fund`, modale dettaglio fondo. La precedente sezione `have-fund` e' stata assorbita in `choose-fund`.
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
- Entry points (route/component): `SimulatorPage`, sezione `choose-fund`.
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
  - Passi con spotlight su target in `simulator` e `choose-fund`.
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

---

## Feature Note - Palette Brand per Progetto Firebase (2026-04-28)

### Scope e motivazione
- Centralizzata la palette in `app/frontend/config/brandTokens.ts`.
- Mantenuti due preset configurabili:
  - `VITE_FIREBASE_PROJECT_ID=financial-suite` per preset legacy Financial Suite;
  - `VITE_FIREBASE_PROJECT_ID=accademia-previdenza` per preset Accademia Previdenza.
- La scelta del brand dipende dal progetto env build-time, non da colori, nomi, link o loghi hardcoded nei componenti.

### Impatti frontend/backend/config
- Frontend:
  - `index.css` espone le CSS variables di brand;
  - `tailwind.config.js` rimappa le utility cromatiche sui token;
  - grafici, tooltip, slider e feedback usano token/CSS variables.
- Config deploy:
  - `GCP_PROJECT_ID` controlla sia progetto Firebase sia brand/palette frontend; lo script lo propaga al build come `VITE_FIREBASE_PROJECT_ID`.
- Backend: nessun impatto.

### Piano test e risultati
- Eseguito: `cd app/frontend && pnpm build`.
- Risultato: build ok; resta il warning Vite preesistente su chunk > 500 kB.

### Rischi aperti e rollback
- Rischio: componenti con SVG/asset esterni possono mantenere colori propri se sono loghi o icone provider.
- Rollback: impostare `GCP_PROJECT_ID=financial-suite` nel file ambiente e redeploy frontend.

---

## Feature Note - Rimozione Export PDF Simulazione e Confronto Fondi (2026-07-01)

### Scope e motivazione
- Rimosse le barre "Esporta simulazione in PDF" e "Esporta confronto in PDF" da Simulatore e Confronta Fondi.
- Rimossi componenti report, utility narrative/modello dati e CSS print dedicato.
- La richiesta post-development esplicita e' non generare piu' report da queste sezioni.

### Impatti frontend/backend/config
- Frontend:
  - `SimulatorPage` mantiene selezione fondo, modalita' confronto e step di calcolo senza CTA export.
  - `VisualComparison` mostra solo selezione fondi, grafici e tabella comparativa.
  - cancellati `SimulationPdfReport`, `FundComparisonPdfReport`, `PdfReportLayout`, `simulationReport` e `pdfReportNarratives`.
  - rimossi i tipi `SimulationReport*` da `types.ts`.
  - rimosse le regole `.pdf-*`, `.simulation-print-report`, `.fund-comparison-print-report` e `@media print` dedicate da `index.css`.
- Backend/config: nessun endpoint, secret o configurazione modificata.

### Contratti/tipi aggiornati
- Rimossi contratti frontend specifici dei report PDF.
- Nessuna modifica a contratti API.

### Piano test e risultati
- Eseguito: `node scripts/verify-ranking-costs.mjs`: OK.
- Eseguito: `cd app/frontend && pnpm build`: OK; resta warning Vite preesistente su chunk > 500 kB.
- Eseguito: `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori TypeScript preesistenti in componenti animazione/recharts/import-meta/hook feedback e `data/funds copy.ts`.

### Rischi aperti e rollback
- Rischio: eventuali utenti abituati all'export non avranno piu' un'azione equivalente in app.
- Rollback: ripristinare i componenti report eliminati, i tipi `SimulationReport*`, le CTA in `SimulatorPage`/`VisualComparison` e le regole print in `index.css`, poi redeploy frontend.

---

## Feature Note - Feedback post-development Comparatore v2 (2026-07-01)

### Scope e motivazione
- Applicate le modifiche frontend implementabili senza fonti esterne: ranking commerciale, popover rating, rimozione PDF, badge contrast-safe, sidebar, parser costi e risorse.
- Popolati i sidecar CSV per fondi chiusi ai nuovi aderenti e accordi collettivi dalle fonti fornite, senza inventare valori non presenti nelle fonti.

### Impatti frontend/backend/config
- Frontend:
  - `PensionFund` include `chiusoNuoviAderenti` e `collectiveAgreementInfo`.
  - `scripts/generate_fp_to_ts.js` unisce i sidecar `data/fondi_chiusi_nuovi_aderenti.csv` e `data/fondi_accordi_collettivi.csv`.
  - `FundTable` mostra legenda e asterisco per fondi chiusi, quando il sidecar contiene dati.
  - `FundDetailModal` mostra il box "Adesione e accordi collettivi" accanto ai costi operativi quando disponibile.
  - `RankingPage` ha filtro categoria, righe cliccabili, identita' fondo coerente con Confronta e rating accanto alla metrica.
  - `fundRanking` ordina ISC/costi dal valore piu' alto al piu' basso e corregge il parsing di stringhe gratuite con anni.
  - `PlaybookContent` include metodologia rating e definizioni operative delle categorie di investimento.
  - `StatusBadge`, `FundRatingBadge`, `FundIdentity` e `InfoPopover` centralizzano UI riusabile.
- Backend/config: nessun impatto.
- PWA: nessun nuovo asset in precache; i chunk aggiornati seguono la strategia build/service worker esistente.

### Piano test e risultati
- `node scripts/generate_fp_to_ts.js`: OK, 489 righe generate.
- `node scripts/verify-ranking-costs.mjs`: OK.
- `data/fondi_accordi_collettivi.csv`: popolato da 19 PDF di schede costi collettive, 16 fondi e 72 comparti agganciati.
- `cd app/frontend && pnpm build`: OK; warning preesistente su chunk > 500 kB.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori preesistenti fuori scope, inclusi wrapper Framer Motion, tipi Recharts, `ImportMeta.env`, hook feedback e `app/frontend/data/funds copy.ts`.
- `cd app/frontend && pnpm lint`: KO, script `lint` non definito.
- Dev server locale: tentato, ma l'avvio con permessi esterni e' stato rifiutato; QA browser mobile/desktop non eseguita in questa sessione.

### Rischi aperti e rollback
- Dati fondi chiusi: il sidecar e' popolato da `Fondi Chiusi ai nuovi aderenti.xlsx`; 9 righe sorgente non sono applicate per mancato match con il dataset canonico.
- Accordi collettivi: il sidecar e' popolato dai PDF forniti; per Programma Open il dettaglio numerico delle fasce A/B/C resta da verificare sulla fonte perche' l'estrazione testo non restituisce una tabella completa.
- Definizioni MEFOP: il testo in app e' operativo e va sostituito/validato con fonte ufficiale business appena disponibile.
- Loghi emittenti: esclusi dallo scope dopo decisione prodotto v3; non ci sono asset o fallback emittente dedicati nel Ranking.
- Rollback: ripristinare `types.ts`, `fundRanking.ts`, generator e componenti ranking/tabella/modal ai commit precedenti e rigenerare `funds.ts`.

---

## Feature Note - Feedback post-development Comparatore v3 (2026-07-08)

### Scope e motivazione
- Implementate le decisioni v3 sul feedback post-development: niente loghi emittente, classificazioni costi separate, campi accordi collettivi separati e conferma del comportamento fondi chiusi.

### Impatti frontend/backend/config
- Frontend:
  - `RankingFilters` usa `capitalGuarantee: CapitalGuaranteeFilter` e `includeClosedFunds`; i fondi chiusi sono esclusi di default.
  - La barra Ranking usa select garanzia, toggle ESG, toggle fondi chiusi e select categoria senza label visuale ridondante.
  - `RANKING_METRICS` separa `cost-management-percent` e `cost-management-fixed`; il parser costi distingue importi euro e percentuali.
  - Il parser `erogazione` privilegia costi di pagamento/rivalutazione rendita rispetto ai costi RITA quando convivono nel campo.
  - `Confronta Fondi` aggiunge filtro accordi collettivi con chip attivo e reset paginazione.
  - `FundDetailModal` rimuove `Rating fonte`, nasconde la fonte accordi collettivi in UI e mostra `Commissione gestione collettiva` e `Provvigione incentivo` separati.
  - Popover/metodologia rating aggiornati su scala 0-10; i badge rating nel Ranking hanno fondo uniforme chiaro.
- Data/config:
  - `data/fondi_accordi_collettivi.csv`, `scripts/generate_fp_to_ts.js` e `app/frontend/data/funds.ts` includono `collectiveManagementFee` e `incentiveFee`.
- Backend/API/auth/PWA: nessun impatto.

### Piano test e risultati
- `node scripts/generate_fp_to_ts.js`: OK, 489 righe generate.
- `node scripts/verify-ranking-costs.mjs`: OK; copre costo fisso ZED e priorita' rendita su RITA.
- `cd app/frontend && pnpm build`: OK; warning Vite preesistente su chunk > 500 kB.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori TypeScript globali preesistenti in wrapper Framer Motion, tipi Recharts, `ImportMeta.env`, hook feedback e `app/frontend/data/funds copy.ts`.
- `cd app/frontend && pnpm lint`: KO, comando `lint` non configurato.
- QA DOM desktop/mobile via dev server e Chrome headless: OK su Ranking e Confronta Fondi; verificati 17 card ranking, filtro garanzia, toggle ESG/chiusi e filtro accordi collettivi desktop/mobile.

### Rischi aperti e rollback
- Rischio: i campi collettivi restano stringhe fonte; non sono normalizzati numericamente per filtri o ranking.
- Rischio: il filtro `Senza accordi collettivi` include comparti senza sidecar o con valore accordi non positivo.
- Rollback: ripristinare `RankingFilters`, `RANKING_METRICS`, generator sidecar, `FundDetailModal`, `FilterControls`/`ActiveFiltersChips`, rigenerare `funds.ts` e rimuovere le colonne aggiunte al sidecar.

---

## Feature Note - Riposizionamento Consulente e Fix Comparatore (2026-05-13)

### Scope e motivazione
- Convertito il posizionamento principale da strumento retail a workspace per consulenti finanziari previdenziali.
- Rimosso l'accesso autonomo alla sezione "Analizza Fondo"; le relative informazioni sono ora disponibili in coda alla sezione "Confronta Fondi".
- Corretto il rating: score finale a 1 decimale e stelle proporzionali al punteggio numerico su scala 0-10.
- Accorpata la ricerca fondi con il titolo "Cerca fondi" e rimosso il titolo ridondante "Fondi" sopra la tabella.

### Impatti frontend/backend/config
- Frontend:
  - aggiornati copy principali in home, playbook, dashboard, comparatore e simulatore;
  - rimossa la voce "Analizza Fondo" da menu desktop e bottom navigation mobile;
  - `/analyze` viene risolto verso `choose-fund` per evitare route morte;
  - aggiunto pannello "Analisi fondo cliente" dentro `Confronta Fondi`;
  - aggiornato rendering rating in tabella, card mobile, modale dettaglio e report PDF confronto.
- Backend/config: nessun impatto.

### Contratti/tipi aggiornati
- `DashboardSection` non include piu' `have-fund`.
- `formatRatingStarsText` e il rendering stelle usano `ratingScore`, non `classeRating`.
- Nessun contratto API modificato.

### Piano test e risultati
- Eseguito: `cd app/frontend && pnpm exec tsc --noEmit`.
- Risultato: KO per errori TypeScript preesistenti in Framer Motion/Recharts/ImportMeta, hook feedback e `data/funds copy.ts`; nessun errore specifico emerso sulle nuove route/copy/rating.
- Eseguito: `cd app/frontend && pnpm build`.
- Risultato: build ok; resta warning Vite preesistente su chunk > 500 kB.

### Rischi aperti e rollback
- Rischio: alcuni copy educativi secondari restano volutamente descrittivi e non tutti sono stati riscritti in profondita' consulenziale.
- Rischio: QA visuale consigliata su mobile per il nuovo pannello "Analisi fondo cliente" in coda al comparatore.
- Rollback: ripristinare la precedente sezione autonoma di analisi in routing/nav/rendering, ripristinare helper stelle per classe rating e riportare `docs/rating-fondi.md` alla precedente precisione del rating.

---

## Feature Note - Deprecazione Codice Invito Auth (2026-05-13)

### Scope e motivazione
- Consolidato il prodotto su autenticazione Google OAuth come unico flusso reale.
- Deprecato il login tramite codice invito per evitare token iniziali con piano `full-access` non coerenti con il profilo Firestore.

### Impatti frontend/backend/config
- Frontend:
  - rimossa la form "codice invito" dalla modale di login;
  - il client normalizza eventuale `mode=invite_code` legacy a Google.
- Backend/config:
  - `/auth/config` espone `invite.enabled=false`;
  - `/auth/invite/login` restituisce `410 Gone` e non emette token;
  - `APP_AUTH_MODE=invite_code` viene trattato come configurazione legacy e ricondotto a Google;
  - `json_loader` usa `free` come fallback legacy per `invitation_default_plan` e compila correttamente dopo la rimozione di un blocco duplicato/corrotto;
  - rimosse le variabili `APP_AUTH_INVITE_*` dai file ambiente JSON.

### Contratti/tipi aggiornati
- Contratto `/auth/config`: campo `invite` mantenuto solo per compatibilita', con `deprecated=true`.
- Nessuna modifica ai claim Google OAuth; nuovi utenti non admin restano `plan=free`, `status=active`, `roles=[free]`.

### Piano test e risultati
- Eseguito: `cd app/frontend && pnpm build`.
- Risultato: build ok; resta warning Vite preesistente su chunk > 500 kB.
- Eseguito: `cd app/frontend && pnpm exec tsc --noEmit`.
- Risultato: KO per errori TypeScript preesistenti in componenti animazione/recharts/import-meta/hook feedback e `data/funds copy.ts`; nessun errore emerso su `auth.tsx` o `LoginModal.tsx`.
- Eseguito: `cd app/backend && python -m py_compile routes/auth.py config/auth.py config/json_loader.py services/auth_service.py`.
- Risultato: ok.
- Non eseguito: `cd app/backend && pytest tests/auth -q`, perche' `pytest`/dipendenze backend non sono installate nell'ambiente corrente.

### Rischi aperti e rollback
- Rischio: eventuali ambienti con `APP_AUTH_MODE=invite_code` verranno serviti come Google OAuth e richiedono credenziali OAuth valide.
- Rollback: ripristinare endpoint `/auth/invite/login`, variabili `APP_AUTH_INVITE_*`, UI codice invito e default invite plan.

---

## Feature Note - Refinement ranking e filtro garanzia confronto (2026-06-24)

### Scope e motivazione

- Stato: `done`.
- Applicazione del feedback post-development sul layout delle classifiche e sul filtro garanzia nella tab `Confronta fondi`.

### Impatti frontend/backend/config

- Frontend: card `RankingCard` riusabile; classifiche a larghezza completa; lista interna alta cinque righe con scroll solo dopo `Mostra tutti`; filtro tipizzato `CapitalGuaranteeFilter` in ricerca fondi, controlli desktop/mobile e chip attivi.
- Backend/config/dataset: nessuna modifica. Il dataset espone gia' `PensionFund.garanzia: boolean | null`; `true` e `false` sono filtrabili, i valori mancanti restano nell'opzione generale.
- API/auth/billing: nessun impatto.

### UX, accessibilita' e PWA

- Il controllo di espansione conserva `aria-expanded`; il contenitore espanso e' raggiungibile da tastiera e descrive il comportamento di scroll.
- I controlli del filtro hanno label accessibili e sono presenti su desktop e mobile; reset, chip e reset della paginazione includono il nuovo stato.
- Non cambia la strategia offline o la cache PWA; non e' necessario aggiornare `CACHE_VERSION` perche' non cambiano shell o policy di caching.

### Piano test e rollback

- `cd app/frontend && pnpm build`: OK; warning preesistente sul chunk principale oltre 500 kB.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori preesistenti in animazioni, Recharts, `ImportMeta`, feedback e `data/funds copy.ts`; nessun errore nei file della feature.
- `cd app/frontend && pnpm lint`: script assente nel package; aprire task tecnico per introdurre il lint frontend.
- QA manuale desktop/mobile non eseguita: browser integrato non disponibile in questa sessione. Da completare prima del deploy production per verificare ranking, scroll interno, tastiera e combinazioni filtro.
- Rischi: la scrollbar dipende anche dalle preferenze del sistema operativo (puo' essere overlay); la regione resta comunque scrollabile con mouse, touch e tastiera.
- Rollback: ripristinare `RankingPage`, rimuovere `RankingCard` e il filtro `CapitalGuaranteeFilter`; nessun dato o contratto da migrare.
# Feature Note - Ranking, confronto dati e qualita attributi 2026

## Scope e motivazione

- Aggiunta la sezione Ranking con classifiche su rendimenti, ISC e costi comparabili; dal feedback v3 le metriche sono 17 per separare gestione annua percentuale e fissa.
- Inserita tabella di confronto per garanzia del capitale, ESG e costi operativi.
- Corrette le linee BCC Vita Equity senza garanzia del capitale e rimossi i badge ESG per dichiarazioni negative.
- Reso esplicito l'anno 2025 per il rendimento a un anno del dataset 2026.

## Impatti frontend/backend/config

- Frontend: nuova route `/ranking`, menu desktop/mobile, filtri ESG/garanzia combinabili, utility di normalizzazione attributi e costi, tabella responsive nel confronto e palette grafici a maggiore contrasto.
- Backend/config: nessun impatto.

## Piano test e risultati

- `node scripts/generate_fp_to_ts.js`: ok, 489 righe.
- `cd app/frontend && pnpm build`: ok; warning preesistente per chunk maggiore di 500 kB.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori preesistenti nei componenti animazione, Recharts, feedback e `data/funds copy.ts`; nessun errore introdotto dai file della feature.
- QA visuale desktop/mobile: non eseguibile nell'ambiente corrente per indisponibilita' del browser integrato.

## Rischi aperti e rollback

- I ranking costi escludono intenzionalmente testi non confrontabili; la normalizzazione completa richiede valori strutturati in sorgente.
- Rollback: rimuovere i componenti Ranking/confronto, ripristinare il dataset canonico e rigenerare `funds.ts`.

---

## Feature Note - Feedback post-development Comparatore v4 (2026-07-13)

### Scope e motivazione

- Stato: `done`.
- Applicato feedback v4 su dati costi, ranking, metodologia rating e layout desktop.
- Nota operativa completa: `docs/FEEDBACK_POST_DEVELOPMENT_COMPARATORE_V4.md`.

### Impatti frontend/backend/config

- Frontend: nuovo filtro tipo fondo nel Ranking (`Tutti i tipi`, `PIP`, `FPA`, `FPN`), navigazione interna con hash retry-safe verso metodologia rating, copy metodologia aggiornato, offset header/sidebar desktop riallineato e maggiore distanza logo-titolo.
- Dataset: invertite le voci Mediafond `COMPARTO AZIONARIO` tra `Gestione annua` e `Gestione finanziaria`; aggiunto override riproducibile nel generator; rigenerato `app/frontend/data/funds.ts`.
- Backend/config/API/auth/billing/PWA: nessun impatto.

### Piano test e risultati

- `node scripts/generate_fp_to_ts.js`: OK, 489 righe generate.
- `node scripts/verify-ranking-costs.mjs`: OK; copre parser erogazione Previd-System e filtro tipo Ranking.
- `cd app/frontend && pnpm build`: OK; warning preesistente sul chunk principale oltre 500 kB.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori preesistenti fuori scope in animazioni, Recharts, `ImportMeta`, feedback e `data/funds copy.ts`.
- `cd app/frontend && pnpm lint`: KO per script assente.
- QA visuale browser desktop/mobile: OK su Chrome headless/CDP locale con mock `authMode=none`; verificati `/ranking`, `/compare` e `/guide#rating-accademia-previdenza`.

### Rischi aperti e rollback

- Rischio: testo metodologia aggiornato secondo feedback, senza cambiare l'algoritmo rating esistente.
- Rollback: ripristinare i file frontend modificati, rimuovere l'override Mediafond dal generator, ripristinare la riga Mediafond nei CSV, rigenerare `funds.ts` e rimuovere la regressione filtro tipo dallo script ranking.
