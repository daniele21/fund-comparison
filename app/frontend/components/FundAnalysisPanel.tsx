import React, { useMemo, useState } from 'react';
import type { PensionFund } from '../types';
import EmptyState from './common/EmptyState';
import { ScrollReveal } from './animations/ScrollReveal';
import { AnimatedButton } from './animations/AnimatedButton';

interface FundAnalysisPanelProps {
  funds: PensionFund[];
  selectedFund: PensionFund | null;
  setSelectedFund: (fund: PensionFund | null) => void;
}

const FundAnalysisPanel: React.FC<FundAnalysisPanelProps> = ({ funds, selectedFund, setSelectedFund }) => {
  const [analysisSearchTerm, setAnalysisSearchTerm] = useState('');

  const matchingFunds = useMemo(() => {
    const term = analysisSearchTerm.trim().toLowerCase();
    if (term.length < 2) return [];

    return funds
      .filter((fund) => {
        const fundText = `${fund.pip} ${fund.linea} ${fund.societa || ''}`.toLowerCase();
        return fundText.includes(term);
      })
      .slice(0, 5);
  }, [analysisSearchTerm, funds]);

  const alternatives = useMemo(() => {
    if (!selectedFund) return [];

    return funds
      .filter((fund) =>
        fund.categoria === selectedFund.categoria &&
        fund.id !== selectedFund.id &&
        (fund.rendimenti.ultimi5Anni || 0) > (selectedFund.rendimenti.ultimi5Anni || 0)
      )
      .sort((a, b) => (b.rendimenti.ultimi5Anni || 0) - (a.rendimenti.ultimi5Anni || 0))
      .slice(0, 3);
  }, [funds, selectedFund]);

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <ScrollReveal variant="slideUp" duration={0.6} threshold={0.2}>
        <section
          data-tour="client-fund-analysis"
          className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 px-3 py-4 sm:px-4 sm:py-5 md:px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div className="mb-4 sm:mb-5">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Analisi fondo cliente
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Cerca il fondo attuale del cliente per confrontarlo con alternative della stessa categoria.
            </p>
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={analysisSearchTerm}
                onChange={(e) => setAnalysisSearchTerm(e.target.value)}
                placeholder="Cerca per nome fondo, comparto o società"
                className="w-full px-4 py-3 pl-11 text-sm rounded-xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {analysisSearchTerm.length >= 2 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {matchingFunds.length > 0 ? (
                matchingFunds.map((fund) => (
                  <button
                    key={fund.id}
                    type="button"
                    onClick={() => {
                      setSelectedFund(fund);
                      setAnalysisSearchTerm('');
                    }}
                    className="w-full p-3 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all text-left"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {fund.pip}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {fund.societa} - {fund.categoria}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="text-right">
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            {fund.rendimenti.ultimoAnno != null ? `${fund.rendimenti.ultimoAnno.toFixed(2)}%` : 'n.d.'}
                          </div>
                          <div className="text-slate-500">1 anno</div>
                        </div>
                        <span className="text-blue-700 dark:text-blue-300 font-semibold">Seleziona</span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState
                  variant="search"
                  title="Nessun fondo trovato"
                  description="Prova con nome fondo, società o comparto"
                />
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Inizia a digitare per selezionare il fondo attuale del cliente
            </div>
          )}
        </section>
      </ScrollReveal>

      {selectedFund !== null && (
        <ScrollReveal variant="slideUp" duration={0.6} delay={0.1} threshold={0.2}>
          <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 px-3 py-4 sm:px-4 sm:py-5 md:px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-4 sm:mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Fondo cliente vs alternative
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Confronto automatico con fondi nella stessa categoria ordinati per rendimento a 5 anni.
              </p>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mb-2">
                    Fondo cliente
                  </span>
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {selectedFund.pip}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {selectedFund.societa} - {selectedFund.categoria}
                  </p>
                </div>
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFund(null)}
                >
                  Chiudi
                </AnimatedButton>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Rend. 1A</div>
                  <div className="font-bold text-sm text-green-600 dark:text-green-400">
                    {selectedFund.rendimenti.ultimoAnno != null ? `${selectedFund.rendimenti.ultimoAnno.toFixed(2)}%` : 'n.d.'}
                  </div>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Rend. 5A</div>
                  <div className="font-bold text-sm text-green-600 dark:text-green-400">
                    {selectedFund.rendimenti.ultimi5Anni != null ? `${selectedFund.rendimenti.ultimi5Anni.toFixed(2)}%` : 'n.d.'}
                  </div>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">ISC</div>
                  <div className="font-bold text-sm text-orange-600 dark:text-orange-400">
                    {selectedFund.isc.isc10a != null ? `${selectedFund.isc.isc10a.toFixed(2)}%` : 'n.d.'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Alternative con rendimento a 5 anni superiore
              </h4>

              {alternatives.length > 0 ? (
                <div className="space-y-3">
                  {alternatives.map((fund, idx) => (
                    <div
                      key={fund.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-green-300 dark:hover:border-green-600 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                              {idx + 1}
                            </span>
                            <h5 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                              {fund.pip}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {fund.societa}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            +{((fund.rendimenti.ultimi5Anni || 0) - (selectedFund.rendimenti.ultimi5Anni || 0)).toFixed(2)}%
                          </div>
                          <div className="text-xs text-slate-500">vs fondo cliente</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  variant="success"
                  title="Nessuna alternativa superiore"
                  description="Il fondo selezionato non ha alternative migliori nella stessa categoria sul rendimento a 5 anni."
                />
              )}
            </div>
          </section>
        </ScrollReveal>
      )}
    </div>
  );
};

export default FundAnalysisPanel;
