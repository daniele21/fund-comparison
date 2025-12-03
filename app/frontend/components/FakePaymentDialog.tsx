import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth';

interface FakePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const env = (import.meta as any).env as Record<string, string> | undefined;
const API_BASE = (env && env.VITE_API_BASE) || 'http://localhost:8000';

const FakePaymentDialog: React.FC<FakePaymentDialogProps> = ({ open, onClose, onSuccess }) => {
  const { refresh, setToken, updateUser, user, token } = useAuth();
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [holderName, setHolderName] = useState('Mario Rossi');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setCardNumber('4242 4242 4242 4242');
      setHolderName('');
      setBusy(false);
      setError(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const authToken = token || ((window as any).__APP_OAUTH_TOKEN as string | undefined);
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE}/auth/upgrade/fake`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          // purely cosmetic, backend ignores payload
          cardNumber,
          holderName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const newToken = typeof payload?.token === 'string' ? payload.token : undefined;
      if (newToken) {
        setToken(newToken);
      }

      const updated = await refresh(newToken);
      if (!updated && user) {
        updateUser((prev) => {
          if (!prev) return prev;
          return { ...prev, plan: 'full-access' };
        });
      }
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('[FakePaymentDialog] upgrade error', err);
      setError('Non è stato possibile completare il pagamento di prova. Riprova tra poco.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fake-payment-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">Checkout demo</p>
            <h2 id="fake-payment-title" className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              Simula pagamento
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi checkout"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Inserisci dati fittizi per completare l&apos;upgrade. Nessun pagamento reale viene effettuato: confermando abiliterai il piano full
          access sul tuo profilo.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Nome sulla carta
            <input
              type="text"
              value={holderName}
              onChange={(event) => setHolderName(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Numero carta
            <input
              type="text"
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Suggerimento: 4242 4242 4242 4242</span>
          </label>

          <div className="flex gap-3">
            <label className="w-1/2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Scadenza
              <input
                type="text"
                placeholder="12/34"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              required
              defaultValue="12/34"
            />
          </label>
          <label className="w-1/2 text-sm font-medium text-slate-700 dark:text-slate-200">
            CVC
            <input
              type="text"
              placeholder="123"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              required
              defaultValue="123"
            />
          </label>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
          >
            {busy ? 'Elaborazione...' : 'Completa upgrade'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FakePaymentDialog;
