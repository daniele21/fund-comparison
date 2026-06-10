import { TourStep } from '../components/common/GuidedTour';

/**
 * Tour Guidato: Simulatore Previdenziale
 *
 * Layout DOM:
 *   1. body (intro card "Come funziona?")
 *   2. simulator-tabs (stepper orizzontale a 3 passaggi)
 *   3. fund-selector (ricerca fondo + toggle Singola/Confronto)
 *   4. simulator-inputs (slider: Capitale, Contributo, RAL, Anni)
 *   5. simulator-chart (risultati + grafico)
 *   6. body (conclusion)
 */
export const simulatorTourSteps: TourStep[] = [
  {
    target: 'body',
    title: '🧮 Benvenuto nel Simulatore!',
    content: (
      <div>
        <p className="mb-3">
          Questo strumento guida l&apos;analisi in <strong>3 passaggi</strong>: montante stimato,
          risparmio fiscale e netto al pensionamento del cliente.
        </p>
        <p className="text-xs text-slate-500">
          ⏱️ Il tour dura circa 2 minuti
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="simulator-tabs"]',
    title: '🔢 I 3 passaggi della simulazione',
    content: (
      <div>
        <p className="mb-2">
          Naviga tra i passaggi usando queste schede:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">1.</span>
            <span><strong>Crescita del Capitale:</strong> Quanto accumuli nel tempo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">2.</span>
            <span><strong>Risparmio sulle Tasse:</strong> Quanto risparmi sull'IRPEF ogni anno</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">3.</span>
            <span><strong>Netto alla Pensione:</strong> L'importo netto stimato</span>
          </li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="fund-selector"]',
    title: '🎯 Seleziona un fondo (opzionale)',
    content: (
      <div>
        <p className="mb-2">
          Cerca il fondo pensione del cliente per nome: la simulazione userà i suoi <strong>rendimenti storici reali</strong>.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Se non ne selezioni uno, verrà usato un tasso predefinito del 5%.
        </p>
        <p className="text-xs bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
          💡 <strong>Tip:</strong> Con il piano Full Access puoi anche attivare la modalità <strong>Confronto</strong> per
          simulare fino a 3 fondi fianco a fianco!
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="simulator-inputs"]',
    title: '⚙️ Personalizza i parametri',
    content: (
      <div>
        <p className="mb-2">
          Usa gli slider o digita un valore per impostare:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Capitale già accumulato</strong> nel fondo</li>
          <li><strong>Contributo volontario annuo</strong> che verserai</li>
          <li><strong>RAL</strong> (per calcolare il TFR del datore)</li>
          <li><strong>Anni alla pensione</strong></li>
        </ul>
        <p className="mt-3 text-xs bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
          💡 <strong>Tip:</strong> Se versi almeno €5.164/anno risparmi il massimo in tasse!
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="simulator-chart"]',
    title: '📈 Risultati e grafico',
    content: (
      <div>
        <p className="mb-2">
          Qui trovi i risultati della simulazione che si aggiornano in tempo reale:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <li>Capitale totale accumulato</li>
          <li>Guadagno dai rendimenti</li>
          <li>Grafico con proiezione fondo vs TFR in azienda</li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          Puoi mostrare/nascondere gli importi versati con il pulsante sopra il grafico.
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: 'body',
    title: '✅ Tutto pronto!',
    content: (
      <div>
        <p className="mb-3">
          Ora sai come usare il simulatore. Ricorda:
        </p>
        <ul className="space-y-2 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <li>✓ Più versi volontariamente, più risparmi in tasse</li>
          <li>✓ Il TFR del datore viene calcolato automaticamente dalla RAL</li>
          <li>✓ Il tempo è il tuo migliore alleato: prima inizi, più accumuli</li>
        </ul>
        <p className="mt-3 text-xs text-center text-slate-500">
          Puoi rivedere questo tour in qualsiasi momento cliccando su "Tour Guidato"
        </p>
      </div>
    ),
    placement: 'center',
  },
];


/**
 * Tour Guidato: Confronta Fondi
 *
 * Ordine step allineato al layout DOM:
 *   1. body (intro)
 *   2. visual-comparison  ← primo nel DOM
 *   3. filters
 *   4. fund-table
 *   5. body (conclusion)
 */
export const compareFundsTourSteps: TourStep[] = [
  {
    target: 'body',
    title: '🔍 Benvenuto nel Confronto Fondi!',
    content: (
      <div>
        <p className="mb-3">
          Qui puoi <strong>selezionare fino a 3 fondi pensione</strong> e confrontarli visivamente
          su rendimenti storici e costi.
        </p>
        <p className="text-xs text-slate-500">
          ⏱️ Il tour dura circa 90 secondi
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="visual-comparison"]',
    title: '📊 Grafici di confronto',
    content: (
      <div>
        <p className="mb-2">
          Questa sezione mostra i grafici dei fondi che hai selezionato, con andamento e costi <strong>sempre aggiornati</strong>.
        </p>
        <ul className="space-y-1 text-sm">
          <li>📈 <strong>Performance:</strong> Rendimenti a confronto su diversi orizzonti</li>
          <li>💰 <strong>Costi:</strong> ISC annuo di ciascun fondo</li>
        </ul>
        <p className="mt-3 text-xs bg-violet-50 dark:bg-violet-900/20 p-2 rounded">
          ⚡ Da qui puoi anche lanciare il <strong>Simulatore</strong> con i fondi selezionati per proiettare il capitale futuro.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="filters"]',
    title: '🎚️ Filtra i fondi',
    content: (
      <div>
        <p className="mb-2">
          Restringi la ricerca usando i filtri disponibili:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Categoria:</strong> Livello di rischio (garantito, obbligazionario, bilanciato, azionario)</li>
          <li><strong>Tipo:</strong> FPN, FPA o PIP</li>
          <li><strong>Ricerca:</strong> Cerca per nome fondo o società</li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="fund-table"]',
    title: '📋 Seleziona i fondi da confrontare',
    content: (
      <div>
        <p className="mb-2">
          Spunta i checkbox per selezionare fino a 3 fondi. La tabella mostra:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <li>Rendimento a 1, 3, 5 e 10 anni</li>
          <li>ISC (costo annuo)</li>
          <li>Categoria e tipo fondo</li>
        </ul>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          💡 <strong>Tip:</strong> Ordina per colonna per trovare rapidamente i fondi migliori!
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: 'body',
    title: '✅ Ottimo lavoro!',
    content: (
      <div>
        <p className="mb-3">
          Ora sai come confrontare i fondi. Alcuni consigli:
        </p>
        <ul className="space-y-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <li>✓ Confronta rendimenti su almeno 5-10 anni</li>
          <li>✓ Non guardare solo la performance: considera anche i costi</li>
          <li>✓ Dopo il confronto, usa il Simulatore per proiettare il capitale futuro</li>
        </ul>
      </div>
    ),
    placement: 'center',
  },
];


/**
 * Helper per determinare quale tour mostrare
 */
export const getTourStepsForSection = (section: string): TourStep[] | null => {
  const tours: Record<string, TourStep[]> = {
    simulator: simulatorTourSteps,
    'choose-fund': compareFundsTourSteps,
  };

  return tours[section] || null;
};
