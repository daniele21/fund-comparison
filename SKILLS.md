# SKILLS.md

## Purpose
Questo file definisce le skill operative da usare come checklist quando si implementano feature in questo repository.

Regola generale:
- Applica solo le skill necessarie al task.
- Chiudi sempre con `Documentation`.

## Skill 1: Architecture & Boundaries
When to use:
- Nuova feature o refactor multi-file.

Required actions:
1. Separa responsabilita tra UI, route API e dominio.
2. Mantieni route snelle; sposta logica in `services`.
3. Riusa componenti e utility esistenti prima di crearne di nuovi.

DoD:
- [ ] Nessuna duplicazione evidente evitabile.
- [ ] Confini frontend/backend chiari.

## Skill 2: Data Contracts & Validation
When to use:
- Endpoint API, integrazioni esterne, trasformazioni dati.

Required actions:
1. Definisci tipi/schemi espliciti.
2. Valida input esterni e fallback di errore.
3. Mantieni payload response coerenti e stabili.

DoD:
- [ ] Validazione presente ai boundary.
- [ ] Tipi/contratti aggiornati nei punti toccati.

## Skill 3: UX & Frontend Quality
When to use:
- Qualsiasi modifica in `app/frontend`.

Required actions:
1. Gestisci stati principali (loading/empty/error/success) se applicabili.
2. Verifica usabilita su mobile e desktop.
3. Mantieni chiarezza visiva e copy coerente.

DoD:
- [ ] Nessun blocco funzionale su mobile.
- [ ] Stati critici coperti.

## Skill 4: Auth, Roles, Security
When to use:
- Modifiche su login, permessi, admin, billing, webhook.

Required actions:
1. Applica controlli auth/role nel layer corretto.
2. Non esporre segreti o dati sensibili nei log/response.
3. Verifica comportamento su utenti non autorizzati.

DoD:
- [ ] Nessun bypass autorizzativo introdotto.
- [ ] Error handling sicuro e consistente.

## Skill 5: Integrations & Deploy Safety
When to use:
- Modifiche che coinvolgono Firebase, Cloud Run, Stripe, Telegram, OAuth.

Required actions:
1. Conferma env vars richieste e default safe.
2. Verifica impatto su `firebase.json`, config backend e runbook.
3. Documenta differenze ambiente locale/test/prod.

DoD:
- [ ] Nessuna regressione di configurazione nota.
- [ ] Deploy notes aggiornate quando necessario.

## Skill 6: Testing & Regression Safety
When to use:
- Bugfix, nuova logica, refactor critico.

Required actions:
1. Aggiungi o aggiorna test backend per route/services toccati.
2. Esegui verifiche locali minime (`pytest`, `pnpm build`).
3. Copri almeno un caso limite e un caso di errore.

DoD:
- [ ] Evidenza test/build riportata.
- [ ] Rischi residui dichiarati se non coperti da test.

## Skill 7: Documentation
When to use:
- Sempre, per ogni cambiamento non banale.

Required actions:
1. Aggiorna `spec_dev.md` per feature/refactor.
2. Aggiorna docs operative in `docs/` se cambia il comportamento.
3. Aggiorna `README.md` se cambia setup o deploy.

DoD:
- [ ] Motivazione + implementazione documentate.
- [ ] Nessuna dipendenza da conoscenza implicita.

## Recommended Skill Sequence
1. Architecture & Boundaries
2. Data Contracts & Validation
3. Auth, Roles, Security (se rilevante)
4. UX & Frontend Quality (se rilevante)
5. Integrations & Deploy Safety (se rilevante)
6. Testing & Regression Safety
7. Documentation
