import React, { useState } from 'react';

const SimulatorPrivacyBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30 overflow-hidden transition-all duration-300 h-fit">
      <div className="p-4">
        <div className="flex items-start gap-2.5">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-100 mb-1">
              🔒 I tuoi dati restano sul tuo dispositivo
            </h3>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-200 leading-relaxed">
              Tutti i calcoli avvengono nel tuo browser. Non salviamo né trasmettiamo alcun dato personale.
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors inline-flex items-center gap-1"
            >
              {expanded ? 'Mostra meno' : 'Dettagli'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-emerald-200 dark:border-emerald-800 bg-emerald-100/50 dark:bg-emerald-900/20 px-4 py-3">
          <ul className="space-y-1.5 text-[11px] text-emerald-800 dark:text-emerald-200">
            <li className="flex items-start gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Nessun dato salvato</strong> — i dati esistono solo nella memoria del tuo browser.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Calcoli locali</strong> — nessuna comunicazione con server esterni.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Privacy 100%</strong> — chiudendo la pagina, tutto scompare.</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SimulatorPrivacyBanner;
