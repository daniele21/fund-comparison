import React, { useEffect, useState } from 'react';
import { applyPendingPwaUpdate, hasPendingPwaUpdate, subscribeToPwaUpdates } from '../../utils/pwa';

const PwaUpdateBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(() => hasPendingPwaUpdate());
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    return subscribeToPwaUpdates(() => {
      setIsVisible(true);
      setIsApplying(false);
    });
  }, []);

  const handleApplyUpdate = () => {
    const started = applyPendingPwaUpdate();
    if (started) {
      setIsApplying(true);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-3 sm:px-4">
      <div className="mx-auto max-w-7xl rounded-xl border border-cyan-200 bg-cyan-50/95 p-3 shadow-md backdrop-blur-sm dark:border-cyan-800/70 dark:bg-slate-900/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            È disponibile una nuova versione dell&apos;app.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Dopo
            </button>
            <button
              type="button"
              onClick={handleApplyUpdate}
              disabled={isApplying}
              className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isApplying ? 'Aggiornamento...' : 'Aggiorna ora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PwaUpdateBanner;
