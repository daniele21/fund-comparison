# Analisi Fattibilita - Free Trial Temporizzato

## 1. Obiettivo

Valutare fattibilita, tempi e approccio per introdurre un free trial temporizzato nella soluzione Accademia Previdenza.

La richiesta comprende:

- riconoscimento dell'account che accede alla soluzione;
- avvio di un cronometro fino a un massimo configurabile di ore, durante le quali l'applicazione e' gratuita;
- pop-up centrale a trial scaduto con link di pagamento fornito dal cliente;
- metodologia per abilitare l'utente pagante alla piena funzionalita dell'app.

## 2. Sintesi Esecutiva

La richiesta e' fattibile con impatto medio, perche' il repository ha gia' diversi blocchi utili:

- autenticazione Google OAuth;
- profilo utente persistito in Firestore;
- ruoli `free`, `subscriber`, `admin`;
- piano `free` / `full-access`;
- stato utente `active`, `pending`, `suspended`, `rejected`;
- pop-up/banner di upgrade gia' presenti nel frontend;
- flusso admin per approvare utenti;
- webhook pagamento Stripe/Shopify gia' impostati, anche se non ancora perfettamente allineati al piano `full-access`.

Il gap principale e' che oggi il free plan e' limitato per funzionalita/risultati, ma non ha una scadenza temporale. Il trial a ore deve essere server-side, salvato su Firestore, e non affidato a `localStorage`, session storage o durata del JWT.

Raccomandazione: implementare il trial come entitlement derivato dal profilo utente, senza creare un nuovo ruolo. Il ruolo resta `free` fino al pagamento; durante il trial il backend restituisce `trial.active=true` e il frontend concede piena UX. A scadenza, se l'utente non e' `full-access` + `active`, si mostra un modal bloccante con CTA pagamento.

## 3. Stato Attuale Rilevato

### Account recognition

Gia' coperto in produzione tramite:

- Google OAuth (`/auth/google/login`, `/auth/google/callback`, `/auth/me`);
- token JWT e cookie `session`;
- profilo persistito nella collection Firestore `users`.

Nota: `APP_AUTH_MODE=none` non puo' supportare un trial affidabile, perche' l'utente non e' realmente riconosciuto. Per il trial temporizzato serve login obbligatorio.

### Accesso free/full

Oggi l'accesso completo e' determinato da:

- frontend: `plan === "full-access" && status === "active"` oppure `isAdmin`;
- backend: guard come `require_active_subscription()` e `require_permission()`;
- default nuovi utenti: `plan="free"`, `status="active"`, `roles=["free"]`.

### Pagamento e attivazione

Esistono tre elementi utili:

- `SUBSCRIPTION_URL` hardcoded nel frontend;
- `POST /auth/subscription/request`, che sposta l'utente a `plan="full-access"`, `status="pending"`, `roles=["subscriber"]` e notifica admin;
- admin dashboard con approvazione, che porta l'utente a `plan="full-access"`, `status="active"`, `roles=["subscriber"]`.

Esistono anche webhook `/payments/webhook/{provider}` per Stripe/Shopify, ma il servizio billing oggi aggiorna soprattutto `plan`, `credits` e metadata. Per abilitazione automatica full-access serve completare il mapping verso `roles=["subscriber"]` e `status="active"` oppure una policy esplicita.

## 4. Disegno Funzionale Proposto

### Stati principali

| Stato utente | Condizione | Accesso |
| --- | --- | --- |
| Trial attivo | `plan=free`, `status=active`, `metadata.trial.expires_at > now` | piena funzionalita temporanea |
| Trial scaduto | `plan=free`, `status=active`, `metadata.trial.expires_at <= now` | blocco/limitazione + pop-up pagamento |
| Pagamento dichiarato | `plan=full-access`, `status=pending`, `roles=[subscriber]` | free/limitato fino ad approvazione, oppure messaggio "in verifica" |
| Utente abilitato | `plan=full-access`, `status=active`, `roles=[subscriber]` | piena funzionalita |
| Admin | `roles=[admin]` | piena funzionalita, escluso dal trial |

### Inizio cronometraggio

Il timer deve partire al primo accesso autenticato utile, non al primo caricamento anonimo della pagina.

Approccio consigliato:

1. al login o alla prima chiamata `/auth/me`, il backend verifica se l'utente ha `metadata.trial`;
2. se manca e l'utente non e' admin/subscriber, crea:

```json
{
  "metadata": {
    "trial": {
      "started_at": "2026-05-06T10:00:00Z",
      "expires_at": "2026-05-07T10:00:00Z",
      "duration_hours": 24,
      "source": "first_authenticated_access"
    }
  }
}
```

3. la durata viene da configurazione backend, ad esempio `APP_FREE_TRIAL_HOURS`;
4. il frontend riceve da `/auth/me` un payload derivato:

