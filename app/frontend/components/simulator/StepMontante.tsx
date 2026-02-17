import React, { useState, useMemo } from 'react';
import type { PensionFund, MontanteSeriesPoint } from '../../types';
import { getRendimentoProxy, getRendimentoProxyWithLabel, calcolaMontante, calcolaMontanteTFR, formatCurrency, formatPercentage } from '../../utils/simulatorCalc';
import MontanteChart from './MontanteChart';
import SimulatorDisclaimer from './SimulatorDisclaimer';

interface StepMontanteProps {
  selectedFunds: PensionFund[];
  theme: string;
  onValuesChange?: (values: {
    montanteIniziale: number;
    contributoAnnuo: number;
    orizzonteAnni: number;
    tassoRendimento: number;
  }) => void;
}

/* ── Compact single-row slider + input ─────────────────────────── */
const SliderInput: React.FC<{
  label: string;
  tooltip: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  accent?: string;
  inputSuffix?: string;
}> = ({ label, tooltip, value, onChange, min, max, step: stepVal, format, accent = 'accent-blue-600', inputSuffix }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        {label}
        <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </label>
      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{format(value)}</span>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={stepVal}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer dark:bg-slate-700 ${accent}`}
      />
      <div className="flex items-center gap-0.5">
        <input
          type="number"
          min={min}
          max={max * 5}
          step={stepVal}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="w-20 px-2 py-1 text-xs text-right border border-slate-200 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        />
        {inputSuffix && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-0.5">{inputSuffix}</span>}
      </div>
    </div>
  </div>
);

const StepMontante: React.FC<StepMontanteProps> = ({ selectedFunds, theme, onValuesChange }) => {
  const [montanteIniziale, setMontanteIniziale] = useState(5000);
  const [contributoAnnuo, setContributoAnnuo] = useState(2000);
  const [orizzonteAnni, setOrizzonteAnni] = useState(20);

  // Get rendimento proxy info for each fund
  const fundProxyInfos = useMemo(() => {
    return selectedFunds
      .map(fund => ({ fund, info: getRendimentoProxyWithLabel(fund) }))
      .filter((entry): entry is { fund: PensionFund; info: { rate: number; label: string } } => entry.info !== null);
  }, [selectedFunds]);

  // Get average return rate from selected funds
  const tassoRendimentoLordo = useMemo(() => {
    if (fundProxyInfos.length === 0) return 5.0;
    return fundProxyInfos.reduce((sum, e) => sum + e.info.rate, 0) / fundProxyInfos.length;
  }, [fundProxyInfos]);

  // Get average ISC (use isc10a as best proxy for long-term cost, fallback to isc5a)
  const iscMedio = useMemo(() => {
    if (selectedFunds.length === 0) return null;
    const costs = selectedFunds
      .map(f => f.isc.isc10a ?? f.isc.isc5a ?? f.costoAnnuo)
      .filter((c): c is number => c !== null);
    if (costs.length === 0) return null;
    return costs.reduce((s, c) => s + c, 0) / costs.length;
  }, [selectedFunds]);

  // Net return = gross return - ISC
  const tassoRendimento = iscMedio !== null ? tassoRendimentoLordo - iscMedio : tassoRendimentoLordo;

  // Calculate series data
  const chartData = useMemo((): MontanteSeriesPoint[] => {
    const serieSenzaFiscale = calcolaMontante(montanteIniziale, contributoAnnuo, tassoRendimento, orizzonteAnni);
    const serieTFR = calcolaMontanteTFR(montanteIniziale, contributoAnnuo, orizzonteAnni);

    return Array.from({ length: orizzonteAnni + 1 }, (_, anno) => ({
      anno,
      montanteSenzaFiscale: serieSenzaFiscale[anno],
      montanteConFiscale: serieSenzaFiscale[anno],
      montanteTFR: serieTFR[anno],
    }));
  }, [montanteIniziale, contributoAnnuo, tassoRendimento, orizzonteAnni]);

  // Summary metrics
  const totaleVersato = montanteIniziale + contributoAnnuo * orizzonteAnni;
  const montanteFinale = chartData[orizzonteAnni]?.montanteSenzaFiscale || 0;
  const rendimentoTotale = montanteFinale - totaleVersato;
  const rendimentoPercentuale = totaleVersato > 0 ? (montanteFinale / totaleVersato - 1) * 100 : 0;

  // Notify parent
  React.useEffect(() => {
    onValuesChange?.({ montanteIniziale, contributoAnnuo, orizzonteAnni, tassoRendimento });
  }, [montanteIniziale, contributoAnnuo, orizzonteAnni, tassoRendimento, onValuesChange]);

  return (
    <div className="space-y-5">
      {/* Step header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Rivalutazione del montante
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Inserisci i tuoi dati per simulare la crescita del capitale nel tempo grazie all'interesse composto.
        </p>
      </div>

      {/* What is the montante — educational note */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/60 dark:border-sky-800 dark:bg-sky-950/20 p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="text-lg leading-none mt-0.5">📘</span>
          <div>
            <p className="text-xs font-bold text-sky-900 dark:text-sky-100 mb-1">Cos'è il montante?</p>
            <p className="text-xs text-sky-800 dark:text-sky-200 leading-relaxed">
              Il <strong>montante</strong> è la somma totale accumulata nel tuo fondo pensione: comprende
              i contributi versati (tuoi + datore di lavoro + TFR) e i rendimenti generati dagli investimenti nel tempo.
              Più lungo è l'orizzonte temporale, più l'<strong>interesse composto</strong> amplifica la crescita del capitale.
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Inputs (2/5) */}
        <div className="lg:col-span-2 space-y-3">
          <SliderInput
            label="Montante iniziale"
            tooltip="L'importo già accumulato nel fondo o quello che intendi versare come primo conferimento."
            value={montanteIniziale}
            onChange={setMontanteIniziale}
            min={0}
            max={100000}
            step={500}
            format={(v) => formatCurrency(v)}
            inputSuffix="€"
          />
          <SliderInput
            label="Contributo annuo"
            tooltip="L'importo che verserai ogni anno (tuo contributo + datore di lavoro + TFR)."
            value={contributoAnnuo}
            onChange={setContributoAnnuo}
            min={0}
            max={20000}
            step={100}
            format={(v) => formatCurrency(v)}
            inputSuffix="€"
          />
          <SliderInput
            label="Orizzonte temporale"
            tooltip="Quanti anni mancano alla tua pensione."
            value={orizzonteAnni}
            onChange={setOrizzonteAnni}
            min={1}
            max={45}
            step={1}
            format={(v) => `${v} ${v === 1 ? 'anno' : 'anni'}`}
            inputSuffix="anni"
          />

          {/* Tasso utilizzato — detailed info box */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tasso netto utilizzato</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatPercentage(tassoRendimento, 2)}</span>
            </div>

            {fundProxyInfos.length > 0 ? (
              <div className="space-y-1.5">
                {fundProxyInfos.map(({ fund, info }) => (
                  <div key={fund.id} className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{fund.pip}</span>
                    {fund.societa && <span className="text-slate-400 dark:text-slate-500"> ({fund.societa})</span>}
                    {' — '}rendimento <strong>{info.label}</strong>: {formatPercentage(info.rate, 2)}
                  </div>
                ))}
                {iscMedio !== null && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      ISC (Indice Sintetico Costi)
                      <span title="Costo annuo che riduce il rendimento lordo. Usiamo l'ISC a 10 anni come riferimento." className="cursor-help">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">-{formatPercentage(iscMedio, 2)}</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                  Tasso = rendimento lordo ({formatPercentage(tassoRendimentoLordo, 2)}){iscMedio !== null ? ` − ISC (${formatPercentage(iscMedio, 2)})` : ''} = <strong>{formatPercentage(tassoRendimento, 2)}</strong> netto
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Valore predefinito del 5%. Seleziona un fondo pensione nella sezione sopra per usare il suo rendimento storico e l'ISC reale.
              </p>
            )}
          </div>
        </div>

        {/* Right: Summary cards + Chart (3/5) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Compact metric cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 dark:bg-slate-800/40 dark:border-slate-700 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Versato</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totaleVersato)}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/30 dark:border-emerald-800 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">Rivalutato</p>
              <p className="text-base font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(montanteFinale)}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Rendimento</p>
              <p className="text-base font-bold text-blue-900 dark:text-blue-100">+{formatPercentage(rendimentoPercentuale, 1)}</p>
              <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400">{formatCurrency(rendimentoTotale)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-lg border border-slate-200 bg-white dark:bg-slate-800/60 dark:border-slate-700 p-3">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Crescita del capitale nel tempo</h4>
            <MontanteChart data={chartData} theme={theme} showFiscale={false} showTFR={true} />
          </div>
        </div>
      </div>

      {/* Educational note */}
      <div className="rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 p-3">
        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
          <strong>💡 L'interesse composto è il tuo alleato.</strong> Anche piccoli versamenti costanti,
          lasciati crescere nel tempo, producono risultati significativi. Prima inizi, maggiore sarà l'effetto
          della rivalutazione sul tuo capitale.
        </p>
      </div>

      <SimulatorDisclaimer variant="compact" />
    </div>
  );
};

export default StepMontante;
