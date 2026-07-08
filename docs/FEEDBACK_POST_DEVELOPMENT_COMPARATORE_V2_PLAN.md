# Piano implementazione feedback post-development Comparatore v2

Data analisi: 2026-07-01  
Input principale: `/Users/moltisantid/Downloads/Feedback post development Comparatore_v2.docx`

## Obiettivo

Applicare al repository il feedback post-development sul comparatore fondi, mantenendo diff piccoli, contratti dati tipizzati e documentazione aggiornata.

Il lavoro e' quasi interamente frontend, ma due richieste dipendono da dati esterni non ancora presenti in modo canonico nel repo:

- file Excel "Fondi Chiusi ai nuovi aderenti";
- PDF/schede costi aggiornate da cui estrarre gli accordi collettivi e i costi di sottoscrizione in adesione collettiva.

## Metodo di analisi

- Estratto testo strutturale dal DOCX e asset immagine interni.
- Letti i componenti principali del frontend: `App.tsx`, `VisualComparison`, `SimulatorPage`, `FundTable`, `FundDetailModal`, `PlaybookContent`, `RankingPage`, `RankingCard`, `fundRanking`, `fundRating`, generator dataset.
- Verificato il dataset canonico `data/database_comparti_2026-06-10.csv`.
- Verificato il worktree: esistono gia' modifiche locali non mie su ranking/filtro garanzia e docs.
- Tentato render DOCX tramite plugin documenti: non completato per `ModuleNotFoundError: No module named 'pdf2image'`. Per il piano sono state comunque ispezionate le immagini embeddate.

## Stato attuale rilevante

### Worktree gia' modificato

Prima di questa analisi il worktree conteneva gia':

- `app/frontend/App.tsx`
- `app/frontend/components/ActiveFiltersChips.tsx`
- `app/frontend/components/FilterControls.tsx`
- `app/frontend/features/ranking/RankingPage.tsx`
- `app/frontend/types.ts`
- `docs/RANKING_AND_COMPARISON_2026.md`
- `spec_dev.md`
- nuovo file non tracciato `app/frontend/features/ranking/RankingCard.tsx`

Queste modifiche sembrano coprire parzialmente un feedback precedente:

- card ranking a larghezza piena;
- filtro garanzia in `Confronta Fondi`;
- documentazione del refinement ranking.

Non vanno revertate. Le nuove implementazioni devono lavorarci sopra.

### Architettura utile

- Dati fondi statici: `app/frontend/data/funds.ts`, generato da `scripts/generate_fp_to_ts.js`.
- Sorgente canonica dataset: `data/database_comparti_2026-06-10.csv`.
- Contratto fondo: `app/frontend/types.ts`, `PensionFund`.
- Ranking: `app/frontend/utils/fundRanking.ts` + `app/frontend/features/ranking/*`.
- Confronta fondi: `App.tsx` orchestration, `GuidedFundTable`, `FundTable`, `VisualComparison`.
- Scheda fondo: `app/frontend/components/FundDetailModal.tsx`.
- Risorse: `app/frontend/components/PlaybookContent.tsx`, nav in `features/dashboard/config.tsx`.
- Brand token: `app/frontend/config/brandTokens.ts` + CSS variables in `app/frontend/index.css`.
- PWA cache: `app/frontend/public/sw.js`.

## Sintesi richieste dal feedback