```json
{
  "trial": {
    "active": true,
    "started_at": "2026-05-06T10:00:00Z",
    "expires_at": "2026-05-07T10:00:00Z",
    "remaining_seconds": 86400
  }
}
```

Non conviene usare la durata del JWT come trial clock: il JWT gestisce la sessione, non il diritto di accesso commerciale.

### Pop-up centrale a scadenza

Il componente dovrebbe essere un modal centrale bloccante, riusando o estendendo `UpgradeDialog`.

Regole UX:

- mostrare il modal quando `trial.active=false` e l'utente non e' `full-access active`;
- CTA primaria: link pagamento fornito dal cliente;
- CTA secondaria: "Ho gia' pagato" solo se resta il flusso manuale con approvazione admin;
- messaggio separato per `status=pending`: pagamento/richiesta in verifica;
- accessibilita: `role="dialog"`, `aria-modal`, focus trap, chiusura controllata solo se si vuole permettere uso limitato.

Il link pagamento non dovrebbe restare hardcoded in `constants.ts`. Meglio:

- `VITE_SUBSCRIPTION_URL` per il frontend, oppure
- `APP_SUBSCRIPTION_URL` esposto da `/auth/config` / nuovo endpoint `/billing/config`.

## 5. Metodologie di Abilitazione Post-Pagamento

### Opzione A - MVP manuale con approvazione admin

Flusso:

1. utente scaduto vede il pop-up;
2. clicca il link pagamento esterno;
3. torna nell'app e clicca "Ho gia' pagato";
4. `POST /auth/subscription/request` imposta `pending`;
5. admin verifica pagamento e approva dal pannello;
6. utente diventa `full-access active`.

Pro:

- sfrutta codice gia' presente;
- non richiede integrazione stretta col provider di pagamento;
- basso rischio operativo se il link pagamento e' statico.

Contro:

- abilitazione non immediata;
- lavoro manuale per admin;
- rischio di richieste false, gestito solo da verifica manuale.

Stima: 3-5 giorni lavorativi per trial server-side + modal + test, assumendo che il flusso admin esistente resti invariato.

### Opzione B - Abilitazione automatica via webhook

Flusso:

1. l'app genera o costruisce un link pagamento con riferimento utente (`user_id`, `email`, `client_reference_id` o metadata);
2. provider invia webhook firmato a `/payments/webhook/{provider}`;
3. backend verifica firma e idempotenza;
4. backend aggiorna utente a `plan="full-access"`, `status="active"`, `roles=["subscriber"]`;
5. frontend aggiorna `/auth/me` e sblocca l'app.

Pro:

- UX migliore: accesso automatico dopo pagamento;
- meno lavoro admin;
- audit trail piu' chiaro.

Contro:

- dipende da come il cliente fornira' il link pagamento;
- se il link e' statico e non contiene l'identita utente, bisogna correlare via email o campo custom;
- richiede test end-to-end con ambiente sandbox del provider.

Stima: 6-10 giorni lavorativi, includendo configurazione provider, mapping piano, webhook, idempotenza, test sandbox e documentazione.

### Opzione C - Ibrida consigliata

Partire con MVP manuale ma progettare i campi dati e il modal in modo compatibile con webhook automatico.

In pratica:

- subito: trial a ore + modal + `subscription/request` + admin approval;
- dopo: usare il webhook per trasformare automaticamente `pending` o `free trial expired` in `full-access active`.

Questa opzione riduce il rischio di bloccare il go-live per dettagli del provider di pagamento.

## 6. Modifiche Tecniche Necessarie

### Backend

Moduli coinvolti:

- `app/backend/schemas/user.py`;
- `app/backend/services/user_service.py`;
- `app/backend/routes/auth.py`;
- `app/backend/auth/deps.py`;
- `app/backend/auth/guards.py`;
- `app/backend/services/billing_service.py` se si sceglie webhook automatico;
- `app/backend/routes/payments.py` per provider-specific mapping.

Interventi:

- aggiungere modello Pydantic per `TrialInfo`;
- inizializzare `metadata.trial` in modo atomico quando manca;
- esporre stato trial in `/auth/me`;
- introdurre helper centralizzato tipo `compute_access_state(user_profile)`;
- aggiornare guard backend affinche' il trial attivo conceda temporaneamente le feature premium, se il requisito e' "app totalmente gratuita";
- aggiungere configurazione `APP_FREE_TRIAL_HOURS`;
- opzionale: `APP_SUBSCRIPTION_URL` esposto a frontend.

### Frontend

Moduli coinvolti:

- `app/frontend/types.ts`;
- `app/frontend/auth.tsx`;
- `app/frontend/App.tsx`;
- `app/frontend/components/UpgradeDialog.tsx` o nuovo `TrialExpiredDialog`;
- `app/frontend/constants.ts`.

Interventi:

