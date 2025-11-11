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
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Scegli un fondo dal tuo profilo</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
        Ti faccio poche domande e ti mostro fondi coerenti col tuo orizzonte in una shortlist ordinata per costi e rendimento.
      </p>


      <div className="mt-4">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="text-xs text-slate-600 dark:text-slate-300 flex-none w-full sm:w-48">
            Età
            <select
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
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

          <label className="text-xs text-slate-600 dark:text-slate-300 flex-none w-full sm:w-48">
            Anni alla pensione
            <input
              type="number"
              min={0}
              max={50}
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
              value={profile.horizonYears ?? ''}
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  horizonYears: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </label>

          <label className="text-xs text-slate-600 dark:text-slate-300 flex-none w-full sm:w-48">
            Rischio
            <select
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
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

          <label className="text-xs text-slate-600 dark:text-slate-300 flex-none w-full sm:w-48">
            FPN contrattuale
            <select
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
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

        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {shortlist.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Compila qualche dato a sinistra per vedere una shortlist di fondi filtrati in base al tuo
              orizzonte.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Una prima shortlist per te</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Non sono consigli personalizzati, ma una selezione filtrata per tipologia e costi, da cui puoi
                  partire per confrontare. (Mostro ISC a 35 anni e rendimento a 10 anni per confronto rapido)
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shortlist.map(fund => (
                  <button
                    key={fund.id}
                    type="button"
                    aria-pressed={selectedFundIds.includes(fund.id)}
                    className={
                      `relative w-full rounded-lg border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-300 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-sky-500/60 ` +
                      (selectedFundIds.includes(fund.id) ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-900/40' : 'border-slate-100')
                    }
                    onClick={() => handleSelectFund(fund)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{fund.linea}</h4>
                          <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">{fund.societa ?? fund.pip ?? 'Compagnia non indicata'}</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 truncate">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Categoria:</span>
                          <strong className="font-medium mr-2">{fund.categoria}</strong>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Tipo:</span>
                          <span>{fund.type}</span>
                        </div>
                      </div>

                      <div className="ml-4 flex shrink-0 flex-col items-end text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">ISC</span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {fund.isc?.isc35a != null ? `${fund.isc.isc35a.toFixed(2)}%` : 'n.d.'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Rend 10y</span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {fund.rendimenti.ultimi10Anni != null ? `${fund.rendimenti.ultimi10Anni.toFixed(2)}%` : 'n.d.'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedFundIds.includes(fund.id) && (
                      <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white text-xs" aria-hidden>
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
