import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSuccess }) => {
  const { user, loading, login } = useAuth();
  const [busy, setBusy] = useState(false);

  // Reset busy state when modal closes
  useEffect(() => {
    if (!open) {
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // If user is already authenticated, immediately call success
    if (user) {
      onSuccess();
    }
  }, [open, user, onSuccess]);

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
      onClick={onClose}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Accedi per continuare</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Per usare il confronto dei fondi è richiesto il login. Accedi con il tuo account Google.</p>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleLogin}
            disabled={busy || loading}
            className="w-full inline-flex items-center justify-center gap-x-2 px-4 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:opacity-60"
          >
            {busy || loading ? 'Apertura login...' : 'Accedi con Google'}
          </button>

          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-x-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
