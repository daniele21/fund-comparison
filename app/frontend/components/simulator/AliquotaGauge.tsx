import React from 'react';
import { formatPercentage } from '../../utils/simulatorCalc';

interface AliquotaGaugeProps {
  aliquota: number; // Value between 0.09 and 0.15
  anniPartecipazione: number;
}

const AliquotaGauge: React.FC<AliquotaGaugeProps> = ({ aliquota, anniPartecipazione }) => {
  const minAliquota = 0.09;
  const maxAliquota = 0.15;
  const percentage = ((maxAliquota - aliquota) / (maxAliquota - minAliquota)) * 100;

  return (
    <div className="space-y-3">
      {/* Visual Gauge */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">15%</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {formatPercentage(aliquota * 100, 2)}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">9%</span>
        </div>

        <div className="relative h-6 bg-gradient-to-r from-rose-200 via-amber-200 to-emerald-200 dark:from-rose-900 dark:via-amber-900 dark:to-emerald-900 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600">
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-800 dark:bg-slate-100 shadow-lg"
            style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
              {formatPercentage(aliquota * 100, 1)}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Timeline */}
      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Timeline aliquota
        </h4>
        <div className="space-y-1.5">
          {[
            { label: 'Primi 15 anni', detail: 'Aliquota fissa 15%', condition: anniPartecipazione < 15, step: '1' },
            { label: 'Dal 16° anno', detail: '-0,30%/anno', condition: anniPartecipazione >= 15 && anniPartecipazione < 35, step: '16+' },
            { label: 'Dal 35° anno', detail: 'Minimo 9%', condition: anniPartecipazione >= 35, step: '35+' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                item.condition
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              }`}>
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium ${item.condition ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.label} <span className="text-[10px] font-normal">— {item.detail}</span>
                </p>
              </div>
              {item.condition && (
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded flex-shrink-0">
                  {anniPartecipazione >= 35 ? '✓' : 'Ora'}
                </span>
              )}
            </div>
          ))}
        </div>

        {anniPartecipazione < 35 && (
          <p className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400">
            Tra <strong>{35 - anniPartecipazione} anni</strong> raggiungi il 9%.
          </p>
        )}
      </div>
    </div>
  );
};

export default AliquotaGauge;
