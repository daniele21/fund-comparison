import React from 'react';

const SimulatorPrivacyBanner: React.FC = () => {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
      <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
        <strong className="font-semibold">Privacy garantita:</strong> tutti i calcoli avvengono nel tuo browser. Zero salvataggio o trasmissione dati.
      </p>
    </div>
  );
};

export default SimulatorPrivacyBanner;