| ID | Richiesta | Area | Stato attuale | Tipo intervento |
| --- | --- | --- | --- | --- |
| F1 | Rimuovere report/PDF da Simulatore e Confronta Fondi | Frontend UI/report | Barre export ancora presenti | UI cleanup + rimozione codice morto |
| F2 | Marcare fondi "Chiuso ai nuovi aderenti" con `*` e legenda sopra tabella | Dataset + tabella | Campo assente | Nuovo contratto dati + UI |
| F3 | Spiegazione dettagliata rating in Risorse | Risorse/docs UI | Esiste `docs/calcolo-rating.md`, manca sezione in app | Nuova sezione informativa |
| F4 | Icona info cerchiata vicino a intestazione "Rating" con popup/link a Risorse | Tabelle/ranking | Header Rating senza info | Componente popover accessibile |
| F5 | Ranking cliccabile: apertura scheda fondo | Ranking/modale | Ranking non riceve `onFundClick` | Prop drilling controllato |
| F6 | Ranking: nome fondi come in Confronta Fondi | Ranking UI | Testo unico `pip - linea` | Estrarre/reusare identity row |
| F7 | Ranking: logo societa emittente a sinistra del titolo | Ranking UI/assets | Superato da decisione v3 | Non implementare loghi emittente |
| F8 | Ranking: rating Accademia Previdenza vicino al valore metrica | Ranking UI | Non mostrato | Reuso badge rating |
| F9 | Ranking: rinominare classifiche e invertire cost ranking "peggiori" | Ranking logic/UI | Titoli vecchi, costi ordinati migliori->peggiori | Metadati metriche + sorting |
| F10 | Ranking: nuova barra filtri simile a Confronta, senza campi barrati | Ranking UI | Checkbox semplici | Componente filtro dedicato |
| F11 | Scheda fondo: informazioni accordi collettivi/costi sottoscrizione | Dataset + modal | Campo assente | Estrazione dati + sezione modale |
| F12 | Tag "Nuovo"/novita sempre leggibili | UI kit | Badge con testo bianco su giallo chiaro | Atom badge/contrasto |
| F13 | Sidebar: padding freccia collapse e allineamento MENU | App layout | Pulsante piccolo/disallineato | Piccolo fix layout |
| F14 | Bug ranking trasferimento: mostra `2026,00 EUR` | Ranking parser | Riproducibile su FONDAEREO | Fix parser costi + test |
| F15 | Risorse: definizioni MEFOP delle linee investimento | Risorse UI | Solo 4 card generiche | Copy + sezione estesa |

## Analisi dettagliata per area

### 1. Rimozione export PDF/report

Richiesta: non generare piu' report in Simulatore e Confronta Fondi. Le barre "Esporta simulazione in PDF" e "Esporta confronto in PDF" devono scomparire interamente.

File coinvolti:

- `app/frontend/components/simulator/SimulatorPage.tsx`
- `app/frontend/components/VisualComparison.tsx`
- potenzialmente eliminabili se non piu' referenziati:
  - `app/frontend/components/simulator/SimulationPdfReport.tsx`
  - `app/frontend/components/FundComparisonPdfReport.tsx`
  - `app/frontend/components/reports/PdfReportLayout.tsx`
  - `app/frontend/utils/simulationReport.ts`
  - `app/frontend/utils/pdfReportNarratives.ts`
  - tipi `SimulationReport*` in `app/frontend/types.ts`
  - stili `.pdf-*`, `.simulation-print-report`, `.fund-comparison-print-report`, `@media print` in `app/frontend/index.css`

Implementazione consigliata:

1. Rimuovere in `SimulatorPage` import `Download`, `FileText`, `buildSimulationReportModel`, `SimulationPdfReport`, stati `reportGeneratedAt`/`printQueued`, `exportFunds`, `canExportPdf`, `reportModel`, `handleExportPdf`, effect con `window.print()`, barra export e render report.
2. Rimuovere in `VisualComparison` import `Download`, `FileText`, `useAuth`, `FundComparisonPdfReport`, stato/effect di stampa, barra export e render report.
3. Eseguire `rg "SimulationPdfReport|FundComparisonPdfReport|buildSimulationReportModel|pdfReportNarratives|pdf-" app/frontend` e cancellare codice morto solo se non usato.
4. Aggiornare docs:
   - `docs/SIMULATION_PDF_EXPORT.md`: marcare come rimosso/deprecato o eliminarlo se non serve piu' come storico.
   - `spec_dev.md`: feature note con rimozione export.
   - `docs/RANKING_AND_COMPARISON_2026.md`: aggiornare sezione confronto.

Rischi:

