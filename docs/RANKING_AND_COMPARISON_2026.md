# Ranking e confronto dati 2026

## Scope e motivazione

La release rende espliciti garanzia del capitale, stato ESG, anno dei rendimenti e costi operativi nel confronto, e aggiunge le classifiche Ranking.

## Comportamento frontend

- La scheda fondo indica l'anno di riferimento del rendimento a 1 anno tramite `DATASET_METADATA.performanceReferenceYear`.
- Il benchmark TFR storico e' etichettato come aggiornato al 2023, per non presentarlo come omogeneo con il dataset performance 2025.
- I chip `ESG` sono visibili solo per comparti classificati positivamente. Le dichiarazioni negative restano consultabili nel dettaglio.
- Il confronto fondi mostra una tabella responsive con garanzia, ESG e costi operativi dichiarati.
- `/ranking` contiene 17 classifiche. Ogni classifica mostra cinque comparti e un controllo accessibile per espandere gli altri risultati.
- I filtri Ranking `Solo fondi ESG`, garanzia del capitale e categoria sono combinabili. Di default i fondi chiusi ai nuovi aderenti sono esclusi e possono essere riammessi con toggle dedicato.
- Dal 2026-07-01 il Ranking include filtro categoria, righe cliccabili con apertura scheda fondo, identita' fondo coerente con Confronta, rating accanto alla metrica e toni distinti per classifiche positive/negative.
- In `Confronta Fondi`, quando il sidecar dati lo indica, il comparto chiuso ai nuovi aderenti mostra `*` accanto al nome e legenda sopra la tabella.

### Aggiornamento feedback post-development (2026-06-24)

- Le classifiche sono visualizzate una per riga, a larghezza completa, invece della precedente griglia a due colonne.
- Ogni classifica usa una card con intestazione sul surface verde del brand e contenuto bianco, coerente con le tabelle di confronto esistenti.
- Ogni card mantiene un'altezza pari a cinque righe. Il comando `Mostra tutti` non allunga la pagina: abilita lo scroll verticale interno alla card; `Mostra solo i primi 5` ripristina la vista iniziale.
- In `Confronta fondi` il filtro `Garanzia del capitale` offre `Tutte le garanzie`, `Con garanzia` e `Senza garanzia`, sia desktop sia mobile. I valori mancanti nel dataset sono mantenuti solo nell'opzione generale.

### Aggiornamento feedback post-development v2 (2026-07-01)

- Rimosse le CTA export PDF da Simulatore e Confronta Fondi.
- Rinominati i ranking rendimenti in `TOP rendimento...`.
- Ranking ISC e costi ordinati dal valore piu' alto al piu' basso, con tono negativo leggibile.
- Corretto il parser costi: stringhe come `Non previste per l'anno 2026` vengono trattate come gratuite e non come importo `2026,00 EUR`.
- Aggiunta barra filtri Ranking con ESG, garanzia capitale e categoria; non include ricerca testuale, tipo, societa' o reset con chip.
- Le righe Ranking sono pulsanti accessibili e aprono la scheda fondo.
- Il nome fondo nel Ranking usa titolo comparto, fondo e societa' come in Confronta Fondi.
- Il rating Accademia Previdenza e' mostrato accanto alla metrica classifica.
- L'intestazione `Rating` in tabella Confronta include popover informativo e link a `/guide#rating-accademia-previdenza`.
- La scheda fondo include un box "Adesione e accordi collettivi" quando `collectiveAgreementInfo` e' valorizzato.
- Badge `Nuovo/Novita` migrati su `StatusBadge` con contrasto sicuro.

### Aggiornamento feedback post-development v3 (2026-07-08)

- Ranking: il filtro garanzia e' ora una select `Tutte le garanzie` / `Con garanzia` / `Senza garanzia`; `Solo fondi ESG` e `Includi fondi chiusi` sono toggle. Il filtro categoria non mostra piu' la label visuale `Categoria`.
- Ranking: i fondi chiusi ai nuovi aderenti sono esclusi di default dalle classifiche; il toggle `Includi fondi chiusi` li reintegra.
- Ranking: i costi di gestione annua sono separati in due classifiche, una percentuale e una fissa in euro, per evitare di mostrare importi fissi come percentuali.
- Ranking: il parser dell'erogazione privilegia le spese di pagamento/rivalutazione rendita rispetto ai costi RITA, quando entrambe le informazioni compaiono nello stesso campo testuale.
- Ranking: i badge rating dentro le classifiche usano un fondo uniforme chiaro, indipendente dalla classe, per ridurre la frammentazione visiva.
- Confronta Fondi: aggiunto filtro per `Tutti gli accordi`, `Con accordi collettivi`, `Senza accordi collettivi`, con chip attivo e reset della paginazione.
- Scheda fondo: rimossa la riga `Rating fonte`; nel box accordi collettivi non viene piu' mostrata la fonte visibile. I campi `Commissione gestione collettiva` e `Provvigione incentivo` sono separati.
- Risorse/metodologia: la descrizione del rating usa la scala numerica 0-10, non piu' classi A-E.
- Loghi emittenti: decisione di prodotto v3, non implementati.

## Regole dati

