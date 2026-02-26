import React, { useEffect, useMemo, useState } from 'react';
import Joyride, {
  ACTIONS,
  EVENTS,
  STATUS,
  CallBackProps,
  Placement,
  Step as JoyrideStep,
  Styles,
} from 'react-joyride';

export interface TourStep {
  target: string; // CSS selector
  content: React.ReactNode | string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
  offset?: number;
  isOptional?: boolean;
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  storageKey?: string;
  showSkipButton?: boolean;
}

const resolvePlacement = (placement?: TourStep['placement']): Placement => {
  if (!placement || placement === 'center') {
    return 'bottom';
  }

  return placement;
};

const getJoyrideStyles = (isDarkMode: boolean): Partial<Styles> => {
  return {
    options: {
      zIndex: 12000,
      arrowColor: isDarkMode ? '#0f172a' : '#ffffff',
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      primaryColor: '#2563eb',
      textColor: isDarkMode ? '#e2e8f0' : '#0f172a',
      overlayColor: 'rgba(2, 6, 23, 0.62)',
      width: 380,
      spotlightShadow: '0 0 0 9999px rgba(2, 6, 23, 0.62)',
    },
    tooltip: {
      borderRadius: 14,
      border: isDarkMode ? '2px solid rgba(59, 130, 246, 0.55)' : '2px solid rgba(37, 99, 235, 0.35)',
      boxShadow: '0 14px 42px rgba(2, 6, 23, 0.28)',
      overflow: 'hidden',
    },
    tooltipContainer: {
      textAlign: 'left',
    },
    tooltipTitle: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 8,
    },
    tooltipContent: {
      fontSize: 14,
      lineHeight: 1.55,
      padding: '4px 0 8px',
    },
    buttonNext: {
      backgroundColor: '#2563eb',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      padding: '8px 14px',
    },
    buttonBack: {
      color: isDarkMode ? '#94a3b8' : '#475569',
      fontSize: 13,
      fontWeight: 600,
      marginRight: 8,
    },
    buttonSkip: {
      color: isDarkMode ? '#94a3b8' : '#475569',
      fontSize: 13,
      fontWeight: 500,
    },
    buttonClose: {
      color: isDarkMode ? '#94a3b8' : '#475569',
      height: 22,
      width: 22,
      right: 10,
      top: 10,
      padding: 2,
    },
    spotlight: {
      borderRadius: 16,
    },
  };
};

const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  storageKey,
  showSkipButton = true,
}) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const scrollOffset = 88;

  useEffect(() => {
    if (isOpen && steps.length > 0) {
      setStepIndex(0);
      setRun(true);
      return;
    }

    setRun(false);
  }, [isOpen, steps.length]);

  const isDarkMode =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const joyrideSteps: JoyrideStep[] = useMemo(() => {
    return steps.map((step) => ({
      target: step.target,
      title: step.title,
      content: step.content,
      placement: resolvePlacement(step.placement),
      disableBeacon: step.disableBeacon ?? true,
      spotlightClicks: step.spotlightClicks ?? false,
      offset: step.offset ?? 12,
      disableOverlayClose: true,
      hideCloseButton: false,
    }));
  }, [steps]);

  useEffect(() => {
    if (!isOpen || !run || typeof document === 'undefined') {
      return;
    }

    const currentStep = steps[stepIndex];
    if (!currentStep) {
      return;
    }

    if (currentStep.target === 'body') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) {
      return;
    }

    const targetTop = window.scrollY + targetElement.getBoundingClientRect().top - scrollOffset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  }, [isOpen, run, stepIndex, steps]);

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(`tour_completed_${storageKey}`, 'true');
    }

    onComplete?.();
  };

  const closeTour = () => {
    setRun(false);
    setStepIndex(0);
    onClose();
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    const isLastStep = index >= joyrideSteps.length - 1;

    if (action === ACTIONS.CLOSE) {
      closeTour();
      return;
    }

    if (status === STATUS.FINISHED) {
      handleComplete();
      closeTour();
      return;
    }

    if (status === STATUS.SKIPPED) {
      closeTour();
      return;
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + 1;

      if (nextIndex >= joyrideSteps.length) {
        closeTour();
        return;
      }

      setStepIndex(nextIndex);
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      if ((action === ACTIONS.NEXT || action === ACTIONS.STOP) && isLastStep) {
        handleComplete();
        closeTour();
        return;
      }

      if (action === ACTIONS.PREV) {
        setStepIndex(Math.max(index - 1, 0));
      } else {
        setStepIndex(Math.min(index + 1, Math.max(joyrideSteps.length - 1, 0)));
      }

      return;
    }

  };

  if (!isOpen || steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      run={run}
      stepIndex={stepIndex}
      steps={joyrideSteps}
      callback={handleJoyrideCallback}
      continuous
      showProgress
      showSkipButton={showSkipButton}
      disableOverlayClose
      disableCloseOnEsc={false}
      disableScrolling={false}
      disableScrollParentFix={false}
      scrollToFirstStep
      scrollOffset={scrollOffset}
      scrollDuration={450}
      spotlightClicks={false}
      spotlightPadding={10}
      locale={{
        back: 'Indietro',
        close: 'Chiudi',
        last: 'Finito',
        next: 'Avanti',
        nextLabelWithProgress: 'Avanti ({step}/{steps})',
        skip: 'Salta',
      }}
      styles={getJoyrideStyles(isDarkMode)}
    />
  );
};

