# Migrazione dataset comparti 2026

## Scope e motivazione
La sorgente dati canonica dei comparti e' `data/database_comparti_2026-06-10.csv`.
Il dataset contiene 489 comparti FPN/FPA/PIP e sostituisce la precedente generazione basata su piu' CSV separati.

La migrazione serve a includere informazioni aggiuntive utili alla valutazione del comparto:
- rendimenti medi a 10 e 20 anni, quando disponibili;
- garanzia;
- costi operativi dettagliati;
- benchmark;
- composizione patrimonio;
- data inizio quotazione;
- sostenibilita';
- rating sorgente.
- link alla nota informativa del fondo, quando disponibile nella sorgente integrativa `Link_fondi.xlsx`.

## Impatti frontend
- `scripts/generate_fp_to_ts.js` legge il CSV canonico e genera `app/frontend/data/funds.ts`.
- `scripts/generate_fp_to_ts.js` legge anche due sidecar opzionali:
  - `data/fondi_chiusi_nuovi_aderenti.csv`;
  - `data/fondi_accordi_collettivi.csv`.
- `app/frontend/types.ts` espone i nuovi campi su `PensionFund`, inclusi `rendimenti.ultimi10Anni`, `rendimenti.ultimi20Anni` e `notaInformativa`.
- `PensionFund` include ora `chiusoNuoviAderenti` e `collectiveAgreementInfo`.
- `app/frontend/data/fundInformativeNotes.ts` contiene il mapping centralizzato `tipo + N. Albo -> nota informativa`.
- Il rating calcolato dall'app resta in `rating`.
- Il rating presente nel CSV e' conservato separatamente in `sourceRating`.
- La lista fondi mostra solo segnali compatti: garanzia, sostenibilita' e benchmark.
- La modale dettaglio usa progressive disclosure per mostrare costi operativi, portafoglio, sostenibilita' e link alla nota informativa quando presente.

## Impatti backend
Nessun endpoint backend e' stato modificato in questa iterazione.
`app/backend/routes/funds.py` resta mock: la migrazione dati e' ancora frontend-static.

La successiva iterazione consigliata e' creare un `fund_service` backend con schema Pydantic e endpoint reali.

## Validazione dati
Lo script di generazione fallisce se:
- il CSV non contiene tutte le colonne obbligatorie;
- il numero righe e' diverso da 489;
- la chiave `tipo + N. Albo + Linea/Comparto` non e' unica;
- una classificazione COVIP non ha mapping verso `FundCategory`;
- campi obbligatori come tipo, albo, fondo o comparto sono vuoti.

Il mapping note informative e' applicato a livello di fondo tramite chiave `tipo + N. Albo`, perche' il dataset principale e' a livello comparto mentre `Link_fondi.xlsx` fornisce link a livello fondo.

Sidecar fondi chiusi:
- file: `data/fondi_chiusi_nuovi_aderenti.csv`;
- chiave: `tipo + N. Albo + Linea/Comparto`;
- colonne obbligatorie: `tipo`, `N. Albo`, `Linea/Comparto`, `Chiuso ai nuovi aderenti`;
- colonna opzionale: `Fonte`;
- valori riconosciuti come true: `si`, `sì`, `yes`, `true`;
- default se assente: `false`.

Sidecar accordi collettivi:
- file: `data/fondi_accordi_collettivi.csv`;
- chiave: `tipo + N. Albo + Linea/Comparto`;
- colonne obbligatorie: `tipo`, `N. Albo`, `Linea/Comparto`, `Accordi collettivi`, `Etichetta accordi`, `Costo sottoscrizione individuale`, `Costo sottoscrizione collettiva`, `Commissione gestione collettiva`, `Provvigione incentivo`, `Note`, `Fonte`;
- i costi restano stringhe fonte per evitare normalizzazioni fragili di condizioni contrattuali;
- dal 2026-07-08 la UI mostra commissione di gestione collettiva e provvigione incentivo in campi separati, mentre la fonte resta conservata nel dato ma non visibile nella scheda fondo;
- default se assente o vuoto: `collectiveAgreementInfo = null`.

Al 2026-07-01 `data/fondi_chiusi_nuovi_aderenti.csv` e' stato popolato dal file sorgente locale `Fondi Chiusi ai nuovi aderenti.xlsx`:
- righe sorgente: 105;
- comparti agganciati al dataset canonico: 96;
- chiave di matching: `N. Albo + Linea/Comparto`, con recupero di `tipo` dal dataset canonico;
- comparti sorgente non agganciati per assenza o rinomina nel dataset canonico: `5039 PREVIATTIVA UNIPOL`, `5040 PREVIATTIVA UNIPOL`, `5044 PREVIATTIVA UNIPOL`, `5046 PREVIATTIVA UNIPOL`, `5066 PREVIATTIVA UNIPOL`, `5082 PREVIATTIVA UNIPOL`, `5096 PREVIATTIVA UNIPOL`, `5096 AZIONE PIU'`, `5038 ZURICH PENSION ESG AZIONARIO`.

