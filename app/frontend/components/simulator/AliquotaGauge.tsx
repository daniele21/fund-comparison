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
    <div className="space-y-4">
      {/* Visual Gauge */}
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5">Aliquota sostitutiva</p>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium text-rose-500 dark:text-rose-400">15%</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {formatPercentage(aliquota * 100, 2)}
          </span>
          <span className="text-[10px] font-medium text-emerald-500 dark:text-emerald-400">9%</span>
        </div>

        <div className="relative h-3.5 bg-gradient-to-r from-rose-200 via-amber-200 to-emerald-200 dark:from-rose-900/60 dark:via-amber-900/60 dark:to-emerald-900/60 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600">
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-800 dark:bg-slate-100"
            style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          />
        </div>
      </div>

      {/* Compact rules */}
      <div className="space-y-1">
        {[
          { label: '≤ 15 anni → 15%', active: anniPartecipazione <= 15 },
          { label: '16-34 anni → -0,30%/anno', active: anniPartecipazione > 15 && anniPartecipazione < 35 },
          { label: '≥ 35 anni → minimo 9%', active: anniPartecipazione >= 35 },
        ].map((item) => (
          <div key={item.label} className={`text-xs sm:text-sm px-3 py-2 rounded-lg ${
            item.active
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
              : 'text-slate-400 dark:text-slate-500'
          }`}>
            {item.label}
          </div>
        ))}
      </div>

      {anniPartecipazione < 35 && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
          Tra {35 - anniPartecipazione} anni raggiungerai il minimo del 9%.
        </p>
      )}
    </div>
  );
};

export default AliquotaGauge;