export default GuidedTour;

/**
 * Hook per gestire lo stato del tour
 *
 * Logica:
 * 1. Primo accesso → hasSeenTour = false → mostra banner
 * 2. Utente clicca "Inizia tour" → tour parte
 * 3. Utente completa/skippa tour → hasSeenTour = true → banner non riappare
 * 4. Accessi futuri → tour disponibile solo via button "Tour Guidato"
 */
export const useGuidedTour = (tourKey: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [hasDismissedBanner, setHasDismissedBanner] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`tour_completed_${tourKey}`);
    const dismissed = localStorage.getItem(`tour_dismissed_${tourKey}`);

    setHasSeenTour(completed === 'true');
    setHasDismissedBanner(dismissed === 'true');
  }, [tourKey]);

  const startTour = () => setIsOpen(true);

  const closeTour = () => setIsOpen(false);

  const dismissBanner = () => {
    // Salva che l'utente ha chiuso il banner senza fare il tour
    localStorage.setItem(`tour_dismissed_${tourKey}`, 'true');
    setHasDismissedBanner(true);
  };

  const completeTour = () => {
    // Salva che l'utente ha completato il tour
    localStorage.setItem(`tour_completed_${tourKey}`, 'true');
    setHasSeenTour(true);
  };

  const resetTour = () => {
    // Per sviluppatori/admin: resetta tutto
    localStorage.removeItem(`tour_completed_${tourKey}`);
    localStorage.removeItem(`tour_dismissed_${tourKey}`);
    setHasSeenTour(false);
    setHasDismissedBanner(false);
  };

  // Banner visibile solo se: non ha visto tour E non ha chiuso banner
  const shouldShowBanner = !hasSeenTour && !hasDismissedBanner;

  return {
    isOpen,
    hasSeenTour,
    shouldShowBanner,
    startTour,
    closeTour,
    dismissBanner,
    completeTour,
    resetTour,
  };
};

/**
 * Componente helper per mostrare un banner "Nuovo utente"
 */
export const FirstVisitBanner: React.FC<{
  onStartTour: () => void;
  onDismiss: () => void;
}> = ({ onStartTour, onDismiss }) => {
  return (
    <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800 p-4 shadow-lg animate-in slide-in-from-top duration-500">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            👋 Benvenuto! Prima volta qui?
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Ti guidiamo passo passo per sfruttare al meglio questa sezione.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onStartTour}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Inizia il tour
            </button>
            <button
              onClick={onDismiss}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
            >
              No grazie, conosco già
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Chiudi"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};