- Gli stili print sono molti e possono essere interamente morti dopo la rimozione. Prima di cancellarli serve conferma da `rg`.
- Se in futuro servira' PDF, meglio non lasciare codice nascosto non raggiungibile: contraddirebbe la richiesta "non generare piu' report".

### 2. Fondi chiusi ai nuovi aderenti

Richiesta: in `Confronta Fondi`, affiancare `*` al titolo del fondo chiuso ai nuovi aderenti e mostrare sopra la tabella la legenda `* Chiuso ai nuovi aderenti`.

Stato attuale:

- `PensionFund` include `chiusoNuoviAderenti`.
- `data/fondi_chiusi_nuovi_aderenti.csv` e' popolato dal riferimento locale `Fondi Chiusi ai nuovi aderenti.xlsx`.
- Il mapping applica solo righe con match certo su `N. Albo + Linea/Comparto`: 96 righe agganciate, 9 righe sorgente escluse per assenza/rinomina nel dataset canonico.

Contratto dati proposto:

```ts
export interface PensionFund {
  // ...
  chiusoNuoviAderenti: boolean;
}
```

Fonte dati proposta:

- Aggiungere un sidecar versionato, ad esempio `data/fondi_chiusi_nuovi_aderenti.csv`.
- Colonne minime:
  - `tipo`
  - `N. Albo`
  - `Linea/Comparto`
  - `Chiuso ai nuovi aderenti`
  - `Fonte` opzionale

Matching consigliato:

- Chiave primaria: `tipo|N. Albo|Linea/Comparto`, coerente con `scripts/generate_fp_to_ts.js`.
- Evitare match solo per nome, perche' molte linee hanno nomi uguali tra fondi diversi.

UI:

- Desktop `FundTable`: dopo `fund.linea`, render `*` rosso/brand-danger se `chiusoNuoviAderenti`.
- Mobile card: stesso indicatore accanto al titolo.
- Sopra la tabella risultati, dentro la sezione `fund-table`, mostrare la legenda solo se tra i fondi filtrati/visibili esiste almeno un chiuso.
- Valutare di aggiungere lo stesso dato nella `FundDetailModal` come badge informativo, anche se il feedback lo chiede esplicitamente per la tabella.

### 3. Rating: sezione Risorse e info icon

Richiesta:

- In Risorse aggiungere spiegazione dettagliata del calcolo rating.
- In tutte le sezioni dove `Rating` compare come intestazione colonna, aggiungere una `i` cerchiata con popup e link alla sezione Risorse.

Stato attuale:

- Metodologia documentata in `docs/calcolo-rating.md` e sintetizzata in `docs/rating-fondi.md`.
- Logica calcolo in `app/frontend/utils/fundRating.ts`.
- Rating mostrato in `FundTable`, mobile card, modal e da aggiungere al ranking.
- Header tabella desktop `FundTable` usa `SortableHeader label="Rating"`.

Implementazione consigliata:

1. Estrarre copy sintetico e verificabile da `docs/calcolo-rating.md` in una sezione di `PlaybookContent` con id stabile:
   - `id="rating-accademia-previdenza"`
   - titolo: `Come viene calcolato il rating`
   - contenuti: ammissibilita, ISC usato, score netto per periodo, pesi normalizzati, classe A-E, casi limite.
2. Aggiungere un componente atom/molecule, ad esempio `components/common/InfoPopover.tsx`:
   - trigger `button` con `Info` di `lucide-react`;
   - tooltip/popover su hover e focus;
   - click/tap per mobile;
   - link `href="/guide#rating-accademia-previdenza"`;
   - `aria-label`, `aria-describedby`, chiusura con Escape se interattivo.
3. Aggiornare `SortableHeader` per accettare label composita:
   - `label: React.ReactNode`
   - `ariaLabel: string`
   - evitare che click sull'icona info scateni il sort (`event.stopPropagation()`).
4. Se il ranking introduce una colonna/area `Rating`, aggiungere lo stesso popover nell'intestazione della card o nella label della colonna.

