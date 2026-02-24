import React, { useState, useMemo } from 'react';
import {
  calcolaAliquotaSostitutiva,
  calcolaRisparmioFiscaleAnnuo,
  calcolaMontante,
  formatCurrency,
  formatPercentage,
} from '../../utils/simulatorCalc';
import AliquotaGauge from './AliquotaGauge';

interface StepImpostaPensioneProps {
  montanteIniziale: number;
  contributoAnnuo: number;
  orizzonteAnni: number;
  ral: number;
  tassoRendimento: number;
  theme: string;
  onValuesChange?: (values: { annoPrimaAdesione: number }) => void;
}

const StepImpostaPensione: React.FC<StepImpostaPensioneProps> = ({
  montanteIniziale,
  contributoAnnuo,
  orizzonteAnni,
  ral,
  tassoRendimento,
  theme,
  onValuesChange,
}) => {
  const annoCorrente = new Date().getFullYear();
  const [annoPrimaAdesione, setAnnoPrimaAdesione] = useState(2020);

  const { risparmioAnnuo, aliquotaMarginale } = useMemo(
    () => calcolaRisparmioFiscaleAnnuo(contributoAnnuo, ral),
    [contributoAnnuo, ral]
  );

  const contributoEffettivo = contributoAnnuo + risparmioAnnuo;
  const serieConFiscale = useMemo(
    () => calcolaMontante(montanteIniziale, contributoEffettivo, tassoRendimento, orizzonteAnni),
    [montanteIniziale, contributoEffettivo, tassoRendimento, orizzonteAnni]
  );

  const montanteLordoConFiscale = serieConFiscale[orizzonteAnni] || 0;

  const { aliquota: aliquotaSostitutiva, anniPartecipazione } = useMemo(
    () => calcolaAliquotaSostitutiva(annoPrimaAdesione, annoCorrente, orizzonteAnni),
    [annoPrimaAdesione, annoCorrente, orizzonteAnni]
  );

  const impostaSostitutiva = montanteLordoConFiscale * aliquotaSostitutiva;
  const montanteNetto = montanteLordoConFiscale - impostaSostitutiva;

  const totaleVersato = montanteIniziale + contributoAnnuo * orizzonteAnni;
  const rendimentoNetto = montanteNetto - totaleVersato;
  const rendimentoNettoPercentuale = totaleVersato > 0 ? (montanteNetto / totaleVersato - 1) * 100 : 0;

  const risparmioTotale = risparmioAnnuo * orizzonteAnni;

  React.useEffect(() => {
    onValuesChange?.({ annoPrimaAdesione });
  }, [annoPrimaAdesione, onValuesChange]);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Step header */}
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm sm:text-base font-bold">3</span>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Quanto riceverai alla pensione (netto)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xl">
            Quando vai in pensione, sul capitale accumulato viene applicata un'<strong className="text-slate-700 dark:text-slate-300">imposta sostitutiva</strong> dal
            15% al 9%. Più anni sei iscritto al fondo, meno paghi: dopo 15 anni l'aliquota scende di 0,30% per ogni anno in più,
            fino a un minimo del 9%. È molto più vantaggiosa della normale IRPEF.
          </p>
        </div>
      </div>

      {/* ── Parametri ── */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Da quanto tempo sei iscritto?</h4>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">Indica l'anno della tua prima adesione a un qualsiasi fondo pensione — conta anche se hai cambiato fondo</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          {/* Year Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Anno della tua prima adesione
                <span title="L'anno in cui hai aderito per la prima volta a un fondo pensione (anche se diverso da quello attuale). Più è lontano, più bassa sarà l'aliquota." className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </label>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{annoPrimaAdesione}</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1993"
                max={annoCorrente}
                step="1"
                value={annoPrimaAdesione}
                onChange={(e) => setAnnoPrimaAdesione(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
              />
              <input
                type="number"
                min="1993"
                max={annoCorrente}
                step="1"
                value={annoPrimaAdesione}
                onChange={(e) => setAnnoPrimaAdesione(Math.max(1993, Math.min(annoCorrente, Number(e.target.value))))}
                className="w-20 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Aliquota Gauge */}
          <AliquotaGauge aliquota={aliquotaSostitutiva} anniPartecipazione={anniPartecipazione} />
        </div>
      </div>

      {/* ── Riepilogo ── */}
      <div className="space-y-5 sm:space-y-6">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Riepilogo completo della simulazione</h4>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">Ecco il riassunto di tutti i passaggi: quanto versi, quanto guadagni, quanto risparmi e quanto ricevi</p>
        </div>

        {/* Summary table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {/* Row: Versato */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5">
              <div>
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">Totale versato di tasca tua</span>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Capitale iniziale + contributi annui × {orizzonteAnni} anni</p>
              </div>
              <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totaleVersato)}</span>
            </div>
            {/* Row: Rivalutazione */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5">
              <div>
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">Guadagno dai rendimenti</span>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Quanto hanno fruttato i tuoi investimenti nel fondo</p>
              </div>
              <span className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(montanteLordoConFiscale - totaleVersato - risparmioTotale)}</span>
            </div>
            {/* Row: Risparmio IRPEF */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5">
              <div>
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">Risparmio IRPEF reinvestito</span>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Il risparmio fiscale ({formatPercentage(aliquotaMarginale * 100, 0)} aliquota) che hai rimesso nel fondo</p>
              </div>
              <span className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(risparmioTotale)}</span>
            </div>
            {/* Row: Montante lordo */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800/80">
              <div>
                <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">Capitale lordo accumulato</span>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Versato + rendimenti + risparmio fiscale, prima delle tasse finali</p>
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{formatCurrency(montanteLordoConFiscale)}</span>
            </div>
            {/* Row: Imposta */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5">
              <div>
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">Tassa alla pensione</span>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Imposta sostitutiva al {formatPercentage(aliquotaSostitutiva * 100, 1)} (dopo {anniPartecipazione} anni di iscrizione)</p>
              </div>
              <span className="text-sm sm:text-base font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(impostaSostitutiva)}</span>
            </div>
          </div>

          {/* Final result */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-t-2 border-emerald-300 dark:border-emerald-700 px-5 sm:px-6 py-5 sm:py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-200">Quello che riceverai davvero</p>
                <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  Hai guadagnato +{formatPercentage(rendimentoNettoPercentuale, 1)} in più rispetto a quanto hai versato
                </p>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(montanteNetto)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">
          Nota: l'imposta è calcolata sull'intero montante per semplicità. Nella realtà si applica solo su contributi dedotti e rendimenti.
        </p>
      </div>
    </div>
  );
};

export default StepImpostaPensione;
