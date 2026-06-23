import React from 'react';
import type { PensionFund } from '../../types';
import { getRankedFunds, RANKING_METRICS, type RankingFilters } from '../../utils/fundRanking';

interface RankingPageProps { funds: PensionFund[]; }

const RankingPage: React.FC<RankingPageProps> = ({ funds }) => {
  const [filters, setFilters] = React.useState<RankingFilters>({ onlyEsg: false, onlyCapitalGuarantee: false });
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const toggleExpanded = (id: string) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 border-y border-slate-200 py-4 dark:border-slate-800">
        <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={filters.onlyEsg} onChange={(event) => setFilters((current) => ({ ...current, onlyEsg: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600" />
          Solo fondi ESG
        </label>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={filters.onlyCapitalGuarantee} onChange={(event) => setFilters((current) => ({ ...current, onlyCapitalGuarantee: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600" />
          Solo fondi con garanzia del capitale
        </label>
      </div>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Le classifiche costi includono solo valori chiaramente confrontabili: euro per costi una tantum e percentuali per gestione annua/erogazione. I valori ambigui sono esclusi.</p>
      <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
        {RANKING_METRICS.map((metric) => {
          const ranked = getRankedFunds(funds, metric, filters);
          const isExpanded = expanded.has(metric.id);
          const visible = isExpanded ? ranked : ranked.slice(0, 5);
          return (
            <section key={metric.id} className="border-b border-slate-200 pb-4 dark:border-slate-800" aria-labelledby={`${metric.id}-title`}>
              <div className="flex items-start justify-between gap-4">
                <h3 id={`${metric.id}-title`} className="text-sm font-semibold text-slate-900 dark:text-slate-100">{metric.title}</h3>
                <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{ranked.length} disponibili</span>
              </div>
              {visible.length === 0 ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nessun valore confrontabile con i filtri attivi.</p> : (
                <ol className="mt-3 space-y-2">
                  {visible.map(({ fund, value, displayValue }, index) => (
                    <li key={fund.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-2 text-sm">
                      <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{index + 1}</span>
                      <span className="min-w-0 truncate text-slate-700 dark:text-slate-200" title={`${fund.pip} — ${fund.linea}`}>{fund.pip} — {fund.linea}</span>
                      <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">{displayValue}</span>
                    </li>
                  ))}
                </ol>
              )}
              {ranked.length > 5 && <button type="button" onClick={() => toggleExpanded(metric.id)} aria-expanded={isExpanded} className="mt-3 min-h-11 text-sm font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:text-emerald-300">{isExpanded ? 'Mostra solo i primi 5' : `Mostra tutti (${ranked.length})`}</button>}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default RankingPage;
