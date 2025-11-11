import React, { useEffect } from 'react';

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  onRequestLogin: () => void;
  onStartCheckout: () => void;
  isAuthenticated: boolean;
}

const UpgradeDialog: React.FC<UpgradeDialogProps> = ({ open, onClose, onRequestLogin, onStartCheckout, isAuthenticated }) => {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Upgrade</p>
            <h2 id="upgrade-dialog-title" className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              Passa al piano Full Access
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi finestra upgrade"
            className="rounded-full p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Il piano Free mostra soltanto una parte dei risultati. Con il piano Full Access esplori l&apos;intero archivio dei fondi e ottieni
          strumenti extra per confrontare in modo approfondito.
        </p>

        <ul className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-200">
          <li className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Catalogo completo</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Accedi a tutti i risultati e alle metriche storiche senza limiti.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Supporto dedicato</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Ricevi assistenza personalizzata per scegliere il prodotto più adatto.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-4.215A2 2 0 0016.695 11H15V7a3 3 0 00-6 0v4H7.305a2 2 0 00-1.9 1.785L4 17h5m2 0v4m0 0h2m-2 0H9" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Funzioni premium in arrivo</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Accedi per primo a report avanzati e analisi personalizzate.</p>
            </div>
          </li>
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600"
          >
            Torna indietro
          </button>
          <button
            onClick={() => {
              if (isAuthenticated) {
                onClose();
                onStartCheckout();
                return;
              }
              onRequestLogin();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100"
          >
            {isAuthenticated ? 'Procedi al pagamento demo' : 'Accedi per continuare'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeDialog;
