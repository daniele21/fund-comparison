# Export PDF simulazione e confronto fondi

## Scope e motivazione
La feature consente di esportare la simulazione previdenziale e il confronto fondi in PDF generati dal browser tramite stampa/salva PDF. L'obiettivo e' produrre report leggibili con gli stessi elementi principali della webapp: fondi selezionati, parametri, KPI, grafici, costi, rendimenti e disclaimer.

## Comportamento utente - simulatore
- Il blocco "Esporta simulazione in PDF" e' visibile nel simulatore vicino al selettore fondi.
- Il pulsante resta disabilitato finche' non viene selezionato almeno un fondo.
- In modalita' singola esporta il fondo selezionato.
- In modalita' confronto esporta tutti i fondi selezionati, anche quando e' presente un solo fondo.
- Gli utenti Free vedono la funzionalita', ma il pulsante resta bloccato perche' la selezione fondo non e' disponibile nel piano Free.

## Comportamento utente - confronto fondi
- Il blocco "Esporta confronto in PDF" e' visibile nella sezione Confronta Fondi.
- Il pulsante resta disabilitato finche' non viene selezionato almeno un fondo.
- Il report include pill dei fondi selezionati, card riepilogative, badge per miglior rendimento/costi minori, grafico performance e grafico costi.
- Con 2-3 fondi il report e' comparativo; con un solo fondo diventa un riepilogo stampabile del fondo selezionato.

## Design tecnico
- Nessun endpoint backend e nessuna nuova dipendenza PDF.
- L'export usa `window.print()` e viste React stampabili nascoste dalla UI interattiva.
- Il modello dati del report e' costruito da `buildSimulationReportModel`, con tipi espliciti in `app/frontend/types.ts`.
- Il report confronto fondi usa `FundComparisonPdfReport` e riusa `PerformanceChart`/`CostChart`.
- I report forzano resa chiara su sfondo bianco, nascondono la chrome applicativa in stampa e mantengono sezioni/grafici con page break controllati.
- Tutti i calcoli restano client-side; i dati di simulazione non vengono salvati o trasmessi.

## Test e QA
Comandi eseguiti:
- `cd app/frontend && pnpm build`: OK.
- `cd app/frontend && pnpm exec tsc --noEmit`: KO per errori TypeScript preesistenti in `components/animations/*`, tipi `recharts`, `ImportMeta.env`, hook feedback e `data/funds copy.ts`.

QA manuale consigliato prima del rilascio:
- Desktop e mobile: pulsante visibile e disabilitato senza fondo.
- Modalita' singola: selezione fondo abilita export e il PDF contiene un solo fondo.
- Modalita' confronto: export con 2-3 fondi e grafici leggibili.
- Utente Free: export visibile ma bloccato con microcopy coerente.
- Chrome/Safari: stampa/salva PDF con grafici, KPI e disclaimer visibili.
- Confronto Fondi: export con 1, 2 e 3 fondi; verifica badge miglior rendimento/costi minori e grafici leggibili.

## Rischi e rollback
- Rischio principale: i grafici Recharts possono dipendere dal layout del browser durante la stampa; verificare sempre preview PDF su browser target.
- Rollback: rimuovere `SimulationPdfReport`, `FundComparisonPdfReport`, `buildSimulationReportModel`, i blocchi export in `SimulatorPage`/`VisualComparison` e le regole print in `index.css`, poi redeploy frontend.