Nota su MEFOP:

- Per la copy finale delle definizioni MEFOP serve una fonte ufficiale verificata o un testo approvato dal team. Il piano non inserisce testo definitivo MEFOP non verificato.

### 4. Ranking commerciale

Richieste aggregate:

- Clic su fondo apre la scheda dettaglio.
- Nome fondo organizzato come in `Confronta Fondi`: titolo, sottotitolo, emittente.
- Logo societa emittente a sinistra del titolo e a destra della posizione in classifica.
- Rating Accademia Previdenza con stelline e voto in decimi accanto al valore classifica.
- Rinomina classifiche secondo tabella feedback.
- Classifiche con ordinamento dal peggiore al migliore devono usare tono piu' rosso/negativo ma coerente col brand.
- Barra filtri simile a `Confronta Fondi` ma senza ricerca, tipo, societa, contatore e reset evidenziati con X; aggiungere filtro categoria.

Stato attuale:

- `RankingPage` riceve solo `funds`.
- `RankingCard` mostra righe con `pip - linea` e valore.
- `RANKING_METRICS` ha titoli vecchi.
- Sorting attuale:
  - rendimenti: descending;
  - ISC/costi: ascending, quindi migliori/economici prima.
- Filtro ranking: solo checkbox ESG e garanzia.

Contratto `RankingMetric` proposto:

```ts
type RankingTone = 'positive' | 'negative';
type RankingSortDirection = 'ascending' | 'descending';

type RankingMetric =
  | {
      id: string;
      title: string;
      kind: 'return';
      key: ReturnKey;
      sortDirection: RankingSortDirection;
      tone: RankingTone;
    }
  | {
      id: string;
      title: string;
      kind: 'isc';
      key: IscKey;
      sortDirection: RankingSortDirection;
      tone: RankingTone;
    }
  | {
      id: string;
      title: string;
      kind: 'cost';
      key: CostKey;
      unit: 'EUR' | '%';
      sortDirection: RankingSortDirection;
      tone: RankingTone;
    };
```

Titoli e ordinamenti richiesti:

| ID attuale | Nuovo titolo | Ordinamento |
| --- | --- | --- |
| `return-1y` | TOP rendimento a 1 anno | maggiore -> minore |
| `return-3y` | TOP rendimento a 3 anni | maggiore -> minore |
| `return-5y` | TOP rendimento a 5 anni | maggiore -> minore |
| `return-10y` | TOP rendimento a 10 anni | maggiore -> minore |
| `return-20y` | TOP rendimento a 20 anni | maggiore -> minore |
| `isc-2y` | ISC piu' alto a 2 anni | maggiore -> minore |
| `isc-5y` | ISC piu' alto a 5 anni | maggiore -> minore |
| `isc-10y` | ISC piu' alto a 10 anni | maggiore -> minore |
| `isc-35y` | ISC piu' alto a 35 anni | maggiore -> minore |
| `cost-join` | Costo di adesione piu' alto | maggiore -> minore |
| `cost-management` | Gestione annua piu' costosa | maggiore -> minore |
| `cost-advance` | Anticipazione piu' onerosa | maggiore -> minore |
| `cost-transfer` | Trasferimento piu' costoso | maggiore -> minore |
| `cost-redemption` | Riscatto piu' costoso | maggiore -> minore |
| `cost-reallocation` | Riallocazione piu' costosa | maggiore -> minore |
| `cost-payment` | Erogazione piu' costosa | maggiore -> minore |

Nota: il feedback chiede esplicitamente "dal peggiore al migliore" per i costi/ISC, quindi il ranking deve diventare una classifica dei valori piu' onerosi, non dei piu' convenienti.

Implementazione UI:

1. In `App.tsx`, passare `onFundClick={handleFundClick}` a `RankingPage`.
2. In `RankingPageProps`, aggiungere `onFundClick: (fund: PensionFund) => void`.
3. In `RankingCard`, rendere ogni riga un `button` o contenere un button "apri dettaglio" accessibile:
   - click/tastiera apre modal;
   - non interferisce con `Mostra tutti`.
