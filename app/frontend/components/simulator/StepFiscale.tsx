import React, { useState, useMemo } from 'react';
import type { MontanteSeriesPoint } from '../../types';
import {
  calcolaMontante,
  calcolaMontanteTFR,
  calcolaRisparmioFiscaleAnnuo,
  formatCurrency,
  formatPercentage,
} from '../../utils/simulatorCalc';
import { SCAGLIONI_IRPEF } from '../../constants';
import MontanteChart from './MontanteChart';

interface StepFiscaleProps {
  montanteIniziale: number;
  contributoAnnuo: number;
  orizzonteAnni: number;
  tassoRendimento: number;
  theme: string;
  onValuesChange?: (values: { ral: number }) => void;
}

const StepFiscale: React.FC<StepFiscaleProps> = ({
  montanteIniziale,
  contributoAnnuo,
  orizzonteAnni,
  tassoRendimento,
  theme,
  onValuesChange,
}) => {
  const [ral, setRal] = useState(30000);

  // Calculate tax savings
  const { risparmioAnnuo, aliquotaMarginale } = useMemo(
    () => calcolaRisparmioFiscaleAnnuo(contributoAnnuo, ral),
    [contributoAnnuo, ral]
  );

  const risparmioTotale = risparmioAnnuo * orizzonteAnni;

  // Calculate chart data
  const chartData = useMemo((): MontanteSeriesPoint[] => {
    const serieSenzaFiscale = calcolaMontante(montanteIniziale, contributoAnnuo, tassoRendimento, orizzonteAnni);
    const contributoEffettivo = contributoAnnuo + risparmioAnnuo;
    const serieConFiscale = calcolaMontante(montanteIniziale, contributoEffettivo, tassoRendimento, orizzonteAnni);
    const serieTFR = calcolaMontanteTFR(montanteIniziale, contributoAnnuo, orizzonteAnni);

    return Array.from({ length: orizzonteAnni + 1 }, (_, anno) => ({
      anno,
      montanteSenzaFiscale: serieSenzaFiscale[anno],
      montanteConFiscale: serieConFiscale[anno],
      montanteTFR: serieTFR[anno],
    }));
  }, [montanteIniziale, contributoAnnuo, orizzonteAnni, tassoRendimento, risparmioAnnuo]);

  const montanteSenzaFiscale = chartData[orizzonteAnni]?.montanteSenzaFiscale || 0;
  const montanteConFiscale = chartData[orizzonteAnni]?.montanteConFiscale || 0;
  const differenzaMontante = montanteConFiscale - montanteSenzaFiscale;
  const differenzaPercentuale = montanteSenzaFiscale > 0 ? (differenzaMontante / montanteSenzaFiscale) * 100 : 0;

  // Notify parent
  React.useEffect(() => {
    onValuesChange?.({ ral });
  }, [ral, onValuesChange]);

  const scaglioneCorrente = SCAGLIONI_IRPEF.find((s) => ral >= s.min && ral <= s.max);

  return (
    <div className="space-y-6">
      {/* Step header with problem→solution */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Step 2: Risparmio fiscale IRPEF
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Scopri quanto recuperi in tasse ogni anno grazie alla deducibilità dei contributi
            </p>
          </div>
        </div>

        {/* What you'll discover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4">
            <div className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0">❓</span>
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-1">La domanda</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  "I contributi al fondo pensione riducono le tasse che pago ogni anno. <strong>Di quanto?</strong>"
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-4">
            <div className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0">💰</span>
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100 mb-1">Il beneficio</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Vedi il <strong>risparmio annuo</strong>, il <strong>totale recuperato</strong> e l'impatto sul montante se reinvesti il risparmio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary of Step 1 parameters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Montante iniziale</p>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(montanteIniziale)}</p>
        </div>
        <div className="rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Contributo annuo</p>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(contributoAnnuo)}</p>
        </div>
        <div className="rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Orizzonte</p>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{orizzonteAnni} {orizzonteAnni === 1 ? 'anno' : 'anni'}</p>
        </div>
      </div>

      {/* Info banner - 3 columns layout */}
      <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 p-4 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Column 1: Main Info */}
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 p-1.5 rounded-lg bg-emerald-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100 mb-0.5">💰 Deducibilità fiscale</p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-200 leading-snug">
                Fino a <strong>€5.164,57/anno</strong> (D.Lgs. 252/2005)
              </p>
            </div>
          </div>

          {/* Column 2: Your Case */}
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 p-1.5 rounded-lg bg-emerald-600 text-white">
              <span className="text-sm font-bold">📊</span>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100 mb-0.5">Nel tuo caso</p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-200 leading-snug">
                Risparmi <strong className="text-emerald-700 dark:text-emerald-300">{formatCurrency(risparmioAnnuo)}/anno</strong> in tasse
              </p>
            </div>
          </div>

          {/* Column 3: Tip */}
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 p-1.5 rounded-lg bg-amber-500 text-white">
              <span className="text-sm">💡</span>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-0.5">Suggerimento</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-snug">
                Reinvesti il risparmio per <strong>crescita maggiore</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: RAL Input + brackets (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          {/* RAL Slider — single-row */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                RAL (Reddito Annuo Lordo)
                <span title="Il tuo reddito annuo lordo prima delle tasse." className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </label>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{formatCurrency(ral)}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15000"
                max="150000"
                step="1000"
                value={ral}
                onChange={(e) => setRal(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer dark:bg-slate-700 accent-emerald-600"
              />
              <input
                type="number"
                min="0"
                max="300000"
                step="1000"
                value={ral}
                onChange={(e) => setRal(Math.max(0, Number(e.target.value)))}
                className="w-20 px-2 py-1 text-xs text-right border border-slate-200 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tax Bracket Info (compact) */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Scaglioni IRPEF 2025
            </h4>
            <div className="space-y-1">
              {SCAGLIONI_IRPEF.map((scaglione, index) => {
                const isCurrent = scaglioneCorrente === scaglione;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between text-[11px] px-2 py-1.5 rounded transition-all ${
                      isCurrent
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 font-semibold text-emerald-900 dark:text-emerald-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span>{scaglione.label}</span>
                    {isCurrent && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Summary + Chart (3/5) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Compact metric cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/30 dark:border-emerald-800 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">Aliquota marginale</p>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{formatPercentage(aliquotaMarginale * 100, 0)}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/30 dark:border-emerald-800 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">Risparmio/anno</p>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(risparmioAnnuo)}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/30 dark:border-emerald-800 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">Risparmio totale ({orizzonteAnni}a)</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(risparmioTotale)}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Extra nel montante</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">+{formatCurrency(differenzaMontante)}</p>
              <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400">+{formatPercentage(differenzaPercentuale, 1)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-lg border border-slate-200 bg-white dark:bg-slate-800/60 dark:border-slate-700 p-3">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Confronto: con e senza reinvestimento del risparmio fiscale
            </h4>
            <MontanteChart data={chartData} theme={theme} showFiscale={true} showTFR={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepFiscale;
