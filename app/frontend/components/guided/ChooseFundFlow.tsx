import React, { useMemo } from 'react';
import type { PensionFund } from '../../types';
import { useGuidedComparator } from './GuidedComparatorContext';
import computeShortlist from '../../utils/fundShortlist';

type ChooseFundFlowProps = {
  funds: PensionFund[];
};

export const ChooseFundFlow: React.FC<ChooseFundFlowProps> = ({ funds }) => {
  const { profile, setProfile, setSelectedFundId, selectedFundIds, toggleSelectedFund } = useGuidedComparator();

  const shortlist = useMemo(() => computeShortlist(funds, profile, { maxResults: 6 }), [funds, profile]);

  const handleSelectFund = (fund: PensionFund) => {
    // primary selection for insights
    setSelectedFundId(fund.id);
    // toggle in the compare set
    toggleSelectedFund(fund.id);
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
                  partire per confrontare. (Mostro ISC a 35 anni e rendimento a 10 anni per confronto rapido)
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
                {shortlist.map(fund => (
                  <button
                    key={fund.id}
                    type="button"
                    aria-pressed={selectedFundIds.includes(fund.id)}
                    className={
                      `relative w-full rounded-xl sm:rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-300 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-sky-500/60 active:scale-[0.98] ` +
                      (selectedFundIds.includes(fund.id) ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-900/40' : 'border-slate-100')
                    }
                    onClick={() => handleSelectFund(fund)}
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                          <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{fund.linea}</h4>
                          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">{fund.societa ?? fund.pip ?? 'Compagnia non indicata'}</span>
                        </div>
                        <div className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate">
                          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Categoria:</span>
                          <strong className="font-medium mr-2">{fund.categoria}</strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Tipo:</span>
                          <span>{fund.type}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end text-right gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400">ISC</span>
                          <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                            {fund.isc?.isc35a != null ? `${fund.isc.isc35a.toFixed(2)}%` : 'n.d.'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Rend 10y</span>
                          <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                            {fund.rendimenti.ultimi10Anni != null ? `${fund.rendimenti.ultimi10Anni.toFixed(2)}%` : 'n.d.'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedFundIds.includes(fund.id) && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-sky-600 text-white text-xs" aria-hidden>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