4. Estrarre da `FundTable` componenti riusabili:
   - `components/common/FundIdentity.tsx` per titolo, sottotitolo, societa, marker chiuso;
   - `components/common/FundRatingBadge.tsx` per stelle/voto;
   - decisione v3: niente `IssuerLogo`, niente asset o fallback emittente dedicati.
5. Layout riga ranking desktop:
   - posizione;
   - identity fondo;
   - rating;
   - metrica.
6. Layout mobile:
   - posizione + identity su prima riga;
   - rating e metrica su seconda riga.

Loghi societa:

- Decisione v3: feature esclusa. Non aggiungere mapping asset, fallback iniziali o modifiche PWA per loghi emittenti.

Colorazione negativa:

- Non hardcodare classi rosse sparse.
- Aggiungere token semantici in `brandTokens.ts`/`index.css`, ad esempio:
  - `rankingPositiveSurface`
  - `rankingNegativeSurface`
  - `rankingNegativeBorder`
  - `rankingNegativeText`
- Il tono negativo deve essere leggibile in light/dark e non dipendere solo dal colore.

### 5. Barra filtri Ranking

Stato attuale:

```ts
export interface RankingFilters {
  onlyEsg: boolean;
  capitalGuarantee: CapitalGuaranteeFilter;
  includeClosedFunds: boolean;
  category: FundCategory | 'all';
}
```

Estensione proposta:

```ts
export interface RankingFilters {
  onlyEsg: boolean;
  capitalGuarantee: CapitalGuaranteeFilter;
  includeClosedFunds: boolean;
  category: FundCategory | 'all';
}
```

UI consigliata:

- Nuovo componente `app/frontend/features/ranking/RankingFiltersBar.tsx`.
- Controlli:
  - checkbox/toggle `Solo fondi ESG`;
  - select `Tutte le garanzie` / `Con garanzia` / `Senza garanzia`;
  - toggle `Includi fondi chiusi`;
  - select `Tutte le categorie`.
- Non includere:
  - ricerca testuale;
  - tipo fondo;
  - societa;
  - contatore fondi disponibili;
  - reset globale, salvo si decida di mantenerlo solo come azione secondaria non presente nello screenshot.

Accessibilita:

- Label visibili.
- `select` con `aria-label` se label non sufficiente.
- Stati focus coerenti con `FilterControls`.

### 6. Scheda fondo: accordi collettivi/costi sottoscrizione

Richiesta: nella scheda fondo aggiungere informazioni sugli accordi collettivi, presenti solo per alcuni fondi, con focus sui costi di sottoscrizione se si aderisce tramite contratto collettivo o meno. Posizionare accanto al box "Costi operativi".

Stato attuale:

- `PensionFund` include `collectiveAgreementInfo`.
- `FundDetailModal` mostra il box `Adesione e accordi collettivi` accanto ai costi operativi quando il sidecar contiene dati.
- `data/fondi_accordi_collettivi.csv` e' popolato dalle schede costi collettive fornite: 19 PDF, 16 fondi, 72 comparti agganciati al dataset canonico.
- Per TESEO e Programma Open sono gestite piu' classi/fasce nella stessa riga comparto; per Programma Open il dettaglio numerico resta da verificare sulla fonte per limiti di estrazione tabellare dai PDF.

Contratto dati proposto:

```ts
export interface FundCollectiveAgreementInfo {
  hasCollectiveAgreements: boolean;
  collectiveAgreementLabel: string | null;
  subscriptionCostIndividual: string | null;
  subscriptionCostCollective: string | null;
  notes: string | null;
  sourceFileName: string | null;
}

export interface PensionFund {
  // ...
  collectiveAgreementInfo: FundCollectiveAgreementInfo | null;
}
```

Fonte dati consigliata:

