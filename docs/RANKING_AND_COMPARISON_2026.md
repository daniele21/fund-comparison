# Ranking e confronto dati 2026

## Scope e motivazione

La release rende espliciti garanzia del capitale, stato ESG, anno dei rendimenti e costi operativi nel confronto, e aggiunge le classifiche Ranking.

## Comportamento frontend

- La scheda fondo indica l'anno di riferimento del rendimento a 1 anno tramite `DATASET_METADATA.performanceReferenceYear`.
- Il benchmark TFR storico e' etichettato come aggiornato al 2023, per non presentarlo come omogeneo con il dataset performance 2025.
- I chip `ESG` sono visibili solo per comparti classificati positivamente. Le dichiarazioni negative restano consultabili nel dettaglio.
- Il confronto fondi mostra una tabella responsive con garanzia, ESG e costi operativi dichiarati.
- `/ranking` contiene 16 classifiche. Ogni classifica mostra cinque comparti e un controllo accessibile per espandere gli altri risultati.
- I filtri `Solo fondi ESG` e `Solo fondi con garanzia del capitale` sono combinabili.

## Regole dati

- Il dataset canonico e' `data/database_comparti_2026-06-10.csv`; `scripts/generate_fp_to_ts.js` rigenera `app/frontend/data/funds.ts`.
- Le linee BCC Vita Equity America, Europa e Asia sono impostate senza garanzia del capitale; la gestione separata BCC Vita Garantita PIP resta separata.
- Lo stato ESG viene derivato dalla dichiarazione sorgente: testi che indicano assenza di politica ESG sono `no`, dichiarazioni Art. 8/9 o equivalenti sono `yes`, gli altri valori sono `unknown`.
- Per evitare ranking fuorvianti, i costi sono classificati solo se il valore e' univoco: euro per adesione/anticipazione/trasferimento/riscatto/riallocazione e percentuale per gestione annua/erogazione. Intervalli, combinazioni e importi a carico del datore sono esclusi.

## Impatti

- Frontend: nuovi utility semantici, pagina lazy-loaded Ranking e tabella confronto.
- Backend/config: nessun impatto.
- PWA: nessuna modifica a installabilita' o strategia offline; il nuovo chunk Ranking e' incluso nel prossimo aggiornamento del service worker/build.

## Test

- `node scripts/generate_fp_to_ts.js`: completato, 489 righe generate.
- `cd app/frontend && pnpm build`: completato.
- `cd app/frontend && pnpm exec tsc --noEmit`: rimangono errori preesistenti nelle animazioni, nei tipi Recharts, in `funds copy.ts` e in altri file fuori scope.
- QA visuale browser: non eseguibile nell'ambiente corrente, poiche' il browser integrato non e' disponibile.

## Rischi e rollback

- Le classifiche costi non includono valori testuali non normalizzabili; un futuro dataset strutturato puo' ampliare la copertura.
- Rollback: rimuovere pagina Ranking e tabella confronto, ripristinare dataset e rigenerare `funds.ts`.
