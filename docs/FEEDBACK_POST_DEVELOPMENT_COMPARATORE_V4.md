# Feedback post development Comparatore v4

## Scope e motivazione

- Applicare il feedback post-development v4 su ranking, metodologia rating, dati costi e layout desktop.
- Rendere il ranking filtrabile per tipologia di fondo (`FPN`, `FPA`, `PIP`) senza spezzare la barra filtri su desktop ampio.
- Correggere la scheda Mediafond `COMPARTO AZIONARIO`, dove le voci `Gestione annua` e `Gestione finanziaria` erano invertite.
- Rendere il link `Vai alla metodologia` un collegamento diretto alla sezione rating, non solo alla pagina guida generica.

## Impatti frontend/backend/config

- Frontend:
  - `RankingFilters` include `fundType: FundType | 'all'`.
  - `RankingFiltersBar` espone il select `Tutti i tipi`, `PIP`, `FPA`, `FPN`.
  - `App` intercetta i link interni e preserva l'hash per lo scroll alla sezione `/guide#rating-accademia-previdenza`.
  - `PlaybookContent` usa il testo metodologia richiesto dal feedback.
  - `Header` e sidebar desktop usano offset coerente a 81 px per evitare sovrapposizioni con il bordo dell'header.
- Dataset:
  - `scripts/generate_fp_to_ts.js` include un override riproducibile per Mediafond `COMPARTO AZIONARIO`, perché il CSV canonico usato dal generator è un import locale ignorato.
  - Aggiornato il CSV tracciato `data/database_comparti_2026-06-10 (1).csv`.
  - Rigenerato `app/frontend/data/funds.ts` con `node scripts/generate_fp_to_ts.js`.
- Backend/config/API/auth/billing:
  - Nessun impatto.

## UX, responsive, accessibilita e PWA

- Desktop:
  - La sidebar parte sotto l'header desktop e il pulsante di collapse resta verticalmente centrato nel blocco `Menu`.
  - Il titolo `Comparatore Fondi Pensione` ha maggiore distanza dal logo Accademia Previdenza.
  - La barra filtri ranking resta compatta su viewport ampi con il nuovo filtro tipo.
- Mobile:
  - Il nuovo filtro tipo usa un select nativo raggiungibile da tastiera e touch.
  - Non cambia la bottom navigation o il comportamento di installazione.
- Accessibilita:
  - I select hanno `aria-label` dedicati.
  - Il link metodologia resta un normale anchor, quindi apribile anche con tastiera e fallback browser.
- PWA:
  - Nessuna modifica a service worker, manifest o policy offline.

## Piano test e risultati

- `node scripts/generate_fp_to_ts.js`: OK, generati 489 comparti.
- `node scripts/verify-ranking-costs.mjs`: OK; copre priorita rendita su RITA e filtro tipo ranking.
- `cd app/frontend && pnpm build`: OK; resta warning Vite preesistente su chunk principale oltre 500 kB.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori preesistenti fuori scope in componenti animazione Framer Motion, tipi Recharts, `ImportMeta`, hook feedback e `data/funds copy.ts`; nessun errore riportato sui file modificati.
- `cd app/frontend && pnpm lint`: KO per script assente nel package.
- QA dati manuale:
  - Mediafond `COMPARTO AZIONARIO`: `Gestione annua` ora mostra `0,12% del patrimonio...`; `Gestione finanziaria` ora mostra `10% dell'extra rendimento...`.
  - Previd-System `RIVALUTAZIONE AZIONARIA`: il campo erogazione resta completo e il parser ranking usa `1,25%` per la metrica percentuale.
- QA visuale browser locale:
  - OK su Chrome headless/CDP con mock locale `authMode=none`.
  - Desktop `/ranking`: filtri su riga unica a 1439 px, sidebar sotto header, menu centrato, nessun overflow orizzontale.
  - Link metodologia: `/guide#rating-accademia-previdenza` preservato e sezione corretta visibile anche con contenuto guida lazy-loaded.
  - Mobile 390 px: `/ranking` e `/compare` senza overflow orizzontale; nuovo filtro tipo presente; sidebar desktop non visibile.

## Rischi aperti e rollback

- Rischio: la richiesta testuale indica scala rating `1-10`, mentre il motore rating esistente mantiene la logica e le classi gia documentate. Questa modifica aggiorna il testo risorse senza rifattorizzare l'algoritmo.
- Rischio: il layout filtri puo andare a capo su viewport intermedi molto stretti; il comportamento mobile resta verticale.
- Rollback:
  - Ripristinare `fundRanking`, `RankingPage`, `RankingFiltersBar`, `App`, `Header` e `PlaybookContent`.
  - Rimuovere l'override Mediafond da `scripts/generate_fp_to_ts.js`.
  - Ripristinare la riga Mediafond nel CSV tracciato e rigenerare `app/frontend/data/funds.ts`.
  - Rimuovere la regressione aggiunta in `scripts/verify-ranking-costs.mjs`.