- Sidecar `data/fondi_accordi_collettivi.csv` o JSON.
- Chiave: `tipo|N. Albo|Linea/Comparto`.
- Campi testuali mantenuti come testo fonte, senza normalizzazione numerica se le schede costi hanno condizioni complesse.

UI:

- In `FundDetailModal`, trasformare l'area `Costi operativi` in grid desktop a due colonne:
  - colonna sinistra: costi operativi attuali;
  - colonna destra: `Adesione e accordi collettivi`.
- Su mobile impilare sotto i costi operativi.
- Stato empty: non mostrare il box se `collectiveAgreementInfo` e' null o completamente vuoto.

### 7. Contrasto badge/tag "Nuovo"

Problema rilevato:

- `SectionHeader` usa `new: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'`; nello screenshot il testo bianco sul giallo e' poco leggibile.
- `HomePage` ha un badge "Novita" hardcoded con lo stesso pattern.

Implementazione consigliata:

1. Creare atom `components/ui/StatusBadge.tsx` oppure `components/common/StatusBadge.tsx`.
2. Varianti tipizzate:
   - `new`
   - `beta`
   - `updated`
   - `info`
3. Regola contrasto:
   - background chiaro => testo nero/scuro;
   - background scuro => testo bianco;
   - non usare gradienti giallo/arancio con testo bianco.
4. Migrare `SectionHeader` e badge di `HomePage`.
5. Cercare altri "Nuovo"/badge con `rg "Nuovo|Novita|badge"` e uniformare solo quelli in scope.

### 8. Sidebar: collapse button e header MENU

File:

- `app/frontend/App.tsx`

Area attuale:

- Header sidebar con `px-4 py-4`, label MENU e button `p-1.5`.

Intervento:

- Rendere il contenitore header ad altezza stabile, es. `min-h-14`.
- Pulsante collapse con target 44x44, padding maggiore, centrato verticalmente.
- In stato expanded, `MENU` centrato verticalmente rispetto alla freccia.
- In stato collapsed, freccia centrata nella sidebar.
- Evitare shift della larghezza sidebar.

### 9. Bug parser spese trasferimento

Problema riprodotto:

Nel CSV, tre righe hanno:

```text
Costi di Trasferimento = "Non previste per l'anno 2026"
```

Il parser in `app/frontend/utils/fundRanking.ts` prende il primo numero e produce `2026,00 EUR`.

Righe coinvolte:

- FONDAEREO - CRESCITA
- FONDAEREO - EQUILIBRIO
- FONDAEREO - GARANTITO

Implementazione consigliata:

1. Aggiornare `FREE_COST` per coprire:
   - `non previste`
   - `non previsti`
   - `non previste per l'anno 2026`
   - eventuali apostrofi Unicode/ASCII.
2. Rendere `parseCost` piu' difensivo:
   - per `EUR`, accettare numero solo se vicino a `euro`, `eur`, `EUR`, `€`, oppure se la stringa e' un pattern gratuito riconosciuto;
   - escludere numeri a 4 cifre tra 1900 e 2100 se non sono esplicitamente importi.
3. Aggiungere test leggero:
   - se non c'e' framework test frontend, esportare un helper testabile o creare script `scripts/verify-ranking-costs.mjs` con assert Node;
   - casi minimi: `50 euro -> 50`, `Non previste -> 0`, `Non previste per l'anno 2026 -> 0`, `100,00 EUR -> 100`, `a carico del datore -> null`.

### 10. Risorse: definizioni linee di investimento secondo MEFOP

Richiesta: dopo "Le linee di investimento (livello di rischio)" aggiungere paragrafo che spiega:

- linea azionaria;
- linea bilanciata;
- linea obbligazionaria;
- obbligazionaria mista;
- obbligazionaria puro.

Stato attuale:

- `PlaybookContent` mostra 4 card:
  - Garantita;
  - Obbligazionaria;
  - Bilanciata;
  - Azionaria.
- Mancano OBB MISTO e OBB PURO come definizioni separate.

Implementazione:

