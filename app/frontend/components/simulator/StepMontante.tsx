import React, { useState, useMemo } from 'react';
import type { PensionFund, MontanteSeriesPoint } from '../../types';
import { getRendimentoProxy, getRendimentoProxyWithLabel, calcolaMontante, calcolaMontanteTFR, formatCurrency, formatPercentage } from '../../utils/simulatorCalc';
import MontanteChart from './MontanteChart';

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

/* ── Slider row ────────────────────────────────────────────────── */
const SliderInput: React.FC<{
  label: string;
  tooltip: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  inputSuffix?: string;
}> = ({ label, tooltip, value, onChange, min, max, step: stepVal, format, inputSuffix }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        {label}
        <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </label>
      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{format(value)}</span>
    </div>
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={min}
        max={max}
        step={stepVal}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
      />
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={min}
          max={max * 5}
          step={stepVal}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="w-20 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        />
        {inputSuffix && <span className="text-[11px] text-slate-400 dark:text-slate-500">{inputSuffix}</span>}
      </div>
    </div>
  </div>
);

const StepMontante: React.FC<StepMontanteProps> = ({ selectedFunds, theme, onValuesChange }) => {
  const [montanteIniziale, setMontanteIniziale] = useState(5000);
  const [contributoAnnuo, setContributoAnnuo] = useState(2000);
  const [orizzonteAnni, setOrizzonteAnni] = useState(20);

  const fundProxyInfos = useMemo(() => {
    return selectedFunds
      .map(fund => ({ fund, info: getRendimentoProxyWithLabel(fund) }))
      .filter((entry): entry is { fund: PensionFund; info: { rate: number; label: string } } => entry.info !== null);
  }, [selectedFunds]);

  const tassoRendimento = useMemo(() => {
    if (fundProxyInfos.length === 0) return 5.0;
    return fundProxyInfos.reduce((sum, e) => sum + e.info.rate, 0) / fundProxyInfos.length;
  }, [fundProxyInfos]);

  const iscMedio = useMemo(() => {
    if (selectedFunds.length === 0) return null;
    const costs = selectedFunds
      .map(f => f.isc.isc10a ?? f.isc.isc5a ?? f.costoAnnuo)
      .filter((c): c is number => c !== null);
    if (costs.length === 0) return null;
    return costs.reduce((s, c) => s + c, 0) / costs.length;
  }, [selectedFunds]);

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

  const totaleVersato = montanteIniziale + contributoAnnuo * orizzonteAnni;
  const montanteFinale = chartData[orizzonteAnni]?.montanteSenzaFiscale || 0;
  const rendimentoTotale = montanteFinale - totaleVersato;
  const rendimentoPercentuale = totaleVersato > 0 ? (montanteFinale / totaleVersato - 1) * 100 : 0;

  React.useEffect(() => {
    onValuesChange?.({ montanteIniziale, contributoAnnuo, orizzonteAnni, tassoRendimento });
  }, [montanteIniziale, contributoAnnuo, orizzonteAnni, tassoRendimento, onValuesChange]);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Step header */}
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm sm:text-base font-bold">1</span>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Crescita del tuo capitale nel tempo
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xl">
            Ogni anno versi una quota nel fondo pensione. I tuoi soldi vengono investiti e generano rendimenti che, sommandosi anno dopo anno,
            fanno crescere il capitale grazie all'<strong className="text-slate-700 dark:text-slate-300">interesse composto</strong>: i guadagni di oggi producono nuovi guadagni domani.
          </p>
        </div>
      </div>

      {/* ── Parametri ── */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">I tuoi dati</h4>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">Muovi gli slider o digita un valore per personalizzare la simulazione</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 sm:gap-y-8">
          <SliderInput
            label="Capitale già accumulato"
            tooltip="L'importo che hai già nel fondo pensione, oppure quanto vuoi versare come primo conferimento iniziale."
            value={montanteIniziale}
            onChange={setMontanteIniziale}
            min={0}
            max={100000}
            step={500}
            format={(v) => formatCurrency(v)}
            inputSuffix="€"
          />
          <SliderInput
            label="Quanto versi ogni anno"
            tooltip="La somma di tutti i contributi annuali: il tuo contributo volontario + quello del datore di lavoro + l'eventuale TFR destinato al fondo."
            value={contributoAnnuo}
            onChange={setContributoAnnuo}
            min={0}
            max={20000}
            step={100}
            format={(v) => formatCurrency(v)}
            inputSuffix="€"
          />
          <SliderInput
            label="Anni alla pensione"
            tooltip="Il numero di anni che mancano prima che tu vada in pensione. Più è lungo l'orizzonte, più l'interesse composto lavora a tuo favore."
            value={orizzonteAnni}
            onChange={setOrizzonteAnni}
            min={1}
            max={45}
            step={1}
            format={(v) => `${v} ${v === 1 ? 'anno' : 'anni'}`}
            inputSuffix="anni"
          />

          {/* Tasso info */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rendimento annuo stimato</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatPercentage(tassoRendimento, 2)}</span>
            </div>
            {fundProxyInfos.length > 0 ? (
              <div className="space-y-0.5">
                {fundProxyInfos.map(({ fund, info }) => (
                  <p key={fund.id} className="text-xs text-slate-500 dark:text-slate-400">
                    Calcolato dal rendimento storico di <span className="font-medium text-slate-700 dark:text-slate-300">{fund.pip}</span>
                    {' '}({info.label}: {formatPercentage(info.rate, 2)})
                  </p>
                ))}
                {iscMedio !== null && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                    I costi di gestione (ISC {formatPercentage(iscMedio, 2)}/anno) sono già inclusi in questo rendimento.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Tasso predefinito. Seleziona un fondo nella sezione sopra per usare il suo rendimento storico reale.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Risultati ── */}
      <div className="space-y-5 sm:space-y-6">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ecco quanto accumulerai</h4>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">I risultati si aggiornano automaticamente quando modifichi i parametri sopra</p>
        </div>

        {/* Key metrics — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Totale versato da te</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totaleVersato)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">capitale iniziale + contributi</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Capitale accumulato</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(montanteFinale)}</p>
            <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1.5">versato + rendimenti</p>
          </div>
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-5 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Guadagno dai rendimenti</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">+{formatPercentage(rendimentoPercentuale, 1)}</p>
            <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">{formatCurrency(rendimentoTotale)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">Crescita del capitale anno per anno</h4>
          </div>
          <MontanteChart data={chartData} theme={theme} showFiscale={false} showTFR={true} />
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-3">
            Il grafico mostra come il tuo capitale cresce nel tempo. La curva accelera negli anni grazie all'interesse composto: prima inizi a versare, più il tuo denaro lavora per te.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepMontante;
