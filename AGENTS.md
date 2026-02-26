# AGENTS.md

## Purpose
Questo documento definisce come contributor e coding agent devono progettare, implementare e documentare cambiamenti in questo repository.

Obiettivi principali:
- Architettura modulare tra frontend e backend.
- Contratti dati chiari e validazione robusta.
- UX chiara, mobile-friendly e consistente.
- Design system atomico e brand kit unificato.
- PWA reale e verificabile (non solo meta tag).
- Sicurezza applicativa su auth, ruoli e pagamenti.
- Test e documentazione aggiornati nella stessa modifica.

## Stack Baseline
- Frontend: Vite 6, React 19, TypeScript
- Backend: FastAPI, Pydantic v2, PyJWT, Redis, Firestore
- Infra/Deploy: Firebase Hosting (frontend), Cloud Run (backend), Secret Manager
- Analytics/servizi: Stripe, Telegram, Google OAuth

## Project Structure Rules
- `app/frontend/`: UI, componenti, config e utilita client.
- `app/backend/`: API FastAPI, services, routes, auth, providers.
- `docs/`: runbook, guide operative, note di architettura.
- `scripts/`: utility di supporto e automazioni.
- `data/`: dataset statici e input locali.
- `infra/`: configurazioni infrastrutturali (Firebase).

Regole:
- Mantieni business logic nel backend o in utility dedicate, non in componenti UI monolitici.
- Evita duplicazioni: estrai componenti riusabili in `app/frontend/components` e logica comune in `app/frontend/utils` o `app/backend/services`.
- Mantieni chiaro il confine tra route HTTP (`routes`) e dominio applicativo (`services`).
- Evita file-duplicati o "copy" in produzione (`* copy.*`): usa sorgente unica.

## Atomic UI System
Gerarchia richiesta:
1. Atoms (`app/frontend/components/ui`): Button, Input, Badge, Modal primitives.
2. Molecules (`app/frontend/components/common` o feature folders): composizioni di atoms.
3. Organisms (`app/frontend/components/<feature>`): sezioni complete.
4. Pages/App composition (`App.tsx` e feature entry): sola orchestrazione.

Regole:
- Nessuna nuova UI complessa direttamente in `App.tsx`.
- Se un componente supera ~250 linee, valutare split obbligatorio.
- Preferire varianti/props tipizzate a classi duplicate.

## Brand Kit and Styling
Single source of truth:
- Definire e mantenere token centrali in un file dedicato (es: `app/frontend/config/brandTokens.ts`) e riferimenti CSS coerenti.
- Vietato introdurre colori hardcoded se esiste un token equivalente.
- Vietato configurare stile runtime via CDN (es. Tailwind CDN) per codice applicativo di produzione.

Regole tipografiche e visuali:
- Font, palette, spaziature, radius e shadow devono derivare da token.
- Chart colors e semantic colors devono usare mapping centralizzato condiviso.

## PWA Standards
Se il frontend e mobile-first, lo standard minimo PWA include:
- Manifest (`manifest.webmanifest`) referenziato in `index.html`.
- Service worker registrato e versionato.
- Strategia offline minima (shell o fallback route) documentata.
- Icone e `theme-color` coerenti con brand kit.

Se una modifica impatta UX mobile o caching:
- Documentare effetto su installabilità, aggiornamenti e comportamento offline.

## Non-Negotiables
1. Nessun `any` in TypeScript; tipizza esplicitamente.
2. Input esterni (request body, query, webhook, config) sempre validati.
3. Nessuna secret hardcoded nel codice o nei file versionati.
4. Ogni modifica a auth, billing, ruoli o notifiche richiede test mirati.
5. Ogni feature non banale richiede aggiornamento docs.
6. Evita refactor larghi non necessari: preferisci diff minimi e sicuri.
7. Nessun endpoint production con logica "mock" senza flag esplicito/documentazione.
8. Nessun riferimento documentale a path legacy non esistenti.

## UX, Responsiveness, Accessibility
Per ogni modifica UI:
- Verifica comportamento almeno su mobile e desktop.
- Gestisci stati `loading`, `empty`, `error`, `success` quando applicabile.
- Garantisci navigazione keyboard per controlli principali.
- Usa testo e label comprensibili, evitando azioni ambigue.

## API and Security Standards
- Mantieni policy auth/permessi centralizzate (`auth/`, `security/`, decorators/guards).
- Non bypassare controlli ruolo/piano nei service methods.
- Per webhook/eventi esterni, verifica firma e gestisci idempotenza.
- Logga errori in modo utile senza esporre dati sensibili.

## Testing Standards
Backend (obbligatorio quando toccato):
- `pytest` sulle route e sui service modificati.
- Copertura di path positivo, edge case e path di errore.

Frontend (quando toccato):
- Esegui `pnpm build` e `pnpm typecheck` (se disponibile).
- Esegui `pnpm lint` e test frontend (se disponibili); se mancanti, apri task tecnico.
- Verifica build con `pnpm build`.
- Se aggiungi logica complessa, aggiungi test o evidenza di QA manuale ripetibile.

Prima del merge (scope permitting):
- Backend: `cd app/backend && pytest`
- Frontend: `cd app/frontend && pnpm build`

## Quality Gates (Mandatory)
Per ogni PR/feature:
1. `lint`/typecheck/build verdi per lo scope toccato.
2. Contratti request/response aggiornati e tracciabili nei type/schema.
3. Nessun warning critico ignorato su bundle size/performance senza nota.
4. Check esplicito responsive: mobile + desktop.
5. Check esplicito accessibilita base: focus order, label, contrast.

## Documentation Standards
Per ogni modifica significativa aggiorna:
- `spec_dev.md` per specifica funzionale/tecnica.
- Documentazione in `docs/` per setup, runbook o flussi operativi.
- `README.md` se cambia setup, deploy o uso utente.
- Una feature note dedicata quando cambia UX/business logic/API contract.

Ogni documento deve includere:
- Scope e motivazione.
- Impatti su frontend/backend/config.
- Piano test e risultati.
- Rischi aperti e rollback note.

## Delivery Checklist (Definition of Done)
- [ ] Modifica coerente con struttura del progetto.
- [ ] Contratti dati e validazioni aggiornati.
- [ ] Sicurezza/auth preservate o migliorate.
- [ ] UX copre stati principali (se feature UI).
- [ ] Test eseguiti e risultati verificati.
- [ ] Documentazione aggiornata.

## Agent Execution Protocol
Quando un agent implementa una modifica deve:
1. Definire obiettivo, vincoli e scope.
2. Applicare cambi minimi verificabili.
3. Eseguire verifiche (test/build) coerenti con i file toccati.
4. Riportare evidenza comandi eseguiti e risultato.
5. Se rimangono rischi aperti, esplicitarli chiaramente.
