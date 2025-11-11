import React, { useMemo } from 'react';
import type { PensionFund } from '../../types';
import { useGuidedComparator } from './GuidedComparatorContext';

type ChooseFundFlowProps = {
  funds: PensionFund[];
};

export const ChooseFundFlow: React.FC<ChooseFundFlowProps> = ({ funds }) => {
  const { profile, setProfile, setSelectedFundId } = useGuidedComparator();

  const shortlist = useMemo(() => {
    if (!profile.horizonYears) return [];
    const horizon = profile.horizonYears;
    let targetCategories: string[] = [];

    if (horizon <= 10) targetCategories = ['GAR', 'OBB', 'MISTO PRUDENTE'];
    else if (horizon <= 20) targetCategories = ['BIL', 'OBB MISTO', 'MISTO'];
    else targetCategories = ['AZN', 'AZ', 'CRESCITA', 'BIL'];

    const filtered = funds.filter(fund =>
      targetCategories.some(cat => fund.categoria.toUpperCase().includes(cat)),
    );

    const sorted = [...filtered].sort((a, b) => {
      const aCost = a.isc?.isc35a ?? 999;
      const bCost = b.isc?.isc35a ?? 999;
      return aCost - bCost;
    });

    return sorted.slice(0, 5);
  }, [funds, profile.horizonYears]);

  const handleSelectFund = (fund: PensionFund) => {
    setSelectedFundId(fund.id);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Scegliere un fondo dal tuo profilo</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Ti faccio qualche domanda molto semplice e ti mostro alcuni fondi che potrebbero essere coerenti con
        il tuo orizzonte temporale.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="grid gap-4">
            <label className="text-sm text-slate-600 dark:text-slate-300">
              Età indicativa
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={profile.ageRange ?? ''}
                onChange={e =>
                  setProfile(prev => ({ ...prev, ageRange: e.target.value ? (e.target.value as typeof prev.ageRange) : undefined }))
                }
              >
                <option value="">Seleziona…</option>
                <option value="under35">&lt; 35 anni</option>
                <option value="35-50">35–50 anni</option>
                <option value="over50">&gt; 50 anni</option>
              </select>
            </label>

            <label className="text-sm text-slate-600 dark:text-slate-300">
              Anni alla pensione (circa)
              <input
                type="number"
                min={0}
                max={50}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={profile.horizonYears ?? ''}
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    horizonYears: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </label>

            <label className="text-sm text-slate-600 dark:text-slate-300">
              Come vivi le oscillazioni dei mercati?
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
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

            <label className="text-sm text-slate-600 dark:text-slate-300">
              Hai un fondo contrattuale (FPN) nel tuo contratto?
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
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
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-950">
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
                  partire per confrontare.
                </p>
              </div>
              <div className="space-y-3">
                {shortlist.map(fund => (
                  <button
                    key={fund.id}
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500/60"
                    onClick={() => handleSelectFund(fund)}
                  >
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{fund.linea}</h4>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{fund.societa ?? 'Compagnia non indicata'}</p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      Categoria: <strong>{fund.categoria}</strong> • Tipo: <strong>{fund.type}</strong>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      ISC 35 anni: {fund.isc?.isc35a != null ? `${fund.isc.isc35a.toFixed(2)}%` : 'n.d.'} – Rendimento 10 anni:{' '}
                      {fund.rendimenti.ultimi10Anni != null ? `${fund.rendimenti.ultimi10Anni.toFixed(2)}%` : 'n.d.'}
                    </p>
                    <p className="mt-2 text-sm font-medium text-sky-600 dark:text-sky-400">Confronta questo fondo con altri simili</p>
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
