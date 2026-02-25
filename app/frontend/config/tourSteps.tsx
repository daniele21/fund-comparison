import { TourStep } from '../components/common/GuidedTour';

/**
 * Tour Guidato: Simulatore Previdenziale
 */
export const simulatorTourSteps: TourStep[] = [
  {
    target: 'body',
    title: '🧮 Benvenuto nel Simulatore!',
    content: (
      <div>
        <p className="mb-3">
          Questo strumento ti permette di calcolare <strong>quanto potresti accumulare</strong> nel tuo fondo pensione
          e <strong>quanto risparmierai in tasse</strong> ogni anno.
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
    target: '[data-tour="simulator-inputs"]',
    title: '📝 Inserisci i tuoi dati',
    content: (
      <div>
        <p className="mb-2">
          Inizia inserendo:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Età attuale</strong> e età pensionamento</li>
          <li><strong>Contributo mensile</strong> che verserai</li>
          <li><strong>Reddito annuo</strong> per il calcolo fiscale</li>
        </ul>
        <p className="mt-3 text-xs bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
          💡 <strong>Tip:</strong> Se versi almeno €5.164/anno risparmi il massimo in tasse!
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="fund-selector"]',
    title: '🎯 Seleziona il tuo fondo (opzionale)',
    content: (
      <div>
        <p className="mb-2">
          Se hai già un fondo pensione, cercalo qui per usare i suoi <strong>rendimenti storici reali</strong>.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Se non lo selezioni, useremo un tasso di rendimento medio del 5% annuo.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="simulator-tabs"]',
    title: '📊 Esplora i risultati',
    content: (
      <div>
        <p className="mb-2">
          La simulazione ti mostra 3 aspetti fondamentali:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">1.</span>
            <span><strong>Crescita Capitale:</strong> Quanto accumuli nel tempo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">2.</span>
            <span><strong>Risparmio Fiscale:</strong> Quante tasse risparmi ogni anno</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">3.</span>
            <span><strong>Netto Pensione:</strong> Cosa riceverai davvero</span>
          </li>
        </ul>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="simulator-chart"]',
    title: '📈 Visualizza il tuo futuro',
    content: (
      <div>
        <p className="mb-2">
          Il grafico mostra l'evoluzione del tuo capitale nel tempo, includendo:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <li>I tuoi contributi versati</li>
          <li>I rendimenti accumulati</li>
          <li>Il montante finale</li>
        </ul>
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
          <li>✓ Più versi, più risparmi in tasse</li>
          <li>✓ Prima inizi, più accumuli</li>
          <li>✓ Il tempo è il tuo migliore alleato</li>
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
 */
export const compareFundsTourSteps: TourStep[] = [
  {
    target: 'body',
    title: '🔍 Benvenuto nel Confronto Fondi!',
    content: (
      <div>
        <p className="mb-3">
          Qui puoi <strong>confrontare fino a 5 fondi pensione</strong> per trovare quello più adatto a te, 
          analizzando rendimenti storici e costi.
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
    target: '[data-tour="filters"]',
    title: '🎚️ Filtra i fondi',
    content: (
      <div>
        <p className="mb-2">
          Restringi la ricerca usando i filtri:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Categoria:</strong> Scegli il livello di rischio</li>
          <li><strong>Tipo:</strong> FPN, FPA o PIP</li>
          <li><strong>Azienda:</strong> Cerca fondi disponibili per la tua azienda</li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="fund-table"]',
    title: '📋 Seleziona i fondi',
    content: (
      <div>
        <p className="mb-2">
          Clicca sui checkbox per selezionare i fondi da confrontare (max 5).
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          💡 <strong>Tip:</strong> Guarda le colonne di rendimento e costo per una valutazione rapida!
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="visual-comparison"]',
    title: '📊 Visualizza il confronto',
    content: (
      <div>
        <p className="mb-2">
          I grafici mostrano in modo chiaro:
        </p>
        <ul className="space-y-1 text-sm">
          <li>📈 <strong>Performance:</strong> Come sono andati nel tempo</li>
          <li>💰 <strong>Costi:</strong> Quanto paghi all'anno</li>
        </ul>
        <p className="mt-3 text-xs bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
          ⚠️ Ricorda: performance passate non garantiscono risultati futuri!
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: 'body',
    title: '✅ Ottimo lavoro!',
    content: (
      <div>
        <p className="mb-3">
          Ora sai come confrontare i fondi pensione. Pro tips:
        </p>
        <ul className="space-y-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <li>✓ Guarda i rendimenti su almeno 5-10 anni</li>
          <li>✓ Considera sia costi che performance</li>
          <li>✓ Scegli in base al tuo profilo di rischio</li>
        </ul>
      </div>
    ),
    placement: 'center',
  },
];


/**
 * Tour Guidato: Analizza Fondo
 */
export const analyzeFundTourSteps: TourStep[] = [
  {
    target: 'body',
    title: '🔎 Benvenuto nell\'Analisi Fondo!',
    content: (
      <div>
        <p className="mb-3">
          Hai già un fondo pensione? <strong>Scopri se sta performando bene</strong> e 
          confrontalo con le migliori alternative disponibili.
        </p>
        <p className="text-xs text-slate-500">
          ⏱️ Il tour dura circa 60 secondi
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="your-fund-search"]',
    title: '🎯 Trova il tuo fondo',
    content: (
      <div>
        <p className="mb-2">
          Cerca il tuo fondo attuale per nome. Il sistema analizzerà:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>I suoi rendimenti storici</li>
          <li>I costi annui</li>
          <li>La sua categoria di rischio</li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="alternatives"]',
    title: '💡 Scopri le alternative',
    content: (
      <div>
        <p className="mb-2">
          Il sistema ti suggerisce automaticamente fondi <strong>simili per categoria</strong> ma 
          con performance migliori.
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
          ✨ Potresti scoprire opportunità per guadagnare di più!
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: 'body',
    title: '✅ Perfetto!',
    content: (
      <div>
        <p className="mb-3">
          Usa questo strumento regolarmente per:
        </p>
        <ul className="space-y-2 text-sm bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <li>✓ Monitorare la performance del tuo fondo</li>
          <li>✓ Scoprire se esistono opzioni migliori</li>
          <li>✓ Valutare un cambio fondo</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500 text-center">
          💬 Ricorda: puoi cambiare fondo gratuitamente una volta all'anno!
        </p>
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
    'have-fund': analyzeFundTourSteps,
  };

  return tours[section] || null;
};
