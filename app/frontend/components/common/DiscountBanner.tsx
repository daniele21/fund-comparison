import React, { useEffect, useState, useCallback } from 'react';

/* ── Config ─────────────────────────────────────────────────────── */
const DISCOUNT_CODE = 'DEMO20';
const DISCOUNT_PERCENT = 20;
const DISCOUNT_URL =
  'https://financialspreadsheet.it/discount/DEMO20?redirect=%2Fproducts%2Fcomparatore-fondi-pensione';

/** Delay (ms) before the banner appears after mount. */
const SHOW_DELAY_MS = 45_000; // 45 seconds

/** Session key so the banner appears at most once per browser session. */
const SESSION_KEY = 'app.discount_banner_shown_v1';

/** localStorage key so the banner does not re-appear once permanently dismissed. */
const DISMISSED_KEY = 'app.discount_banner_dismissed_v1';

/* ── Helpers ────────────────────────────────────────────────────── */
function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, '1');
  } catch {
    /* ignore */
  }
}

function wasShownThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markShownThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

/* ── Component ──────────────────────────────────────────────────── */
export interface DiscountBannerProps {
  /** Should be `true` only when the user is logged-in AND not a subscriber. */
  visible: boolean;
}

const DiscountBanner: React.FC<DiscountBannerProps> = ({ visible }) => {
  const [show, setShow] = useState(false);
  /** Controls the CSS enter/exit animation. */
  const [animateIn, setAnimateIn] = useState(false);

  /* Schedule appearance after SHOW_DELAY_MS. */
  useEffect(() => {
    if (!visible) return;
    if (wasDismissed() || wasShownThisSession()) return;

    const timer = setTimeout(() => {
      markShownThisSession();
      setShow(true);
      // Trigger the enter animation on the next frame.
      requestAnimationFrame(() => setAnimateIn(true));
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setAnimateIn(false);
    // Wait for exit animation, then unmount.
    setTimeout(() => {
      setShow(false);
      markDismissed();
    }, 300);
  }, []);

  /* Keyboard: close on Escape */
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, handleDismiss]);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Offerta sconto"
      className={`
        fixed bottom-20 right-4 z-50 w-[calc(100%-2rem)] max-w-sm
        transition-all duration-300 ease-out
        ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
      `}
    >
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-xl dark:border-blue-800 dark:bg-slate-900">
        {/* Decorative gradient strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Chiudi offerta"
          className="absolute right-2 top-2 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-5 pb-5 pt-6">
          {/* Badge sconto */}
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
              -{DISCOUNT_PERCENT}% Sconto
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Offerta riservata
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-slate-100">
            Sblocca il piano Full&nbsp;Access
          </h3>

          {/* Copy */}
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Confronta <strong>tutti</strong> i fondi pensione, usa il simulatore completo e
            ottieni strumenti avanzati. Usa il codice&nbsp;
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-sm font-semibold text-blue-700 dark:bg-slate-800 dark:text-blue-300">
              {DISCOUNT_CODE}
            </span>{' '}
            per risparmiare.
          </p>

          {/* CTA + secondary */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={DISCOUNT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.98]"
            >
              Ottieni il {DISCOUNT_PERCENT}% di sconto
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              No, grazie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;
