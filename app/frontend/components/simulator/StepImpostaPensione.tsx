import React, { useState, useMemo } from 'react';
import {
  calcolaAliquotaSostitutiva,
  calcolaRisparmioFiscaleAnnuo,
  calcolaMontante,
  calcolaTfrAnnuoDaRal,
  formatCurrency,
  formatPercentage,
} from '../../utils/simulatorCalc';
import AliquotaGauge from './AliquotaGauge';
import SimulatorSlider from './SimulatorSlider';

interface StepImpostaPensioneProps {
  montanteIniziale: number;
  contributoVolontarioAnnuo: number;
  orizzonteAnni: number;
  ral: number;
  tassoRendimento: number;
  theme: string;
  onValuesChange?: (values: { annoPrimaAdesione: number }) => void;
}

const StepImpostaPensione: React.FC<StepImpostaPensioneProps> = ({
  montanteIniziale,
  contributoVolontarioAnnuo,
  orizzonteAnni,
  ral,
  tassoRendimento,
  theme,
  onValuesChange,
}) => {
  const annoCorrente = new Date().getFullYear();
  const [annoPrimaAdesione, setAnnoPrimaAdesione] = useState(2020);

  const tfrAnnuoDatore = useMemo(() => calcolaTfrAnnuoDaRal(ral), [ral]);
  const contributoTotaleAnnuo = contributoVolontarioAnnuo + tfrAnnuoDatore;

  const { risparmioAnnuo, aliquotaMarginale } = useMemo(
    () => calcolaRisparmioFiscaleAnnuo(contributoVolontarioAnnuo, ral),
    [contributoVolontarioAnnuo, ral]
  );

  const contributoEffettivo = contributoTotaleAnnuo + risparmioAnnuo;
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

  const totaleVersato = montanteIniziale + contributoTotaleAnnuo * orizzonteAnni;
  const rendimentoNettoPercentuale = totaleVersato > 0 ? (montanteNetto / totaleVersato - 1) * 100 : 0;
  const risparmioTotale = risparmioAnnuo * orizzonteAnni;

  React.useEffect(() => {
    onValuesChange?.({ annoPrimaAdesione });
  }, [annoPrimaAdesione, onValuesChange]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm sm:text-base font-bold">3</span>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Quanto riceverai alla pensione (netto)</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xl">
            Questo passaggio combina contributo volontario, TFR automatico e reinvestimento del risparmio IRPEF per stimare il netto a pensione.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Da quanto tempo sei iscritto?</h4>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">Indica l'anno della tua prima adesione a un qualsiasi fondo pensione</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          <SimulatorSlider
            label="Anno della tua prima adesione"
            tooltip="L'anno in cui ti sei iscritto per la prima volta a un qualsiasi fondo pensione. Più è lontano, minore sarà l'aliquota sostitutiva."
            value={annoPrimaAdesione}
            onChange={setAnnoPrimaAdesione}
            min={1993}
            max={annoCorrente}
            step={1}
            format={(v) => String(v)}
            formatMin={() => '1993'}
            formatMax={() => String(annoCorrente)}
            accent="blue"
          />

          <AliquotaGauge aliquota={aliquotaSostitutiva} anniPartecipazione={anniPartecipazione} />
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Riepilogo completo della simulazione</h4>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5">
              <div>
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">Totale versato di tasca tua + TFR datore</span>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                  Volontario ({formatCurrency(contributoVolontarioAnnuo)}) + TFR ({formatCurrency(tfrAnnuoDatore)}) × {orizzonteAnni} anni
                </p>
              </div>
              <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totaleVersato)}</span>
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5">
              <div>
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">Guadagno dai rendimenti</span>
              </div>
              <span className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(montanteLordoConFiscale - totaleVersato - risparmioTotale)}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5">
              <div>
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">Risparmio IRPEF reinvestito</span>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                  Calcolato solo sul contributo volontario ({formatPercentage(aliquotaMarginale * 100, 0)} aliquota)
                </p>
              </div>
              <span className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(risparmioTotale)}</span>
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800/80">
              <div>
                <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">Capitale lordo accumulato</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{formatCurrency(montanteLordoConFiscale)}</span>
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5">
              <div>
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">Tassa alla pensione</span>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                  Imposta sostitutiva al {formatPercentage(aliquotaSostitutiva * 100, 1)} (dopo {anniPartecipazione} anni di iscrizione)
                </p>
              </div>
              <span className="text-sm sm:text-base font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(impostaSostitutiva)}</span>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-t-2 border-emerald-300 dark:border-emerald-700 px-5 sm:px-6 py-5 sm:py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-200">Quello che riceverai davvero</p>
                <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  Hai guadagnato +{formatPercentage(rendimentoNettoPercentuale, 1)} rispetto al versato
                </p>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{formatCurrency(montanteNetto)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">
          Nota: l'imposta è calcolata sull'intero montante per semplicità. Nella realtà si applica alla quota imponibile prevista dalla normativa.
        </p>
      </div>
    </div>
  );
};

export default StepImpostaPensione;
