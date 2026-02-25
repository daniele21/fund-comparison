import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSuccess }) => {
  const { user, loading, login, authMode, inviteRequiresEmail } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ code: '', email: '', name: '' });
  const [error, setError] = useState<string | null>(null);

  const isInviteMode = authMode === 'invite_code';
  const isOpenAccess = authMode === 'none';

  // Reset busy state when modal closes
  useEffect(() => {
    if (!open) {
      setBusy(false);
      setForm({ code: '', email: '', name: '' });
      setError(null);
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

  const handleInviteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // If user is already authenticated (e.g. via OAuth popup), short-circuit
      if (user) {
        onSuccess();
        return;
      }

      await login({
        code: form.code,
        email: form.email || undefined,
        name: form.name || undefined,
      });
    } catch (err) {
      // Avoid printing full stack to console to reduce noise; log message only
      // The UI will show a friendly error via setError
      console.info('[LoginModal] Invite login failed:', err instanceof Error ? err.message : err);
      setError(err instanceof Error ? err.message : 'Impossibile verificare il codice. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  const renderInviteForm = () => (
    <form className="mt-6 space-y-4" onSubmit={handleInviteSubmit}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Codice invito
        <input
          type="text"
          value={form.code}
          onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          placeholder="Es. 15187715"
        />
      </label>
      {/* <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Email
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required={inviteRequiresEmail}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          placeholder="nome@azienda.it"
        />
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {inviteRequiresEmail ? 'Serve per associare il tuo accesso.' : 'Facoltativa, ci aiuta a riconoscerti.'}
        </span>
      </label> */}
      {/* <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Nome (facoltativo)
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          placeholder="Mario Rossi"
        />
      </label> */}
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-x-2 px-4 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:opacity-60"
      >
        {busy ? 'Verifica in corso…' : 'Accedi con codice invito'}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="w-full inline-flex items-center justify-center gap-x-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
      >
        Annulla
      </button>
    </form>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
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
        ) : isInviteMode ? (
          <>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Accedi con il codice invito</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Hai ricevuto un codice di accesso? Inseriscilo qui sotto per sbloccare tutte le funzionalità.</p>
            {renderInviteForm()}
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Accedi per continuare</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Per usare il confronto dei fondi è richiesto il login. Accedi con il tuo account Google.</p>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleLogin}
                disabled={busy || loading}
                className="w-full inline-flex items-center justify-center gap-x-2 px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-60 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {busy || loading ? 'Apertura login...' : 'Accedi con Google'}
              </button>

              <button
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-x-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
              >
                Annulla
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