1. Aggiungere una sezione sotto le card esistenti o sostituire le card con 6 definizioni coerenti con `CATEGORY_MAP`.
2. Inserire testo approvato/validato su fonte MEFOP.
3. Evitare copy troppo lungo nelle card: meglio una breve definizione e un box esplicativo sotto.
4. Aggiornare docs con fonte usata e data verifica.

Nota:

- Prima di scrivere copy definitivo, recuperare fonte MEFOP ufficiale o approvazione business. Non inventare definizioni se la fonte non e' disponibile.

## Piano operativo consigliato

### Fase 0 - Preparazione dati e decisioni

Obiettivo: sbloccare i due punti che dipendono da fonti esterne.

Azioni:

1. Recuperare file Excel "Fondi Chiusi ai nuovi aderenti".
2. Recuperare o identificare i PDF/schede costi con accordi collettivi.
3. Decidere formato sidecar:
   - `data/fondi_chiusi_nuovi_aderenti.csv`
   - `data/fondi_accordi_collettivi.csv`
4. Confermare se i loghi societa devono essere asset reali o fallback iniziali per la prima release.
5. Confermare fonte MEFOP da citare/riassumere.

Output:

- dati versionati o istruzioni chiare per importarli;
- chiave matching condivisa.

### Fase 1 - Fix rapidi e a basso rischio

Obiettivo: chiudere bug e rimozioni evidenti senza dipendenze esterne.

Azioni:

1. Rimuovere barre export PDF e codice report non piu' usato.
2. Correggere `parseCost` per il bug `2026,00 EUR`.
3. Sistemare badge/tag "Nuovo" con un componente contrast-safe.
4. Sistemare header sidebar/collapse button.
5. Aggiornare docs relative a rimozione PDF e bug parser.

Verifica:

- `cd app/frontend && pnpm build`
- `cd app/frontend && pnpm exec tsc --noEmit`
- eventuale script assert per parser ranking.
- QA manuale mobile/desktop su Simulatore, Confronta, Home, Ranking.

### Fase 2 - Ranking commerciale

Obiettivo: trasformare ranking in una vista commerciale e coerente con Confronta Fondi.

Azioni:

1. Estendere `RankingFilters` con categoria.
2. Creare `RankingFiltersBar`.
3. Aggiornare `RANKING_METRICS` con titoli, direzioni e tone.
4. Aggiornare `getRankedFunds` per usare `sortDirection`.
5. Estrarre `FundIdentity` e `FundRatingBadge`; niente componente loghi emittente per decisione v3.
6. Passare `onFundClick` da `App` a `RankingPage` e poi `RankingCard`.
7. Aggiornare `RankingCard` layout e accessibilita.
8. Aggiungere eventuali token `rankingNegative*`.

Verifica:

- ranking rendimenti: valore piu' alto primo.
- ranking ISC/costi: valore piu' alto primo.
- click/tastiera su riga apre modal.
- filtro categoria produce classifiche omogenee.
- mobile: righe non overflowano e rating/metrica restano leggibili.

### Fase 3 - Dati chiusura fondi e accordi collettivi

Obiettivo: integrare nuove informazioni dati senza logica fragile nei componenti.

Azioni:

1. Aggiornare `PensionFund` con `chiusoNuoviAderenti`.
2. Aggiornare `scripts/generate_fp_to_ts.js` per unire il sidecar chiusura.
3. Rigenerare `app/frontend/data/funds.ts`.
4. Aggiungere legenda e asterisco in `FundTable`/`FundIdentity`.
5. Aggiungere `FundCollectiveAgreementInfo`.
6. Aggiornare generator per accordi collettivi.
7. Aggiornare `FundDetailModal` con box accanto a "Costi operativi".

Verifica:

- `node scripts/generate_fp_to_ts.js`
- controllo righe attese 489.
- snapshot/manuale su almeno:
  - fondo chiuso;
  - fondo aperto;
  - fondo con accordi collettivi;
  - fondo senza accordi collettivi.

### Fase 4 - Risorse e info rating

