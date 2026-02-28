import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth';
import { SUBSCRIPTION_URL } from '../../constants';

const DEMO_ACK_KEY = 'app.demo_ack_v1';
/** Session key: tracks that the user already answered the question in this session */
const SESSION_ANSWERED_KEY = 'app.banner_answered_v1';

type AccessStatusBannerProps = {
  visible: boolean;
  onClose: () => void;
  onOpenUpgrade: () => void;
  freePlanLimit: number;
};

type BannerMode = 'question' | 'demo' | 'confirmed';

function readDemoAck(): boolean {
  try {
    return window.sessionStorage.getItem(DEMO_ACK_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDemoAck(): void {
  try {
    window.sessionStorage.setItem(DEMO_ACK_KEY, '1');
  } catch {
    // ignore
  }
}

function readSessionAnswered(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_ANSWERED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSessionAnswered(): void {
  try {
    window.sessionStorage.setItem(SESSION_ANSWERED_KEY, '1');
  } catch {
    // ignore
  }
}

const AccessStatusBanner: React.FC<AccessStatusBannerProps> = ({ visible, onClose, onOpenUpgrade, freePlanLimit }) => {
  const { user, loading, authMode } = useAuth();
  const [demoAck, setDemoAck] = useState<boolean>(() => (typeof window === 'undefined' ? false : readDemoAck()));
  const [answeredThisSession, setAnsweredThisSession] = useState<boolean>(() => (typeof window === 'undefined' ? false : readSessionAnswered()));
  const [confirmedPaid, setConfirmedPaid] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Clean up legacy localStorage key
    try { window.localStorage.removeItem(DEMO_ACK_KEY); } catch { /* ignore */ }
    // Reset the session-answered flag on every user change (login/switch)
    // so the "Hai già pagato?" question always re-appears
    try { window.sessionStorage.removeItem(SESSION_ANSWERED_KEY); } catch { /* ignore */ }
    try { window.sessionStorage.removeItem(DEMO_ACK_KEY); } catch { /* ignore */ }
    setDemoAck(false);
    setAnsweredThisSession(false);
    setConfirmedPaid(false);
  }, [user?.id]);

  const mode: BannerMode | null = useMemo(() => {
    if (!user || loading || authMode === 'none') return null;

    const plan = user.plan ?? 'free';
    const status = user.status ?? 'active';
    const isNotFullAccess = plan === 'free' || status !== 'active';

    // Every new session: show the question first, regardless of pending status
    if (isNotFullAccess && !answeredThisSession) return 'question';

    // User just clicked "Sì, ho pagato" → show confirmation message
    if (confirmedPaid) return 'confirmed';

    // If the user chose "demo" this session, always show demo mode
    if (demoAck) return 'demo';

    // Fallback for non-full-access users
    if (isNotFullAccess) return 'demo';

    return null;
  }, [user, loading, authMode, demoAck, answeredThisSession, confirmedPaid]);

  const canClose = mode !== 'question';

  if (!visible || !mode) {
    return null;
  }

  const handleMarkDemo = () => {
    writeDemoAck();
    writeSessionAnswered();
    setDemoAck(true);
    setAnsweredThisSession(true);
  };

  const handleMarkPaid = () => {
    writeSessionAnswered();
    setAnsweredThisSession(true);
    setConfirmedPaid(true);
  };

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="rounded-t-xl sm:rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex items-start gap-3 p-3 sm:p-4">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {mode === 'question' && (
                <>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Hai già acquistato la subscription Full Access?</span>
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handleMarkPaid}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Sì, ho pagato
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkDemo}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      No, sto provando la demo
                    </button>
                  </div>
                </>
              )}

              {mode === 'confirmed' && (
                <>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">✅ Grazie! La tua richiesta è in fase di approvazione.</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Riceverai l&apos;accesso completo non appena verrà verificato il pagamento.
                    Nel frattempo puoi continuare a esplorare le funzionalità disponibili nella versione demo.
                  </p>
                </>
              )}

              {mode === 'demo' && (
                <>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Versione demo con funzionalità limitate.</span>{' '}
                    Visualizzi solo i primi <strong>{freePlanLimit} fondi</strong> nei risultati e il simulatore è limitato.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                    <a
                      href={SUBSCRIPTION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Acquista Full Access
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      onClick={onOpenUpgrade}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Scopri Full Access
                    </button>
                  </div>
                </>
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