Al 2026-07-01 `data/fondi_accordi_collettivi.csv` e' stato popolato dalle schede costi per adesioni collettive fornite in `/Users/moltisantid/Downloads/ADESIONI COLLETTIVE`:
- PDF sorgente: 19;
- fondi agganciati al dataset canonico: 16;
- comparti agganciati al dataset canonico: 72;
- chiave di matching: `N. Albo + Linea/Comparto`, con recupero di `tipo` dal dataset canonico;
- per TESEO e Programma Open sono state mantenute in un'unica riga le condizioni delle classi/fasce multiple disponibili;
- per Programma Open il dettaglio numerico resta segnalato come da verificare sulla fonte, perche' l'estrazione testo dei PDF non restituisce una tabella completa e affidabile.

Copertura rendimenti nel dataset canonico:
- `Performance 10Y`: 382 comparti valorizzati su 489;
- `Performance 20Y`: 141 comparti valorizzati su 489.

Copertura note informative:
- 13 fondi con link mappato;
- 49 comparti arricchiti in `PensionFund.notaInformativa`.

Mapping classificazioni COVIP:
- `Garantito` -> `GAR`
- `Bilanciato` -> `BIL`
- `Azionario` -> `AZN`
- `Obbligazionario Misto` -> `OBB MISTO`
- `Obbligazionario Puro` -> `OBB PURO`
- `Obbligazionario` -> `OBB`

## UX e progressive disclosure
La lista resta orientata alla decisione rapida:
- nome comparto e fondo;
- tipo;
- categoria;
- rating interno;
- costo annuo;
- performance principali;
- chip sintetici.

I testi lunghi vengono mostrati solo nel dettaglio:
- costi di adesione, gestione, trasferimento, riscatto, riallocazione ed erogazione;
- costi di sottoscrizione individuale/collettiva, commissione gestione collettiva, provvigione incentivo e note accordi collettivi, quando disponibili;
- benchmark;
- composizione azionaria/obbligazionaria;
- sostenibilita';
- nota informativa del fondo.

## Piano test e risultati
Comandi eseguiti:
- `node scripts/generate_fp_to_ts.js`
- `node scripts/verify-ranking-costs.mjs`
- popolamento `data/fondi_chiusi_nuovi_aderenti.csv` da `Fondi Chiusi ai nuovi aderenti.xlsx`
- popolamento `data/fondi_accordi_collettivi.csv` da 19 PDF di schede costi collettive
- verifica mapping `Link_fondi.xlsx` vs `app/frontend/data/fundInformativeNotes.ts`
- `cd app/frontend && pnpm build`
- `cd app/frontend && pnpm exec tsc --noEmit`

Risultato:
- generazione completata con 489 righe;
- sidecar chiusura letto con 96 comparti marcati `chiusoNuoviAderenti: true`;
- sidecar accordi collettivi letto con 72 comparti marcati `collectiveAgreementInfo`;
- `app/frontend/data/funds.ts` popolato con 382 valori `ultimi10Anni` e 141 valori `ultimi20Anni`;
- mapping note informative applicato a 49 comparti;
- build frontend completata correttamente.
- `tsc --noEmit` non e' verde per errori TypeScript preesistenti su componenti Framer Motion/Recharts e sul file locale non tracciato `app/frontend/data/funds copy.ts`.
- QA visuale browser non eseguita: l'avvio del dev server locale richiede permessi fuori sandbox e l'approvazione non e' stata concessa.

Aggiornamento v3 2026-07-08:
- `data/fondi_accordi_collettivi.csv` include anche `Commissione gestione collettiva` e `Provvigione incentivo`;
- `node scripts/generate_fp_to_ts.js`: OK, 489 righe generate;
- `node scripts/verify-ranking-costs.mjs`: OK;
- `cd app/frontend && pnpm build`: OK;
- `cd app/frontend && pnpm exec tsc --noEmit`: ancora KO per errori TypeScript globali preesistenti fuori dallo scope dataset;
- `cd app/frontend && pnpm lint`: comando non configurato.
- QA DOM desktop/mobile via dev server e Chrome headless: OK sui filtri Ranking e Confronta impattati dai campi sidecar.

Nota: Vite segnala chunk oltre 500 kB. Il dataset statico contribuisce alla dimensione del bundle; per una prossima iterazione e' consigliato spostare i fondi su API backend o caricare il dataset in modo lazy.

## Rischi aperti e rollback
Rischi:
- bundle frontend piu' pesante per dataset statico;
- campi testuali eterogenei nei costi richiedono normalizzazione ulteriore se diventano filtri o metriche;
- rating sorgente e rating calcolato possono differire, quindi non devono essere confusi in UI;
- i link SharePoint alle note informative sono esterni al repository e potrebbero cambiare o scadere; in quel caso aggiornare `app/frontend/data/fundInformativeNotes.ts`.

Rollback:
- ripristinare il precedente `scripts/generate_fp_to_ts.js`;
- rigenerare il vecchio `app/frontend/data/funds.ts`;
- rimuovere `app/frontend/data/fundInformativeNotes.ts`;
- rimuovere i campi aggiunti da `PensionFund` e dalle sezioni UI.
