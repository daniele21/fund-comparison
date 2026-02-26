import React, { useState, useMemo, useCallback } from 'react';
import type { PensionFund } from '../../types';
import { useGuidedComparator } from '../guided/GuidedComparatorContext';
import { pensionFundsData } from '../../data/funds';
import { getRendimentoProxyWithLabel, formatPercentage } from '../../utils/simulatorCalc';
import { formatFundLabel } from '../../utils/fundLabel';
import StepMontante from './StepMontante';
import StepFiscale from './StepFiscale';
import StepImpostaPensione from './StepImpostaPensione';
import SimulatorDisclaimer from './SimulatorDisclaimer';
import SectionHeader from '../common/SectionHeader';
import GuidedTour, { useGuidedTour, FirstVisitBanner } from '../common/GuidedTour';
import { simulatorTourSteps } from '../../config/tourSteps';

type SimulatorStep = 'montante' | 'fiscale' | 'imposta';

interface SimulatorPageProps {
  theme: string;
}

/* ── Step metadata ──────────────────────────────────────────────── */
const STEPS: {
  id: SimulatorStep;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  { id: 'montante', label: 'Crescita del Capitale', shortLabel: 'Capitale', description: 'Quanto accumuli nel fondo pensione nel tempo' },
  { id: 'fiscale', label: 'Risparmio sulle Tasse', shortLabel: 'Tasse', description: 'Quanto risparmi ogni anno sull\'IRPEF' },
  { id: 'imposta', label: 'Netto alla Pensione', shortLabel: 'Netto', description: 'Quanto riceverai davvero al pensionamento' },
];

