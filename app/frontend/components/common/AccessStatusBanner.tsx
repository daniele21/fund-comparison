import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth';
import type { AuthUser } from '../../types';

const DEMO_ACK_KEY = 'app.demo_ack_v1';

type AccessStatusBannerProps = {
  visible: boolean;
  onClose: () => void;
  onOpenUpgrade: () => void;
  freePlanLimit: number;
};

type BannerMode = 'pending' | 'question' | 'demo';

type SubscriptionRequestResponse = {
  ok: boolean;
  token?: string;
  user?: AuthUser;
};

type ImportMetaWithEnv = ImportMeta & { env?: Record<string, string | undefined> };

function readDemoAck(): boolean {
  try {
    return window.localStorage.getItem(DEMO_ACK_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDemoAck(): void {
  try {
    window.localStorage.setItem(DEMO_ACK_KEY, '1');
  } catch {
    // ignore
  }
}

function getApiBase(): string {
  const env = (import.meta as unknown as ImportMetaWithEnv).env;
  return (env?.VITE_API_BASE ?? 'http://localhost:8000').toString();
}

const AccessStatusBanner: React.FC<AccessStatusBannerProps> = ({ visible, onClose, onOpenUpgrade, freePlanLimit }) => {
  const { user, loading, token, setToken, refresh, updateUser, authMode } = useAuth();
  const [demoAck, setDemoAck] = useState<boolean>(() => (typeof window === 'undefined' ? false : readDemoAck()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDemoAck(readDemoAck());
  }, [user?.id]);

  const mode: BannerMode | null = useMemo(() => {
    if (!user || loading || authMode === 'none') return null;

    const plan = user.plan ?? 'free';
    const status = user.status ?? 'active';

    if (status === 'pending') return 'pending';
    if (plan === 'free' && status === 'active' && !demoAck) return 'question';
    if (plan === 'free' && status === 'active' && demoAck) return 'demo';

    return null;
  }, [user, loading, authMode, demoAck]);

  const canClose = mode !== 'question';

  if (!visible || !mode) {
    return null;
  }

  const handleMarkDemo = () => {
    writeDemoAck();
    setDemoAck(true);
    setError(null);
  };

  const handleRequestSubscription = async () => {
    if (!user) return;

    setBusy(true);
    setError(null);

    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${getApiBase()}/auth/subscription/request`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      const payload = (await res.json()) as SubscriptionRequestResponse;
      if (!payload.ok) {
        throw new Error('Impossibile inviare la richiesta. Riprova.');
      }

      if (payload.token) {
        setToken(payload.token);
      }
      if (payload.user) {
        updateUser((prev) => {
          const next: AuthUser = {
            ...(prev ?? payload.user),
            ...payload.user,
            isAdmin: prev?.isAdmin ?? payload.user.isAdmin,
          };
          return next;
        });
      }

      await refresh(payload.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossibile inviare la richiesta. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="rounded-t-xl sm:rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex items-start gap-3 p-3 sm:p-4">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {mode === 'pending' && (
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">⏳ Richiesta in attesa.</span>{' '}
                  La tua richiesta è in fase di approvazione. Una volta approvata, avrai accesso completo a tutti i fondi.
                </p>
              )}

              {mode === 'question' && (
                <>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Hai già completato il pagamento?</span>
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handleRequestSubscription}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {busy ? 'Invio...' : 'Sì, ho pagato'}
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkDemo}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      No, sto provando la demo
                    </button>
                  </div>
                </>
              )}

              {mode === 'demo' && (
                <>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Versione demo con funzionalità limitate.</span>{' '}
                    Visualizzi solo i primi <strong>{freePlanLimit} fondi</strong> nei risultati.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                    <button
                      type="button"
                      onClick={handleRequestSubscription}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {busy ? 'Invio...' : 'Ho pagato'}
                    </button>
                    <button
                      type="button"
                      onClick={onOpenUpgrade}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Scopri Full Access
                    </button>
                  </div>
                </>
              )}

              {error && (
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}
            </div>

            {canClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Chiudi banner"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessStatusBanner;
