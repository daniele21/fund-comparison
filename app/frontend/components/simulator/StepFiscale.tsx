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

  const { risparmioAnnuo, aliquotaMarginale } = useMemo(
    () => calcolaRisparmioFiscaleAnnuo(contributoAnnuo, ral),
    [contributoAnnuo, ral]
  );

  const risparmioTotale = risparmioAnnuo * orizzonteAnni;

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

  React.useEffect(() => {
    onValuesChange?.({ ral });
  }, [ral, onValuesChange]);

  const scaglioneCorrente = SCAGLIONI_IRPEF.find((s) => ral >= s.min && ral <= s.max);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Step header */}
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm sm:text-base font-bold">2</span>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Risparmio sulle tasse (IRPEF)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xl">
            I contributi che versi nel fondo pensione possono essere <strong className="text-slate-700 dark:text-slate-300">dedotti dal tuo reddito</strong> fino
            a <strong className="text-slate-700 dark:text-slate-300">€5.164,57 all'anno</strong>. Questo significa che paghi meno IRPEF: è un risparmio reale che ricevi
            ogni anno in dichiarazione dei redditi. Se reinvesti questo risparmio nel fondo, il tuo capitale cresce ancora più velocemente.
          </p>
        </div>
      </div>

      {/* ── Recap Step 1 ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Dal passaggio 1:</span>
        <span className="text-xs text-slate-700 dark:text-slate-300">
          Capitale iniziale <strong>{formatCurrency(montanteIniziale)}</strong>
        </span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <span className="text-xs text-slate-700 dark:text-slate-300">
          Versamento annuo <strong>{formatCurrency(contributoAnnuo)}</strong>
        </span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <span className="text-xs text-slate-700 dark:text-slate-300">
          Anni alla pensione <strong>{orizzonteAnni}</strong>
        </span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <span className="text-xs text-slate-700 dark:text-slate-300">
          Rendimento <strong>{formatPercentage(tassoRendimento, 2)}</strong>
        </span>
      </div>

      {/* ── Parametri ── */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Il tuo reddito</h4>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">Inserisci il tuo stipendio lordo annuo per calcolare la tua aliquota fiscale e il risparmio</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          {/* RAL Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Il tuo stipendio lordo annuo (RAL)
                <span title="Il Reddito Annuo Lordo è lo stipendio prima delle tasse. Lo trovi nella tua busta paga o nel CUD." className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </label>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{formatCurrency(ral)}</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="15000"
                max="150000"
                step="1000"
                value={ral}
                onChange={(e) => setRal(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
              />
              <input
                type="number"
                min="0"
                max="300000"
                step="1000"
                value={ral}
                onChange={(e) => setRal(Math.max(0, Number(e.target.value)))}
                className="w-20 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tax Bracket Info */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">In quale fascia fiscale rientri?</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Lo Stato applica aliquote crescenti al tuo reddito. Più guadagni, più alta è l'aliquota — e più risparmi deducendo.</p>
            </div>
            <div className="space-y-0.5">
              {SCAGLIONI_IRPEF.map((scaglione, index) => {
                const isCurrent = scaglioneCorrente === scaglione;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md transition-all ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 font-semibold text-blue-900 dark:text-blue-100'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <span>{scaglione.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                        TUO
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Risultati ── */}
      <div className="space-y-5 sm:space-y-6">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ecco quanto risparmi</h4>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">Questi sono i soldi che lo Stato ti restituisce perché hai versato nel fondo pensione</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 text-center">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">La tua aliquota IRPEF</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{formatPercentage(aliquotaMarginale * 100, 0)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">fascia marginale</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 text-center">
            <p className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Risparmi ogni anno</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(risparmioAnnuo)}</p>
            <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1.5">in meno di IRPEF</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 text-center">
            <p className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Risparmio totale</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(risparmioTotale)}</p>
            <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1.5">in {orizzonteAnni} anni di versamenti</p>
          </div>
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-5 text-center">
            <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Capitale extra se reinvesti</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">+{formatCurrency(differenzaMontante)}</p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">+{formatPercentage(differenzaPercentuale, 1)} in più</p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 sm:p-6">
          <div className="mb-4">
            <h4 className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
              Confronto: con e senza reinvestimento del risparmio fiscale
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">
              La linea superiore mostra cosa succede se ogni anno reinvesti nel fondo anche il risparmio IRPEF ottenuto
            </p>
          </div>
          <MontanteChart data={chartData} theme={theme} showFiscale={true} showTFR={false} />
        </div>
      </div>
    </div>
  );
};

export default StepFiscale;
