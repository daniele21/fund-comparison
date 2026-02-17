import React from 'react';

interface SimulatorDisclaimerProps {
  variant?: 'default' | 'compact';
}

const SimulatorDisclaimer: React.FC<SimulatorDisclaimerProps> = ({ variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
        ⚠️ I rendimenti passati non sono indicativi di quelli futuri. Questa simulazione ha scopo
        puramente illustrativo.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 p-4">
      <div className="flex items-start gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1.5">
            Avvertenze importanti
          </h4>
          <ul className="space-y-1.5 text-xs text-amber-800 dark:text-amber-200">
            <li className="flex items-start gap-1.5">
              <span className="flex-shrink-0 mt-1">•</span>
              <span>
                <strong>I rendimenti passati non sono indicativi di quelli futuri</strong>. I risultati
                effettivi possono variare significativamente.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="flex-shrink-0 mt-1">•</span>
              <span>
                Questa simulazione ha <strong>scopo puramente illustrativo ed educativo</strong> e non
                costituisce consulenza finanziaria o fiscale personalizzata.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="flex-shrink-0 mt-1">•</span>
              <span>
                I calcoli fiscali si basano sulla normativa vigente (D.Lgs. 252/2005) e sugli scaglioni
                IRPEF 2025, che potrebbero cambiare nel tempo.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="flex-shrink-0 mt-1">•</span>
              <span>
                Per decisioni di investimento reali, consulta sempre un professionista qualificato.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimulatorDisclaimer;
