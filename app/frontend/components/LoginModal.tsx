import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { BRAND_TOKENS } from '../config/brandTokens';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSuccess }) => {
  const { user, loading, login, authMode } = useAuth();
  const [busy, setBusy] = useState(false);

  const isOpenAccess = authMode === 'none';
  const isAuthenticating = busy || loading;

  // Reset busy state when modal closes
  useEffect(() => {
    if (!open) {
      setBusy(false);
    }
  }, [open, authMode]);

  useEffect(() => {
    if (!open) return;
    // If user is already authenticated, immediately call success
    if (user) {
      onSuccess();
    }
  }, [open, user, onSuccess]);

  useEffect(() => {
    if (open && isOpenAccess) {
      onSuccess();
    }
  }, [open, isOpenAccess, onSuccess]);

  if (!open) return null;

  const handleLogin = async () => {
    try {
      setBusy(true);
      await login();
      setBusy(false);
    } catch (e) {
      console.error('[LoginModal] Login failed:', e);
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={() => {
        if (!isAuthenticating) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-5 dark:border-slate-700 dark:from-blue-950/40 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_TOKENS.logo.pwa192}
              alt={BRAND_TOKENS.name}
              className="h-10 w-10 rounded-md object-contain"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary dark:text-blue-300">
                {BRAND_TOKENS.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{BRAND_TOKENS.productName}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
        {isAuthenticating && !isOpenAccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-primary dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            Completamento accesso in corso...
          </div>
        )}
        {isOpenAccess ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Accesso non richiesto</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Questa versione non richiede autenticazione. Puoi chiudere la finestra e continuare ad usare l&apos;app.</p>
            <button
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-x-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
            >
              Chiudi
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Accedi per continuare</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Per usare il confronto dei fondi è richiesto il login. Accedi con il tuo account Google.</p>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleLogin}
                disabled={isAuthenticating}
                className="w-full inline-flex items-center justify-center gap-x-2 rounded-lg border-2 border-blue-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:border-primary hover:bg-blue-50 disabled:opacity-60 dark:border-blue-900/70 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-blue-950/30"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {isAuthenticating ? 'Apertura login...' : 'Accedi con Google'}
              </button>

              <button
                onClick={onClose}
                disabled={isAuthenticating}
                className="w-full inline-flex items-center justify-center gap-x-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
              >
                Annulla
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
