import React, { useState, useEffect } from 'react';

export interface TourStep {
  target: string; // CSS selector
  content: React.ReactNode | string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  storageKey?: string; // Per salvare se il tour è stato completato
  showSkipButton?: boolean;
}

/**
 * Sistema di Tour Guidati
 * 
 * TODO: Implementazione completa con React Joyride
 * Per ora forniamo un placeholder che può essere sostituito
 * quando installiamo la libreria: npm install react-joyride
 */
const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  storageKey,
  showSkipButton = true,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Check if user has already completed this tour
  useEffect(() => {
    if (storageKey) {
      const completed = localStorage.getItem(`tour_completed_${storageKey}`);
      setHasCompleted(completed === 'true');
    }
  }, [storageKey]);

  // Don't show if already completed
  if (hasCompleted || !isOpen || steps.length === 0) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(`tour_completed_${storageKey}`, 'true');
    }
    setHasCompleted(true);
    onComplete?.();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Tour Tooltip */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md px-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {currentStepData.title && (
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {currentStepData.title}
                  </h3>
                )}
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Passo {currentStep + 1} di {steps.length}
                </p>
              </div>
              
              {showSkipButton && (
                <button
                  onClick={handleSkip}
                  className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Chiudi tour"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStepData.content}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pb-2">
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Indietro
            </button>

            <div className="flex items-center gap-1">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentStep
                      ? 'bg-blue-600 w-6'
                      : index < currentStep
                      ? 'bg-blue-400'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  title={`Vai al passo ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isLastStep ? 'Finito! ✓' : 'Avanti →'}
            </button>
          </div>
        </div>
      </div>
    </>
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
