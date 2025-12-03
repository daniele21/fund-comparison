import React from 'react';
import Footer from './Footer';

interface PlaybookProps {
  onStart: () => void;
  theme: string;
  toggleTheme: () => void;
}

const Playbook: React.FC<PlaybookProps> = ({ onStart, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 flex flex-col">
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-12 z-50">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative isolate overflow-hidden flex-1">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-slate-50 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-950"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 pb-20 text-center">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-950/50 p-10 sm:p-12 rounded-3xl mb-12 sm:mb-14 border border-blue-200 dark:border-blue-800/50 shadow-sm">
            <img
              src="/icons/Logo%20Verticale_trasparente.png"
              alt="Logo verticale"
              className="h-36 w-36 sm:h-64 sm:w-64 object-contain"
              loading="lazy"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight px-2 mb-5 sm:mb-6">
            Costruisci la tua pensione oggi,<br className="hidden sm:block" />Assicura il tuo domani.
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4 leading-relaxed">
            La pensione pubblica potrebbe non bastare. Un fondo pensione privato è una scelta strategica per un futuro sereno. Accedi per confrontare i fondi e trovare la soluzione giusta per te.
          </p>
          <div className="mt-8 sm:mt-10">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-x-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-slate-900 transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-100 active:translate-y-0"
            >
              Accedi per iniziare
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Playbook;