- Il dataset canonico e' `data/database_comparti_2026-06-10.csv`; `scripts/generate_fp_to_ts.js` rigenera `app/frontend/data/funds.ts`.
- Le linee BCC Vita Equity America, Europa e Asia sono impostate senza garanzia del capitale; la gestione separata BCC Vita Garantita PIP resta separata.
- Lo stato ESG viene derivato dalla dichiarazione sorgente: testi che indicano assenza di politica ESG sono `no`, dichiarazioni Art. 8/9 o equivalenti sono `yes`, gli altri valori sono `unknown`.
- Per evitare ranking fuorvianti, i costi sono classificati solo se il valore e' univoco: euro per adesione/anticipazione/trasferimento/riscatto/riallocazione, euro o percentuale per gestione annua, e percentuale per erogazione. Intervalli, combinazioni e importi a carico del datore sono esclusi.
- I valori gratuiti testuali (`non previste`, `non previsti`, `gratuito`, `nessun costo`) sono normalizzati a `0`.
- Gli importi in euro sono accettati solo se esplicitamente vicini a `euro`, `EUR` o `€`, oppure se sono un valore numerico isolato non interpretabile come anno.
- I sidecar `data/fondi_chiusi_nuovi_aderenti.csv` e `data/fondi_accordi_collettivi.csv` sono letti dal generator con chiave `tipo + N. Albo + Linea/Comparto`.
- I sidecar sono popolati dalle fonti operative disponibili e restano dati statici frontend; `data/fondi_accordi_collettivi.csv` mantiene separati costi di sottoscrizione, commissione di gestione collettiva e provvigione incentivo.

## Impatti

- Frontend: nuovi utility semantici, pagina lazy-loaded Ranking e tabella confronto.
- Backend/config: nessun impatto.
- PWA: nessuna modifica a installabilita' o strategia offline; il nuovo chunk Ranking e' incluso nel prossimo aggiornamento del service worker/build.

L'aggiornamento modifica solo componenti e stato frontend. Non introduce endpoint, contratti API, dati personali o controlli di autorizzazione. La strategia PWA non cambia: gli asset aggiornati continuano a usare la cache statici stale-while-revalidate esistente.

## Test

Esiti implementazione v3 2026-07-08:

- `node scripts/generate_fp_to_ts.js`: OK, 489 righe generate.
- `node scripts/verify-ranking-costs.mjs`: OK, incluse regressioni su costo fisso ZED e priorita' costo rendita Previd System rispetto a RITA.
- `cd app/frontend && pnpm build`: OK; resta il warning Vite preesistente sul chunk principale oltre 500 kB.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori TypeScript preesistenti in wrapper Framer Motion, tipi Recharts, `ImportMeta.env`, hook feedback e `app/frontend/data/funds copy.ts`.
- `cd app/frontend && pnpm lint`: KO, comando `lint` non configurato.
- QA DOM desktop/mobile via dev server e Chrome headless: OK. Verificati Ranking con 17 card, select `Tutte le garanzie`, toggle ESG/chiusi, assenza label `CATEGORIA`, e Confronta con filtri accordi/garanzia anche nel pannello mobile.

- `node scripts/generate_fp_to_ts.js`: completato, 489 righe generate.
- `node scripts/verify-ranking-costs.mjs`: completato.
- `cd app/frontend && pnpm build`: completato.
- `cd app/frontend && pnpm exec tsc --noEmit`: rimangono errori preesistenti nelle animazioni, nei tipi Recharts, in `funds copy.ts` e in altri file fuori scope.
- `cd app/frontend && pnpm lint`: non eseguibile, script `lint` non definito.
- Dev server locale: avvio bloccato dal sandbox; rilancio con permessi esterni rifiutato, quindi QA browser mobile/desktop non eseguita.
- QA visuale browser: non eseguibile nell'ambiente corrente, poiche' il browser integrato non e' disponibile.

Per l'aggiornamento del 2026-06-24 verificare inoltre:

1. desktop e mobile: una sola classifica per riga, intestazione verde e cinque risultati iniziali;
2. click e tastiera sul comando di espansione: tutte le righe sono raggiungibili nello scroll interno, senza variazione dell'altezza della card;
3. filtro garanzia `Sì`/`No`, combinato con ricerca, categoria, tipo e società; reset, chip attivo e reset della paginazione;
4. `pnpm build` e `pnpm exec tsc --noEmit` nel frontend.

Esiti implementazione 2026-06-24:

- `cd app/frontend && pnpm build`: OK; rimane il warning preesistente sul chunk principale oltre 500 kB.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori preesistenti in animazioni Framer Motion, Recharts, `ImportMeta`, feedback e `data/funds copy.ts`; nessun errore nei file modificati per questo aggiornamento.
- `cd app/frontend && pnpm lint`: non eseguibile: lo script `lint` non e' definito in `package.json`. Va tracciato come debito tecnico frontend.
- QA browser desktop/mobile: non eseguibile in questa sessione per indisponibilita' del browser integrato. La checklist sopra resta richiesta prima del deploy production.

## Rischi e rollback

- Le classifiche costi non includono valori testuali non normalizzabili; un futuro dataset strutturato puo' ampliare la copertura.
- Rollback: rimuovere pagina Ranking e tabella confronto, ripristinare dataset e rigenerare `funds.ts`.
