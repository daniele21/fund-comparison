# Export PDF simulazione e confronto fondi - deprecato

## Scope e motivazione
Dal 2026-07-01 il frontend non espone piu' export PDF per Simulatore e Confronta Fondi.

La rimozione recepisce il feedback post-development Comparatore v2: queste sezioni devono restare strumenti interattivi e non generare report stampabili.

## Comportamento utente
- Il blocco "Esporta simulazione in PDF" non e' piu' presente nel Simulatore.
- Il blocco "Esporta confronto in PDF" non e' piu' presente in Confronta Fondi.
- Non viene piu' invocato `window.print()` da questi flussi.

## Impatti frontend/backend/config
- Rimossi:
  - `app/frontend/components/simulator/SimulationPdfReport.tsx`
  - `app/frontend/components/FundComparisonPdfReport.tsx`
  - `app/frontend/components/reports/PdfReportLayout.tsx`
  - `app/frontend/utils/simulationReport.ts`
  - `app/frontend/utils/pdfReportNarratives.ts`
- Rimossi i tipi `SimulationReport*` da `app/frontend/types.ts`.
- Rimossi gli stili print/PDF dedicati da `app/frontend/index.css`.
- Backend/config: nessun impatto.

## Test e QA
Comandi eseguiti:
- `cd app/frontend && pnpm build`: OK.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori TypeScript preesistenti fuori scope.
- `cd app/frontend && pnpm lint`: KO, script `lint` non definito.
- Dev server locale: non avviato per approvazione esterna rifiutata.

QA manuale consigliato:
- Desktop/mobile: Simulatore senza barra export PDF.
- Desktop/mobile: Confronta Fondi senza barra export PDF.
- Verificare che i grafici e le tabelle restino visibili e interattivi.

## Rischi e rollback
- Rischio: utenti che usavano il PDF non hanno piu' un export equivalente.
- Rollback: ripristinare i componenti report, le utility, i tipi, le CTA in `SimulatorPage`/`VisualComparison` e le regole print in `index.css`, poi rigenerare build frontend.