- estendere `AuthUser` con `trial`;
- calcolare `hasFullAccess = paidAccess || trial.active || admin`;
- mostrare countdown o stato trial, se richiesto;
- mostrare modal centrale a trial scaduto;
- sostituire `SUBSCRIPTION_URL` hardcoded con config runtime/build-time.

### Firestore

Campo consigliato nel documento `users/{user_id}`:

```json
{
  "metadata": {
    "trial": {
      "started_at": "...",
      "expires_at": "...",
      "duration_hours": 24,
      "source": "first_authenticated_access"
    },
    "billing": {
      "provider": "stripe|shopify",
      "last_event_id": "...",
      "synced_at": "..."
    }
  }
}
```

Non servono migrazioni distruttive: gli utenti esistenti senza `metadata.trial` possono riceverlo al primo accesso dopo il deploy, oppure essere esclusi/inizializzati con script se business lo richiede.

## 7. Stime

| Scope | Durata stimata | Note |
| --- | ---: | --- |
| Analisi provider pagamento e requisiti UX | 0.5-1 giorno | serve sapere se il link e' statico o personalizzabile |
| Trial server-side + `/auth/me` | 1.5-2.5 giorni | include schema, service, test backend |
| Guard/access state full durante trial | 1-2 giorni | dipende da quante route premium devono rispettare il trial |
| Modal centrale + config pagamento | 1-1.5 giorni | riuso componenti esistenti |
| Flusso manuale pending/admin | 0.5-1 giorno | in gran parte gia' presente |
| Webhook automatico completo | +3-5 giorni | solo se il provider consente correlazione affidabile |
| Documentazione e QA | 1 giorno | runbook, test plan, rollback |

Stima MVP manuale: 3-5 giorni lavorativi.

Stima soluzione automatica robusta: 6-10 giorni lavorativi.

## 8. Rischi e Decisioni Aperte

- Durata trial: va definito il valore di `x` ore e se cambia per ambiente test/prod.
- Ambito "totalmente gratuito": chiarire se durante il trial si sblocca davvero tutto, inclusi simulatore e download report.
- Dopo scadenza: chiarire se l'utente puo' ancora vedere una versione demo limitata o se l'app diventa bloccata.
- Link pagamento: capire se sara' statico o generabile con metadata utente. Questa scelta decide manuale vs automatico.
- Correlazione pagamento-utente: senza `user_id` o email obbligatoria nel checkout, l'automazione e' fragile.
- Utenti gia' esistenti: decidere se ricevono trial, sono considerati scaduti, o vengono esclusi.
- PWA/offline: la scadenza non deve essere aggirabile offline. Le feature premium devono dipendere da backend o da stato server aggiornato.
- Privacy/GDPR: `trial.started_at`, `expires_at`, provider e riferimenti pagamento sono dati account/billing; vanno documentati in retention e informativa se necessario.

## 9. Piano Test Minimo

Backend:

- nuovo utente free senza trial: `/auth/me` crea trial e restituisce `active=true`;
- utente con trial non scaduto: accesso premium consentito se richiesto dal business;
- utente con trial scaduto: accesso premium negato o limitato;
- admin e subscriber attivi: esclusi dal blocco trial;
- `POST /auth/subscription/request`: resta idempotente;
- webhook provider, se abilitato: firma valida, evento duplicato, utente mancante, mapping full-access.

Frontend:

- login nuovo utente: trial attivo visualizzato correttamente;
- scadenza simulata: modal centrale visibile su mobile e desktop;
- stato pending: messaggio "in verifica" e nessuna CTA ambigua;
- utente abilitato: modal non visibile e accesso completo;
- keyboard navigation e focus nel modal.

Comandi attesi:

```bash
cd app/backend && pytest
cd app/frontend && pnpm typecheck
cd app/frontend && pnpm build
```

## 10. Rollout e Rollback

Rollout consigliato:

1. deploy in ambiente test con `APP_FREE_TRIAL_HOURS` basso, ad esempio 1 ora;
2. test con nuovo account Google non admin;
3. test scadenza forzando `metadata.trial.expires_at` nel passato;
4. verifica pop-up e richiesta pagamento;
5. verifica approvazione admin;
6. aumento durata a valore business e deploy prod.

Rollback:

- disabilitare la feature con flag, ad esempio `APP_FREE_TRIAL_ENABLED=false`;
- mantenere compatibilita con utenti che hanno `metadata.trial`;
- ripristinare regola precedente: `full-access active` oppure free limitato;
- non cancellare dati trial, per conservare audit e possibilita di riattivazione.

## 11. Raccomandazione Finale

Procedere in due fasi.

Fase 1: implementare trial server-side, modal centrale e attivazione manuale tramite flusso `pending`/admin gia' esistente. Questo copre rapidamente la richiesta commerciale e mantiene basso il rischio.

Fase 2: se il cliente puo' fornire un link pagamento tracciabile o accesso alla configurazione Stripe/Shopify, completare l'abilitazione automatica via webhook, con mapping diretto a `full-access active`.
