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
    description: 'Imposta versamenti e orizzonte temporale. Vedi quanto accumulerai grazie all\'interesse composto.',
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
    description: 'Scopri quanto recuperi ogni anno in tasse. I versamenti sono deducibili fino a 5.164€.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'imposta',
    label: 'Tassazione Finale',
    shortLabel: 'Tassazione',
    description: 'Calcola l\'imposta sostitutiva (9-15%) e scopri quanto riceverai netto alla pensione.',
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
    <div className="space-y-5 sm:space-y-6">
      {/* ── Hero / Value Proposition ───────────────────────────── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5 sm:p-6 shadow-sm">
        <div className="max-w-4xl">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                Simulatore Previdenziale
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Scopri in <strong className="text-blue-600 dark:text-blue-400">3 passaggi</strong> come crescerà il tuo capitale, quanto risparmierai in tasse, e il montante netto alla pensione.
              </p>
            </div>
          </div>

          {/* Problem → Solution cards - more engaging */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Problem Card */}
            <div className="group relative overflow-hidden rounded-lg border-2 border-rose-200 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20 p-4 hover:shadow-md transition-all duration-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-rose-200/30 dark:bg-rose-800/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                    <span className="text-lg">❓</span>
                  </div>
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-100">Il problema</h3>
                </div>
                <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-200 leading-relaxed">
                  Non sai <strong>quanto accumulerai</strong>, quanto <strong>risparmierai in tasse</strong>, e l'<strong>impatto fiscale finale</strong>.
                </p>
              </div>
            </div>

            {/* Solution Card */}
            <div className="group relative overflow-hidden rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 p-4 hover:shadow-md transition-all duration-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">La soluzione</h3>
                </div>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  Calcoli <strong>passo per passo</strong>: formazione capitale, recupero IRPEF annuale, e tasse al pensionamento.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Banner - decorative */}
          <SimulatorPrivacyBanner />
        </div>
      </div>

      {/* ── How it works (3 steps overview) ────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800/80 dark:border-slate-700 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Come funziona? 3 passaggi semplici
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Ogni step aggiunge un livello di dettaglio al calcolo finale
            </p>
          </div>
        </div>

        {/* Step cards — larger, clearer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`group relative flex flex-col items-start rounded-xl p-4 sm:p-5 text-left transition-all duration-200 border-2 ${
                step.id === activeStep
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-700 shadow-lg scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Step number badge */}
              <span className={`absolute -top-2.5 -right-2.5 flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shadow-md ${
                step.id === activeStep ? 'bg-blue-600' : idx < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
              }`}>
                {idx < currentStepIndex ? '✓' : idx + 1}
              </span>

              <div className={`mb-3 p-2 rounded-lg transition-colors ${
                step.id === activeStep
                  ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {step.icon}
              </div>

              <h4 className={`text-sm sm:text-base font-bold mb-2 transition-colors ${
                step.id === activeStep
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-slate-800 dark:text-slate-200'
              }`}>
                {step.label}
              </h4>

              <p className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                step.id === activeStep
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {step.description}
              </p>

              {/* What you'll learn */}
              <div className={`mt-3 pt-3 border-t text-[11px] sm:text-xs transition-colors ${
                step.id === activeStep
                  ? 'border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500'
              }`}>
                {idx === 0 && '→ Capitale finale grazie all\'interesse composto'}
                {idx === 1 && '→ Risparmio fiscale annuo e totale'}
                {idx === 2 && '→ Montante netto dopo imposta sostitutiva'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Fund Selector (when no context funds) ────────────────────── */}
      {contextFunds.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800/80 dark:border-slate-700 p-5 sm:p-6 shadow-sm">
          <FundSelector
            selectedFund={manualFund}
            onSelect={setManualFund}
            onClear={() => setManualFund(null)}
          />
        </div>
      )}

      {/* ── Step Content (with better spacing) ─────────────────── */}
      <div className="relative">
        <div className="rounded-2xl border-2 border-slate-200 bg-white dark:bg-slate-900/80 dark:border-slate-800 p-5 sm:p-6 md:p-8 shadow-lg">
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

        {/* Floating Previous Arrow (left side) */}
        {currentStepIndex > 0 && (
          <button
            onClick={goPrev}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group"
            title="Torna allo step precedente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="sr-only">Indietro</span>
          </button>
        )}

        {/* Floating Next Arrow (right side) */}
        {currentStepIndex < STEPS.length - 1 && (
          <button
            onClick={goNext}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110 group"
            title="Vai al prossimo step"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="sr-only">Avanti</span>
          </button>
        )}
      </div>

      {/* ── Navigation Buttons (improved) ──────────────────────── */}
      <div className="flex items-center justify-center gap-4">
        {/* Step indicator dots (larger) */}
        <div className="flex items-center gap-2.5">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`h-2.5 rounded-full transition-all duration-200 ${
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
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <SimulatorDisclaimer variant="default" />
    </div>
  );
};

export default SimulatorPage;
