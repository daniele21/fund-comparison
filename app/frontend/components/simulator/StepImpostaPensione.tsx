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
  const [showExplanation, setShowExplanation] = useState(false);

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
    <div className="space-y-5">
      {/* Step header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Imposta sostitutiva e riepilogo
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Al pensionamento si applica un'imposta agevolata. Prima aderisci, meno paghi.
        </p>
      </div>

      {/* Info banner (compact) */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20 p-3">
        <div className="flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Imposta sostitutiva: dal <strong>15%</strong> scende di <strong>0,30%/anno</strong> dopo il 15° anno, fino al <strong>9%</strong>.
            </p>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors inline-flex items-center gap-1"
            >
              {showExplanation ? 'Mostra meno' : 'Perché conviene aderire presto?'}
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform duration-200 ${showExplanation ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showExplanation && (
              <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800 space-y-1.5 text-[11px] text-amber-800 dark:text-amber-200">
                <p>
                  Con <strong>{anniPartecipazione} anni</strong> di partecipazione pagherai solo il{' '}
                  <strong>{formatPercentage(aliquotaSostitutiva * 100, 2)}</strong> — contro il <strong>26%</strong> su capital gain di altri investimenti.
                </p>
                <p className="italic">
                  💡 Prima inizi, più risparmi in tasse al momento della pensione.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Input + Gauge (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Year Slider — single-row */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Anno prima adesione
                <span title="L'anno in cui hai sottoscritto il tuo primo fondo pensione." className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </label>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{annoPrimaAdesione}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1993"
                max={annoCorrente}
                step="1"
                value={annoPrimaAdesione}
                onChange={(e) => setAnnoPrimaAdesione(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer dark:bg-slate-700 accent-amber-600"
              />
              <input
                type="number"
                min="1993"
                max={annoCorrente}
                step="1"
                value={annoPrimaAdesione}
                onChange={(e) => setAnnoPrimaAdesione(Math.max(1993, Math.min(annoCorrente, Number(e.target.value))))}
                className="w-20 px-2 py-1 text-xs text-right border border-slate-200 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 focus:ring-1 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Aliquota Gauge */}
          <AliquotaGauge aliquota={aliquotaSostitutiva} anniPartecipazione={anniPartecipazione} />
        </div>

        {/* Right: Summary + Final (3/5) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Key metrics row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 dark:bg-slate-800/60 dark:border-slate-700 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Partecipazione</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{anniPartecipazione} <span className="text-xs font-normal">anni</span></p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300 mb-0.5">Aliquota</p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-100">{formatPercentage(aliquotaSostitutiva * 100, 1)}</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 dark:bg-rose-950/30 dark:border-rose-800 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-rose-700 dark:text-rose-300 mb-0.5">Imposta</p>
              <p className="text-lg font-bold text-rose-900 dark:text-rose-100">-{formatCurrency(impostaSostitutiva)}</p>
            </div>
          </div>

          {/* Final summary table (compact) */}
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-800 p-4">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Riepilogo simulazione
            </h4>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between py-1 border-b border-blue-200 dark:border-blue-800">
                <span className="text-blue-800 dark:text-blue-200">Versato di tasca tua</span>
                <span className="font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(totaleVersato)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-200 dark:border-blue-800">
                <span className="text-blue-800 dark:text-blue-200">Rivalutazione rendimenti</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">+{formatCurrency(montanteLordoConFiscale - totaleVersato - risparmioTotale)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-200 dark:border-blue-800">
                <span className="text-blue-800 dark:text-blue-200">Risparmio IRPEF ({formatPercentage(aliquotaMarginale * 100, 0)})</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">+{formatCurrency(risparmioTotale)}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-blue-100 dark:bg-blue-900/40 -mx-1 px-1 rounded">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Montante lordo</span>
                <span className="font-bold text-blue-900 dark:text-blue-100">{formatCurrency(montanteLordoConFiscale)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-200 dark:border-blue-800">
                <span className="text-blue-800 dark:text-blue-200">Imposta sostitutiva ({formatPercentage(aliquotaSostitutiva * 100, 1)})</span>
                <span className="font-semibold text-rose-700 dark:text-rose-300">-{formatCurrency(impostaSostitutiva)}</span>
              </div>
            </div>

            {/* Final highlight */}
            <div className="mt-3 -mx-1 px-3 py-3 rounded-lg bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/60 dark:to-emerald-800/60 border border-emerald-300 dark:border-emerald-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">💰 Netto alla pensione</span>
                <span className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">{formatCurrency(montanteNetto)}</span>
              </div>
              <div className="text-right mt-0.5">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Rendimento netto: +{formatPercentage(rendimentoNettoPercentuale, 1)}
                </span>
              </div>
            </div>
          </div>

          {/* Technical note */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic leading-relaxed">
            <strong>Nota:</strong> L'imposta è calcolata sull'intero montante per semplicità. Nella realtà si applica solo su contributi dedotti e rendimenti. Consulta un professionista per una stima personalizzata.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepImpostaPensione;
