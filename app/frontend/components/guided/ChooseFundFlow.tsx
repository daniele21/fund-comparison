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

  // Extract unique categoriaContratto values from FPN funds
  const fpnCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    funds.forEach(fund => {
      if (fund.type === 'FPN' && fund.categoriaContratto) {
        // Split by comma and trim each category
        fund.categoriaContratto.split(',').forEach(cat => {
          const trimmed = cat.trim();
          if (trimmed) categoriesSet.add(trimmed);
        });
      }
    });
    return Array.from(categoriesSet).sort();
  }, [funds]);

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
    <section className="rounded-2xl sm:rounded-3xl border-2 border-slate-300 bg-white p-4 sm:p-5 md:p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">Scegli un fondo dal tuo profilo</h2>
      <p className="mt-2 text-sm sm:text-base text-slate-700 dark:text-slate-200 max-w-2xl">
        Ti faccio poche domande e ti mostro fondi coerenti col tuo orizzonte in una shortlist ordinata per costi e rendimento.
      </p>


      <div className="mt-4">
  <div className="grid gap-3 sm:gap-4 grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-[auto_auto_auto_auto_auto]">
          <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white min-[480px]:col-span-1 lg:col-span-1">
            Età
            <select
              className="mt-2 w-full rounded-lg sm:rounded-xl border-2 border-slate-400 bg-white px-3 py-2.5 text-sm sm:text-base font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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

          <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white min-[480px]:col-span-1 lg:col-span-1">
            Anni alla pensione
            <input
              type="number"
              min={0}
              max={50}
              className="mt-2 w-full rounded-lg sm:rounded-xl border-2 border-slate-400 bg-white px-3 py-2.5 text-sm sm:text-base font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={profile.horizonYears ?? ''}
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  horizonYears: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </label>
          <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white min-[480px]:col-span-1 lg:col-span-1">
            Rischio
            <select
              className="mt-2 w-full rounded-lg sm:rounded-xl border-2 border-slate-400 bg-white px-3 py-2.5 text-sm sm:text-base font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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

          <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white min-[480px]:col-span-1 lg:col-span-1">
            FPN contrattuale
            <select
              className="mt-2 w-full rounded-lg sm:rounded-xl border-2 border-slate-400 bg-white px-3 py-2.5 text-sm sm:text-base font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={profile.hasFpn === undefined ? '' : profile.hasFpn ? 'yes' : 'no'}
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  hasFpn: e.target.value === '' ? undefined : e.target.value === 'yes',
                  // Reset contractualFpnCategory if user changes FPN status
                  contractualFpnCategory: e.target.value === 'yes' ? prev.contractualFpnCategory : undefined,
                }))
              }
            >
              <option value="">Non lo so / non ricordo</option>
              <option value="yes">Sì, ho un fondo di categoria</option>
              <option value="no">No, non ne ho</option>
            </select>
          </label>
          {/* Categoria contrattuale - shown inline when available */}
          {profile.hasFpn === true && fpnCategories.length > 0 && (
            <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white min-[480px]:col-span-1 lg:col-span-1">
              Categoria contrattuale (opz.)
              <select
                className="mt-2 w-full rounded-lg sm:rounded-xl border-2 border-slate-400 bg-white px-2 py-2 text-sm sm:text-base font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={profile.contractualFpnCategory ?? ''}
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    contractualFpnCategory: e.target.value || undefined,
                  }))
                }
              >
                <option value="">Seleziona categoria...</option>
                {fpnCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {/* categoria selector is inlined inside the grid above */}

        <div className="mt-4 sm:mt-5 rounded-2xl sm:rounded-3xl border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 md:p-5 shadow-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
          {shortlist.length === 0 ? (
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium text-center py-4">
              Compila qualche dato sopra per vedere una shortlist di fondi filtrati in base al tuo
              orizzonte.
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">Una prima shortlist per te</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-200">
                  Non sono consigli personalizzati, ma una selezione filtrata per tipologia e costi, da cui puoi
                  partire per confrontare. (Mostro ISC a 10 anni e rendimento a 10 anni per confronto rapido)
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3 min-[480px]:grid-cols-2">
                {shortlist.map(fund => (
                  <div
                    key={fund.id}
                    className={
                      `group relative w-full rounded-lg border-2 p-3 transition-all duration-200 hover:shadow-xl dark:bg-slate-900/80 ` +
                      (selectedFundIds.includes(fund.id) 
                        ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-lg dark:border-blue-500' 
                        : 'border-slate-300 dark:border-slate-600 bg-white hover:border-blue-400 dark:hover:border-blue-500')
                    }
                  >
                    {/* Selection checkbox - top right */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSelection(fund, e)}
                      aria-label={selectedFundIds.includes(fund.id) ? "Deseleziona fondo" : "Seleziona fondo per il confronto"}
                      aria-pressed={selectedFundIds.includes(fund.id)}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 hover:scale-110 active:scale-95 z-10"
                      title={selectedFundIds.includes(fund.id) ? "Rimuovi dal confronto" : "Aggiungi al confronto"}
                    >
                      {selectedFundIds.includes(fund.id) ? (
                        <span className="flex h-full w-full items-center justify-center rounded-md bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold shadow-lg">
                          ✓
                        </span>
                      ) : (
                        <span className="flex h-full w-full items-center justify-center rounded-md border-2 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 group-hover:border-blue-500 dark:group-hover:border-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950 transition-all shadow-sm">
                        </span>
                      )}
                    </button>

                    <div className="pr-8">
                      {/* Fund name - clickable with hover effect */}
                      <button
                        type="button"
                        onClick={() => handleFundNameClick(fund)}
                        className="text-left w-full group/name mb-1.5"
                      >
                        <div className="flex items-start gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white group-hover/name:text-blue-700 dark:group-hover/name:text-blue-400 transition-colors leading-tight flex-1 line-clamp-2">
                            {fund.linea}
                          </h4>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-3.5 w-3.5 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0 mt-0.5 text-blue-700 dark:text-blue-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 font-medium truncate">
                          {fund.societa ?? fund.pip ?? 'N/A'}
                        </p>
                      </button>

                      {/* Badges row - Category + Type */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-600">
                          {fund.categoria}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 border-2 border-indigo-300 dark:border-indigo-700">
                          {fund.type}
                        </span>
                      </div>

                      {/* Metrics section - compact cards */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-md p-1.5 border-2 border-amber-300 dark:border-amber-700 shadow-sm">
                          <div className="flex items-center gap-1 mb-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-700 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[9px] uppercase font-bold text-amber-800 dark:text-amber-200 tracking-wide">ISC 10a</span>
                          </div>
                          <p className="text-base font-bold text-amber-950 dark:text-amber-50 tabular-nums">
                            {fund.isc?.isc10a != null ? `${fund.isc.isc10a.toFixed(2)}%` : 'n.d.'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-md p-1.5 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm">
                          <div className="flex items-center gap-1 mb-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-700 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-[9px] uppercase font-bold text-emerald-800 dark:text-emerald-200 tracking-wide">Rend 10a</span>
                          </div>
                          <p className="text-base font-bold text-emerald-950 dark:text-emerald-50 tabular-nums">
                            {fund.rendimenti.ultimi10Anni != null ? `${fund.rendimenti.ultimi10Anni.toFixed(2)}%` : 'n.d.'}
                          </p>
                        </div>
                      </div>

                      {/* FPN contract categories badges - if available */}
                      {fund.type === 'FPN' && fund.categoriaContratto && (
                        <div className="mt-2 pt-2 border-t-2 border-slate-300 dark:border-slate-600">
                          <p className="text-[9px] uppercase font-bold text-slate-700 dark:text-slate-200 mb-1 tracking-wide">Categorie Contrattuali</p>
                          <div className="flex flex-wrap gap-1">
                            {fund.categoriaContratto.split(',').map((cat, idx) => (
                              <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-2 border-blue-300 dark:border-blue-700">
                                {cat.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
