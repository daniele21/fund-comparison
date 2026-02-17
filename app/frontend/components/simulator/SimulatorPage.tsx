import React, { useState, useMemo, useCallback } from 'react';
import type { PensionFund } from '../../types';
import { useGuidedComparator } from '../guided/GuidedComparatorContext';
import { pensionFundsData } from '../../data/funds';
import { getRendimentoProxyWithLabel, formatPercentage } from '../../utils/simulatorCalc';
import { formatFundLabel } from '../../utils/fundLabel';
import SimulatorPrivacyBanner from './SimulatorPrivacyBanner';
import StepMontante from './StepMontante';
import StepFiscale from './StepFiscale';
import StepImpostaPensione from './StepImpostaPensione';
import SimulatorDisclaimer from './SimulatorDisclaimer';

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
  icon: React.ReactNode;
}[] = [
  {
    id: 'montante',
    label: 'Rivalutazione',
    shortLabel: 'Montante',
    description: 'Simula la crescita del tuo capitale con l\'interesse composto.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'fiscale',
    label: 'Risparmio Fiscale',
    shortLabel: 'IRPEF',
    description: 'Calcola quanto risparmi in tasse ogni anno grazie alla deducibilità.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'imposta',
    label: 'Imposta Pensione',
    shortLabel: 'Tassazione',
    description: 'Scopri l\'aliquota finale e il tuo montante netto alla pensione.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
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
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Fondo di riferimento
      </label>

      {selectedFund ? (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40 px-3 py-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
              {selectedFund.pip} — {selectedFund.linea}
            </p>
            {selectedFund.societa && (
              <p className="text-[11px] text-blue-600 dark:text-blue-400 truncate">{selectedFund.societa}</p>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center rounded bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                {selectedFund.type}
              </span>
              {proxyInfo && (
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Rend. {proxyInfo.label}: <strong>{formatPercentage(proxyInfo.rate, 2)}</strong>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => { onClear(); setQuery(''); }}
            className="flex-shrink-0 p-1 rounded-md text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
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
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder:text-slate-400"
            />
          </div>

          {open && results.length > 0 && (
            <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
              {results.map((fund) => {
                const info = getRendimentoProxyWithLabel(fund);
                return (
                  <button
                    key={fund.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { onSelect(fund); setOpen(false); setQuery(''); }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {fund.pip} — {fund.linea}
                    </p>
                    {fund.societa && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{fund.societa}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
            <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-4 text-center text-sm text-slate-500">
              Nessun fondo trovato per &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {selectedFund
          ? 'Il rendimento storico di questo fondo verrà usato come tasso di rivalutazione nella simulazione.'
          : 'Cerca e seleziona il tuo fondo pensione. Useremo la sua performance decennale (o la migliore disponibile) come tasso di rendimento.'}
      </p>
    </div>
  );
};

/* ── Main Simulator Page ────────────────────────────────────────── */
const SimulatorPage: React.FC<SimulatorPageProps> = ({ theme }) => {
  const [activeStep, setActiveStep] = useState<SimulatorStep>('montante');
  const { selectedFundIds } = useGuidedComparator();

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
    <div className="space-y-5">
      {/* ── How it works intro ─────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-800/80 dark:border-slate-700 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Come funziona il simulatore
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed max-w-3xl">
              In <strong>3 semplici passaggi</strong> scopri quanto potrebbe valere il tuo investimento previdenziale.
              Ogni step aggiunge un livello di dettaglio: dalla crescita del capitale, al risparmio fiscale,
              fino alla tassazione finale alla pensione.
            </p>
          </div>
        </div>

        {/* Step overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-start gap-3 rounded-xl p-3.5 text-left transition-all duration-150 border ${
                step.id === activeStep
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/80'
              }`}
            >
              <span className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold mt-0.5 ${
                step.id === activeStep ? 'bg-blue-600' : idx < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
              }`}>
                {idx < currentStepIndex ? '✓' : idx + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{step.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{step.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Fund Selector + Privacy (compact row) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800/80 dark:border-slate-700 p-4 shadow-sm">
          {contextFunds.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Fondi selezionati dal confronto
              </label>
              <div className="space-y-1.5">
                {contextFunds.map((fund) => {
                  const info = getRendimentoProxyWithLabel(fund);
                  return (
                    <div
                      key={fund.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 px-3 py-2"
                    >
                      <span className="text-xs font-medium text-blue-900 dark:text-blue-100 truncate">{formatFundLabel(fund)}</span>
                      {info && (
                        <span className="flex-shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {formatPercentage(info.rate, 2)}
                          <span className="text-[10px] font-normal ml-0.5 opacity-70">({info.label})</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <FundSelector
              selectedFund={manualFund}
              onSelect={setManualFund}
              onClear={() => setManualFund(null)}
            />
          )}
        </div>

        <SimulatorPrivacyBanner />
      </div>

      {/* ── Step Navigation (compact tabs) ─────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5">
        {STEPS.map((step, index) => {
          const isActive = step.id === activeStep;
          const isCompleted = index < currentStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                  : isCompleted
                  ? 'text-emerald-700 dark:text-emerald-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 text-[10px] sm:text-xs font-bold ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-300 dark:bg-slate-600 text-white'
              }`}>
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ── Step Content ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white/95 dark:bg-slate-900/80 dark:border-slate-800 p-4 sm:p-5 md:p-6 shadow-sm">
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
              // annoPrimaAdesione is managed internally by StepImpostaPensione
            }}
          />
        )}
      </div>

      {/* ── Navigation Buttons ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentStepIndex === 0
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Indietro
        </button>

        {/* Step indicator dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === currentStepIndex
                  ? 'bg-blue-600 w-6'
                  : index < currentStepIndex
                  ? 'bg-emerald-500 w-2'
                  : 'bg-slate-300 dark:bg-slate-600 w-2'
              }`}
              title={step.label}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentStepIndex === STEPS.length - 1}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentStepIndex === STEPS.length - 1
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
          }`}
        >
          Avanti
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <SimulatorDisclaimer variant="default" />
    </div>
  );
};

export default SimulatorPage;
