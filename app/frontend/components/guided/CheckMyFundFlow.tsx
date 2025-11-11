import React, { useMemo, useState } from 'react';
import type { PensionFund, UserProfile } from '../../types';
import { useGuidedComparator } from './GuidedComparatorContext';
// Inlined insights panel (moved from SelectedFundInsightsPanel.tsx)
import { costLabelFromIsc35, perfLabelFromRendimento10y, matchLabelFromFund, computeCoherenceScore, colorForCost, colorForPerf, colorForCoherence } from '../../config/fundConfig';
import { SelectedFundInsightsPanel } from './SelectedFundInsightsPanel';

type CheckMyFundFlowProps = {
  funds: PensionFund[];
};

export const CheckMyFundFlow: React.FC<CheckMyFundFlowProps> = ({ funds }) => {
  const { profile, setProfile, setSelectedFundId } = useGuidedComparator();
  const [search, setSearch] = useState('');

  const matchingFunds = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length < 3) return [];
    return funds.filter(fund => {
      const haystack = `${fund.linea} ${fund.pip} ${fund.societa ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [funds, search]);

  const [fund, setFund] = useState<PensionFund | null>(null);

  const handleSelectFund = (selected: PensionFund) => {
    setFund(selected);
    setSelectedFundId(selected.id);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Controlla il tuo fondo pensione</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Scrivi il nome del tuo fondo o della compagnia. Se non lo ricordi, lo trovi sull’estratto conto o sulla documentazione che ricevi ogni anno.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <div className="order-1 space-y-5 xl:order-1">
          <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Nome del fondo o della compagnia</span>
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white focus:border-sky-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                placeholder="Es. FONCHIM, COMETA, Alleanza Previdenza…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </label>

            {matchingFunds.length > 0 && (
              <ul className="mt-3 max-h-52 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-sm text-sm dark:border-slate-800 dark:bg-slate-900">
                {matchingFunds.slice(0, 8).map(result => (
                  <li key={result.id} className="border-b last:border-b-0">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:hover:bg-slate-800"
                      onClick={() => handleSelectFund(result)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-sm text-slate-900 dark:text-slate-100">{result.linea}</strong>
                        <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:text-[11px]">{result.societa ?? (result.type === 'FPN' ? result.pip : '')}</span>
                      </div>
                      {result.societa && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-[12px]">{result.societa}</div>}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Per contestualizzare</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-slate-600 dark:text-slate-300">
                  Età
                  <select
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                    value={profile.ageRange ?? ''}
                    onChange={e =>
                      setProfile(prev => ({ ...prev, ageRange: e.target.value ? (e.target.value as typeof profile.ageRange) : undefined }))
                    }
                  >
                    <option value="">Seleziona…</option>
                    <option value="under35">&lt; 35 anni</option>
                    <option value="35-50">35–50 anni</option>
                    <option value="over50">&gt; 50 anni</option>
                  </select>
                </label>

                <label className="text-sm text-slate-600 dark:text-slate-300">
                  Anni alla pensione
                  <input
                    type="number"
                    min={0}
                    max={50}
                    className="mt-2 w-full rounded-md border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                    value={profile.horizonYears ?? ''}
                    onChange={e =>
                      setProfile(prev => ({
                        ...prev,
                        horizonYears: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {fund ? (
              <FundXrayCard fund={fund} profile={profile} />
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Seleziona un fondo dall’elenco per vedere costi, rendimenti e coerenza con il tuo orizzonte.
              </div>
            )}
          </div>
        </div>

        <div className="order-2 xl:order-2 xl:sticky xl:top-28">
          <SelectedFundInsightsPanel funds={funds} />
        </div>
      </div>
    </section>
  );
};

const FundXrayCard: React.FC<{ fund: PensionFund; profile: UserProfile }> = ({ fund, profile }) => {
  const isc35 = fund.isc?.isc35a;
  const rendimento10y = fund.rendimenti.ultimi10Anni;

  const costLabel = costLabelFromIsc35(isc35);
  const perfLabel = perfLabelFromRendimento10y(rendimento10y);
  const matchLabel = matchLabelFromFund(fund);
  // compute once per render
  const coherenceScore = useMemo(() => computeCoherenceScore(fund.categoria, profile), [fund.categoria, profile]);
  const costColors = colorForCost(isc35);
  const perfColors = colorForPerf(rendimento10y);
  const coherenceColors = colorForCoherence(coherenceScore);

  return (
    <div className="space-y-3">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{fund.linea}</h3>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {fund.societa ?? (fund.type === 'FPN' ? fund.pip : 'Compagnia non indicata')}
          </p>
        </div>

        {/* KPI badges on the right for larger screens; stack below title on very small screens */}
        <div className="flex flex-wrap gap-3">
          <div
            className={`${costColors.badgeBg} flex items-center gap-3 rounded-md px-3 py-1 border border-transparent dark:border-transparent`}
            role="group"
            aria-label={`ISC 35: ${isc35 != null ? `${isc35.toFixed(2)}%` : 'dato non disponibile'}`}>
            <span className={`h-2 w-2 rounded-full ${costColors.dot}`} aria-hidden />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{isc35 != null ? `${isc35.toFixed(2)}%` : '—'}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">ISC (35y)</div>
            </div>
          </div>

          <div
            className={`${perfColors.badgeBg} flex items-center gap-3 rounded-md px-3 py-1 border border-transparent dark:border-transparent`}
            role="group"
            aria-label={`Rendimento medio 10 anni: ${rendimento10y != null ? `${rendimento10y.toFixed(2)}%` : 'dato mancante'}`}>
            <span className={`h-2 w-2 rounded-full ${perfColors.dot}`} aria-hidden />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rendimento10y != null ? `${rendimento10y.toFixed(2)}%` : '—'}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Rend. medio 10y</div>
            </div>
          </div>
        </div>
      </header>
      <ul className="space-y-4">
        <XrayRow color="yellow" title={costLabel}>
          ISC 35 anni: {isc35 != null ? `${isc35.toFixed(2)}%` : 'dato non disponibile'}. Costi contenuti favoriscono rendimenti netti migliori.
        </XrayRow>
        <XrayRow color="green" title={perfLabel}>
          Rendimento medio 10y: {rendimento10y != null ? `${rendimento10y.toFixed(2)}%` : 'dato mancante'}.
        </XrayRow>
        <XrayRow color="sky" title={matchLabel}>
          {profile.horizonYears || profile.ageRange ? (
            <>
              Questo fondo {fund.categoria} ha un punteggio di coerenza di <strong>{coherenceScore}/100</strong> rispetto al tuo profilo.
              {coherenceScore >= 60 ? ' Sembra in linea con il tuo orizzonte.' : ' Potresti valutare fondi più adatti al tuo orizzonte.'}
              <div className="mt-2 w-full">
                <CoherenceGauge score={coherenceScore} showNumber colorClass={coherenceColors.dot} />
              </div>
            </>
          ) : (
            <>
              La coerenza dipende da quanti anni ti separano dalla pensione e dalla tua tolleranza alle oscillazioni.
            </>
          )}
        </XrayRow>
      </ul>
      <p className="text-xs text-slate-500">
        Questo è uno strumento informativo e non costituisce una raccomandazione personalizzata di investimento.
      </p>
    </div>
  );
};

const COLOR_MAP: Record<'green' | 'yellow' | 'sky', string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  sky: 'bg-sky-500',
};

const XrayRow: React.FC<{ color: keyof typeof COLOR_MAP; title: string; children: React.ReactNode }> = ({
  color,
  title,
  children,
}) => (
  <li className="flex flex-wrap gap-3 items-start border-b last:border-b-0 pb-3">
    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${COLOR_MAP[color]}`} />
    <div className="flex-1">
      <strong className="block text-sm text-slate-900 dark:text-slate-100">{title}</strong>
      <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-300">{children}</p>
    </div>
  </li>
);

// Small visual gauge for coherence score
const CoherenceGauge: React.FC<{ score: number; showNumber?: boolean; colorClass?: string }> = ({ score, showNumber = false, colorClass }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const defaultColor = clamped >= 80 ? 'bg-emerald-500' : clamped >= 60 ? 'bg-amber-400' : 'bg-red-500';
  const color = colorClass ?? defaultColor;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-md bg-slate-100 dark:bg-slate-800" style={{ height: 6 }}>
        <div
          className={`${color} h-1.5 rounded-md transition-all duration-300 ease-in-out`}
          style={{ width: `${clamped}%`, height: 6 }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clamped}
        />
      </div>
      {showNumber && <div className="text-[11px] text-slate-600 dark:text-slate-300 w-10 text-right">{clamped}%</div>}
    </div>
  );
};
