import React, { useMemo } from 'react';
import type { PensionFund } from '../../types';
import { useGuidedComparator } from './GuidedComparatorContext';
import computeShortlist from '../../utils/fundShortlist';

type ChooseFundFlowProps = {
  funds: PensionFund[];
  onFundClick?: (fund: PensionFund) => void;
  theme?: string;
};

export const ChooseFundFlow: React.FC<ChooseFundFlowProps> = ({ funds, onFundClick, theme }) => {
  const { profile, setProfile, setSelectedFundId, selectedFundIds, toggleSelectedFund } = useGuidedComparator();

  const shortlist = useMemo(() => computeShortlist(funds, profile, { maxResults: 6 }), [funds, profile]);

  const handleToggleSelection = (fund: PensionFund, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelectedFund(fund.id);
  };

  const handleFundNameClick = (fund: PensionFund) => {
    setSelectedFundId(fund.id);
    if (onFundClick) {
      onFundClick(fund);
    }
  };

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/95 p-4 sm:p-5 md:p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">Scegli un fondo dal tuo profilo</h2>
      <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
        Ti faccio poche domande e ti mostro fondi coerenti col tuo orizzonte in una shortlist ordinata per costi e rendimento.
      </p>


      <div className="mt-4">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
            Età
            <select
              className="mt-2 w-full rounded-lg sm:rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-base dark:border-slate-700 dark:bg-slate-900"
              value={profile.ageRange ?? ''}
              onChange={e =>
                setProfile(prev => ({ ...prev, ageRange: e.target.value ? (e.target.value as typeof prev.ageRange) : undefined }))
              }
            >
              <option value="">Seleziona…</option>
              <option value="under35">&lt; 35</option>
              <option value="35-50">35–50</option>
              <option value="over50">&gt; 50</option>
            </select>
          </label>

          <label className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
            Anni alla pensione
            <input
              type="number"
              min={0}
              max={50}
              className="mt-2 w-full rounded-lg sm:rounded-xl border border-slate-200 px-3 py-2.5 text-sm sm:text-base dark:border-slate-700 dark:bg-slate-900"
              value={profile.horizonYears ?? ''}
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  horizonYears: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </label>

          <label className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
            Rischio
            <select
              className="mt-2 w-full rounded-lg sm:rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-base dark:border-slate-700 dark:bg-slate-900"
              value={profile.riskPreference ?? ''}
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  riskPreference: e.target.value ? (e.target.value as typeof prev.riskPreference) : undefined,
                }))
              }
            >
              <option value="">Seleziona…</option>
              <option value="low">Preferisco stabilità</option>
              <option value="medium">Posso accettare qualche oscillazione</option>
              <option value="high">Accetto forti oscillazioni per potenziale rendimento</option>
            </select>
          </label>

          <label className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
            FPN contrattuale
            <select
              className="mt-2 w-full rounded-lg sm:rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-base dark:border-slate-700 dark:bg-slate-900"
              value={profile.hasFpn === undefined ? '' : profile.hasFpn ? 'yes' : 'no'}
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  hasFpn: e.target.value === '' ? undefined : e.target.value === 'yes',
                }))
              }
            >
              <option value="">Non lo so / non ricordo</option>
              <option value="yes">Sì, ho un fondo di categoria</option>
              <option value="no">No, non ne ho</option>
            </select>
          </label>
        </div>

        <div className="mt-4 sm:mt-5 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white/95 p-3 sm:p-4 md:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {shortlist.length === 0 ? (
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Compila qualche dato sopra per vedere una shortlist di fondi filtrati in base al tuo
              orizzonte.
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Una prima shortlist per te</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300">
                  Non sono consigli personalizzati, ma una selezione filtrata per tipologia e costi, da cui puoi
                  partire per confrontare. (Mostro ISC a 10 anni e rendimento a 10 anni per confronto rapido)
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3 min-[480px]:grid-cols-2">
                {shortlist.map(fund => (
                  <div
                    key={fund.id}
                    className={
                      `group relative w-full rounded-lg sm:rounded-xl border-2 px-3 py-2 sm:px-3.5 sm:py-2.5 transition-all duration-200 hover:shadow-md dark:bg-slate-900/60 ` +
                      (selectedFundIds.includes(fund.id) 
                        ? 'border-sky-500 bg-gradient-to-br from-sky-50/80 to-sky-100/40 dark:from-sky-900/40 dark:to-sky-800/30 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 bg-white hover:border-sky-300 dark:hover:border-sky-600')
                    }
                  >
                    {/* Selection checkbox - compact */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSelection(fund, e)}
                      aria-label={selectedFundIds.includes(fund.id) ? "Deseleziona fondo" : "Seleziona fondo per il confronto"}
                      aria-pressed={selectedFundIds.includes(fund.id)}
                      className="absolute top-2 right-2 flex h-6 w-6 sm:h-6 sm:w-6 items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 hover:scale-110 active:scale-95 z-10"
                      title={selectedFundIds.includes(fund.id) ? "Rimuovi dal confronto" : "Aggiungi al confronto"}
                    >
                      {selectedFundIds.includes(fund.id) ? (
                        <span className="flex h-full w-full items-center justify-center rounded-md bg-sky-600 dark:bg-sky-500 text-white text-xs font-bold shadow-md">
                          ✓
                        </span>
                      ) : (
                        <span className="flex h-full w-full items-center justify-center rounded-md border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 group-hover:border-sky-400 dark:group-hover:border-sky-400 group-hover:bg-sky-50 dark:group-hover:bg-sky-900/30 transition-all">
                        </span>
                      )}
                    </button>

                    <div className="pr-8">
                      {/* Line 1: Fund name (clickable) + Company */}
                      <button
                        type="button"
                        onClick={() => handleFundNameClick(fund)}
                        className="text-left w-full group/name mb-1.5"
                      >
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover/name:text-sky-600 dark:group-hover/name:text-sky-400 transition-colors line-clamp-1">
                            {fund.linea}
                          </h4>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="inline-block h-3 w-3 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium truncate">
                            {fund.societa ?? fund.pip ?? 'N/A'}
                          </span>
                        </div>
                      </button>

                      {/* Line 2: Category, Type, and Metrics in one line */}
                      <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs">
                        {/* Left: Category + Type */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate">
                            {fund.categoria}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 truncate">
                            {fund.type}
                          </span>
                        </div>

                        {/* Right: Metrics inline */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <div className="flex items-center gap-0.5" title="Indicatore Sintetico di Costo a 10 anni">
                            <span className="text-amber-600 dark:text-amber-400 font-medium">ISC:</span>
                            <span className="font-bold text-amber-900 dark:text-amber-100 tabular-nums">
                              {fund.isc?.isc10a != null ? `${fund.isc.isc10a.toFixed(2)}%` : 'n.d.'}
                            </span>
                          </div>
                          <div className="h-3 w-px bg-slate-300 dark:bg-slate-600"></div>
                          <div className="flex items-center gap-0.5" title="Rendimento medio ultimi 10 anni">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Rend:</span>
                            <span className="font-bold text-emerald-900 dark:text-emerald-100 tabular-nums">
                              {fund.rendimenti.ultimi10Anni != null ? `${fund.rendimenti.ultimi10Anni.toFixed(2)}%` : 'n.d.'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