/* ── Fund search / selector ─────────────────────────────────────── */
const FundSelector: React.FC<{
  selectedFund: PensionFund | null;
  onSelect: (fund: PensionFund) => void;
  onClear: () => void;
}> = ({ selectedFund, onSelect, onClear }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return pensionFundsData
      .filter((f) => {
        const text = `${f.pip} ${f.linea} ${f.societa ?? ''}`.toLowerCase();
        return text.includes(q);
      })
      .slice(0, 12);
  }, [query]);

  const proxyInfo = selectedFund ? getRendimentoProxyWithLabel(selectedFund) : null;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Seleziona il tuo fondo pensione
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
        Cercalo per nome: useremo il suo rendimento storico per rendere la simulazione più accurata.
        Se non lo selezioni, verrà usato un tasso di rendimento predefinito del 5%.
      </p>

      {selectedFund ? (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {selectedFund.pip} — {selectedFund.linea}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {selectedFund.type}
              </span>
              {proxyInfo && (
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Rend. {proxyInfo.label}: <strong>{formatPercentage(proxyInfo.rate, 2)}</strong>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => { onClear(); setQuery(''); }}
            className="flex-shrink-0 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Rimuovi fondo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cerca il tuo fondo pensione…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder:text-slate-400"
            />
          </div>

          {open && results.length > 0 && (
            <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-lg">
              {results.map((fund) => {
                const info = getRendimentoProxyWithLabel(fund);
                return (
                  <button
                    key={fund.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { onSelect(fund); setOpen(false); setQuery(''); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {fund.pip} — {fund.linea}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {fund.type} · {fund.categoria}
                      </span>
                      {info && (
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                          Rend. {info.label}: {formatPercentage(info.rate, 2)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {open && query.length >= 2 && results.length === 0 && (
            <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-lg p-3 text-center text-sm text-slate-500">
              Nessun fondo trovato per &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        {selectedFund
          ? 'Il rendimento storico di questo fondo verrà utilizzato come tasso di rivalutazione nella simulazione.'
          : 'Opzionale — puoi procedere anche senza selezionare un fondo.'}
      </p>
    </div>
  );
};

/* ── Main Simulator Page ────────────────────────────────────────── */
const SimulatorPage: React.FC<SimulatorPageProps> = ({ theme }) => {
  const [activeStep, setActiveStep] = useState<SimulatorStep>('montante');
  const { selectedFundIds } = useGuidedComparator();
  
  // Tour guidato
  const { 
    isOpen: isTourOpen, 
    shouldShowBanner, 
    startTour, 
    closeTour, 
    dismissBanner,
    completeTour,
  } = useGuidedTour('simulator');

  // Fund from context or manual selection
  const contextFunds = useMemo(() => {
    return selectedFundIds
      .map((id) => pensionFundsData.find((f) => f.id === id))
      .filter((fund): fund is PensionFund => Boolean(fund));
  }, [selectedFundIds]);

  // Manual fund selection (when no context funds)
  const [manualFund, setManualFund] = useState<PensionFund | null>(null);

  const activeFunds = contextFunds.length > 0 ? contextFunds : manualFund ? [manualFund] : [];

  // Shared state across steps
  const [montanteIniziale, setMontanteIniziale] = useState(5000);
  const [contributoAnnuo, setContributoAnnuo] = useState(2000);
  const [orizzonteAnni, setOrizzonteAnni] = useState(20);
  const [tassoRendimento, setTassoRendimento] = useState(5.0);
  const [ral, setRal] = useState(30000);

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeStep);

  const goNext = useCallback(() => {
    const next = Math.min(STEPS.length - 1, currentStepIndex + 1);
    setActiveStep(STEPS[next].id);
  }, [currentStepIndex]);

  const goPrev = useCallback(() => {
    const prev = Math.max(0, currentStepIndex - 1);
    setActiveStep(STEPS[prev].id);
  }, [currentStepIndex]);

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Banner primo accesso */}
      {shouldShowBanner && (
        <FirstVisitBanner
          onStartTour={startTour}
          onDismiss={dismissBanner}
        />
      )}

      {/* Header unificato */}
      <SectionHeader
        eyebrow="Simulazione"
        title="Simulatore Previdenziale"
        description="Calcola la crescita del tuo investimento, il risparmio fiscale e scopri quanto potresti accumulare per la tua pensione."
        badge={{ text: "🌟 Nuovo", variant: "new" }}
        tourAction={{
          label: "Tour Guidato",
          onClick: startTour,
        }}
        stats={activeFunds.length > 0 ? [
          {
            label: "Fondo Selezionato",
            value: activeFunds[0].pip,
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ] : undefined}
      />

      {/* ── Contenuto originale (con data-tour attributes) ─────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/80 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Come funziona?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Questo simulatore ti guida in <strong className="text-blue-600 dark:text-blue-400">3 passaggi</strong> per
            capire quanto accumulerai nel tuo fondo pensione, quanto risparmierai di tasse ogni anno, e quanto riceverai
            effettivamente al momento della pensione.
          </p>
        </div>

        {/* Problema → Soluzione */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6">
          <div className="flex items-start gap-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 text-sm font-bold">?</span>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Perché serve?</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Senza un calcolo concreto, è difficile capire se stai versando abbastanza, quanto risparmierai in tasse
                e quale sarà il capitale disponibile a fine percorso.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 sm:p-5">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold">✓</span>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Cosa otterrai</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Una stima chiara di: quanto cresce il tuo capitale investito, quanto recuperi in dichiarazione dei redditi
                ogni anno, e l'importo netto che riceverai al pensionamento.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            <strong className="font-medium text-slate-600 dark:text-slate-300">Privacy garantita</strong> — tutti i calcoli avvengono nel tuo browser. Nessun dato viene salvato o trasmesso.
          </p>
        </div>
      </div>

      {/* ── Step Navigation (horizontal stepper) ─────────────── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4" data-tour="simulator-tabs">
        {STEPS.map((step, idx) => {
          const isActive = step.id === activeStep;
          const isCompleted = idx < currentStepIndex;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-start gap-3 rounded-2xl sm:rounded-3xl border p-4 sm:p-5 text-left transition-all duration-200 ${
                isActive
                  ? 'bg-white/90 dark:bg-slate-800 border-blue-300 dark:border-blue-700 shadow-md ring-1 ring-blue-200 dark:ring-blue-800'
                  : isCompleted
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:shadow-sm'
                  : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-white/90 dark:hover:bg-slate-800/60 hover:shadow-sm'
              }`}
            >
              <span className={`flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold mt-0.5 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
              }`}>
                {isCompleted ? '✓' : idx + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-tight ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : isCompleted
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </p>
                <p className={`hidden sm:block text-xs sm:text-sm mt-1 leading-snug ${
                  isActive
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Fund Selector (when no context funds) ────────────── */}
      {contextFunds.length === 0 && (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 dark:bg-slate-800/60 dark:border-slate-800 p-5 sm:p-6 shadow-sm" data-tour="fund-selector">
          <FundSelector
            selectedFund={manualFund}
            onSelect={setManualFund}
            onClear={() => setManualFund(null)}
          />
        </div>
      )}

      {/* ── Step Content ─────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 dark:bg-slate-900/80 dark:border-slate-800 p-5 sm:p-8 lg:p-10 shadow-sm" data-tour="simulator-chart">
        {activeStep === 'montante' && (
          <StepMontante
            selectedFunds={activeFunds}
            theme={theme}
            onValuesChange={(values) => {
              setMontanteIniziale(values.montanteIniziale);
              setContributoAnnuo(values.contributoAnnuo);
              setOrizzonteAnni(values.orizzonteAnni);
              setTassoRendimento(values.tassoRendimento);
            }}
          />
        )}

        {activeStep === 'fiscale' && (
          <StepFiscale
            montanteIniziale={montanteIniziale}
            contributoAnnuo={contributoAnnuo}
            orizzonteAnni={orizzonteAnni}
            tassoRendimento={tassoRendimento}
            theme={theme}
            onValuesChange={(values) => {
              setRal(values.ral);
            }}
          />
        )}

        {activeStep === 'imposta' && (
          <StepImpostaPensione
            montanteIniziale={montanteIniziale}
            contributoAnnuo={contributoAnnuo}
            orizzonteAnni={orizzonteAnni}
            ral={ral}
            tassoRendimento={tassoRendimento}
            theme={theme}
            onValuesChange={(values) => {
              // annoPrimaAdesione is managed internally
            }}
          />
        )}
      </div>

      {/* ── Step Navigation Buttons ──────────────────────────── */}
      <div className="flex items-center justify-between py-2">
        <button
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            currentStepIndex === 0
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:shadow-sm'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Indietro
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentStepIndex
                  ? 'bg-blue-600 w-8'
                  : index < currentStepIndex
                  ? 'bg-emerald-500 w-2.5'
                  : 'bg-slate-300 dark:bg-slate-600 w-2.5'
              }`}
              title={step.label}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentStepIndex === STEPS.length - 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            currentStepIndex === STEPS.length - 1
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
          }`}
        >
          Avanti
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Disclaimer ─────────────────────────────────────── */}
      <SimulatorDisclaimer variant="default" />

      {/* ── Tour Guidato ───────────────────────────────────── */}
      <GuidedTour
        steps={simulatorTourSteps}
        isOpen={isTourOpen}
        onClose={closeTour}
        onComplete={completeTour}
        storageKey="simulator"
        showSkipButton={true}
      />
    </div>
  );
};

export default SimulatorPage;