Obiettivo: chiudere parte informativa e link contestuali.

Azioni:

1. Aggiungere sezione rating in `PlaybookContent`.
2. Aggiungere sezione MEFOP/linee investimento estesa.
3. Creare `InfoPopover`.
4. Aggiornare header `Rating` in `FundTable` e ranking se applicabile.
5. Testare link `/guide#rating-accademia-previdenza`.

Verifica:

- hover/focus apre popup.
- link porta alla sezione corretta.
- mobile: tap funziona senza hover.
- screen reader: trigger ha label comprensibile.

### Fase 5 - Documentazione e quality gates

Documenti da aggiornare:

- `spec_dev.md`: feature note completa.
- `docs/RANKING_AND_COMPARISON_2026.md`: ranking, filtri, bug costi, chiusura fondi.
- `docs/SIMULATION_PDF_EXPORT.md`: rimozione/deprecazione export.
- nuovo o aggiornato doc dataset, ad esempio `docs/DATASET_COMPARTI_2026_MIGRATION.md`, per sidecar chiusura/accordi collettivi.
- `README.md` solo se cambia setup o comando import dati.

Comandi:

```bash
node scripts/generate_fp_to_ts.js
cd app/frontend && pnpm build
cd app/frontend && pnpm exec tsc --noEmit
```

Nota:

- `app/frontend/package.json` non espone `lint` o `typecheck`. Per il typecheck usare `pnpm exec tsc --noEmit` finche' non viene aggiunto uno script.
- La documentazione esistente indica errori TypeScript preesistenti. Se persistono, documentare che non sono introdotti dai file modificati.

## Rischi aperti

- Dati: fondi chiusi e accordi collettivi sono popolati dalle fonti fornite; restano da verificare eventuali righe senza match e i dettagli numerici non tabellari di Programma Open.
- Loghi emittenti: fuori scope per decisione v3.
- MEFOP: serve fonte ufficiale o testo approvato per evitare definizioni non allineate.
- Ranking "peggiori costi": e' un cambio semantico forte rispetto alla documentazione precedente, che parlava di costi confrontabili e ranking economici. Va comunicato bene in UI.
- PWA: nessuna modifica per loghi emittenti, perche' la feature e' fuori scope.
- Accessibilita: popup rating deve funzionare anche con tastiera e touch, non solo hover.

## Rollback per macro-area

- PDF export: revert dei file `SimulatorPage`, `VisualComparison`, componenti report e CSS print.
- Ranking: ripristino `RANKING_METRICS`, `getRankedFunds`, `RankingPage`, `RankingCard`.
- Dati chiusura/accordi: rimuovere sidecar, campi `PensionFund`, merge generator, rigenerare `funds.ts`.
- Risorse/info rating: rimuovere sezioni `PlaybookContent` e `InfoPopover` dai label.
- UI contrast/sidebar: revert puntuale di `StatusBadge`/`SectionHeader`/`HomePage` e header sidebar.

## Checklist finale

- [ ] Export PDF rimosso da UI e codice morto pulito.
- [ ] Bug `2026,00 EUR` risolto con test/asserzione.
- [ ] Ranking con titoli commerciali, ordinamento richiesto e tono negativo.
- [ ] Ranking apre scheda fondo.
- [ ] Ranking mostra identity fondo e rating.
- [ ] Ranking filtra per ESG, garanzia e categoria.
- [ ] Asterisco fondi chiusi alimentato da campo dati, non da euristiche sul nome.
- [x] Scheda fondo mostra accordi collettivi quando disponibili.
- [ ] Risorse contiene rating e definizioni linee investimento.
- [ ] Icona info rating accessibile e linkata alla sezione Risorse.
- [ ] Badge/tag novita leggibili in light e dark.
- [ ] Sidebar collapse allineata.
- [ ] `pnpm build` completato.
- [ ] `pnpm exec tsc --noEmit` eseguito e risultato documentato.
- [ ] QA mobile + desktop completata.
- [ ] `spec_dev.md` e docs aggiornati.
