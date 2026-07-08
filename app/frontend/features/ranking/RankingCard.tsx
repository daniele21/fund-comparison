import React from 'react';
import type { PensionFund } from '../../types';
import type { RankedFund, RankingTone } from '../../utils/fundRanking';
import FundIdentity from '../../components/common/FundIdentity';
import FundRatingBadge from '../../components/common/FundRatingBadge';
import InfoPopover from '../../components/common/InfoPopover';

const INITIAL_VISIBLE_RANKS = 5;

interface RankingCardProps {
  id: string;
  title: string;
  tone: RankingTone;
  rankedFunds: RankedFund[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onFundClick: (fund: PensionFund) => void;
}

const RankingCard: React.FC<RankingCardProps> = ({
  id,
  title,
  tone,
  rankedFunds,
  isExpanded,
  onToggleExpanded,
  onFundClick,
}) => {
  const hasAdditionalRanks = rankedFunds.length > INITIAL_VISIBLE_RANKS;
  const visibleFunds = isExpanded ? rankedFunds : rankedFunds.slice(0, INITIAL_VISIBLE_RANKS);
  const listDescriptionId = `${id}-scroll-description`;
  const toneClasses = tone === 'negative'
    ? {
        section: 'border-[rgb(var(--ranking-negative-border-rgb)/0.8)]',
        header: 'border-[rgb(var(--ranking-negative-border-rgb)/0.75)] bg-[rgb(var(--ranking-negative-surface-rgb)/1)]',
        label: 'text-[rgb(var(--ranking-negative-text-rgb)/1)]',
        rank: 'text-[rgb(var(--ranking-negative-text-rgb)/1)]',
        value: 'text-[rgb(var(--ranking-negative-text-rgb)/1)]',
      }
    : {
        section: 'border-[rgb(var(--ranking-positive-border-rgb)/0.8)]',
        header: 'border-[rgb(var(--ranking-positive-border-rgb)/0.75)] bg-[rgb(var(--ranking-positive-surface-rgb)/1)]',
        label: 'text-[rgb(var(--ranking-positive-text-rgb)/1)]',
        rank: 'text-[rgb(var(--ranking-positive-text-rgb)/1)]',
        value: 'text-[rgb(var(--ranking-positive-text-rgb)/1)]',
      };

  return (
    <section
      className={`overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-950 ${toneClasses.section}`}
      aria-labelledby={`${id}-title`}
    >
      <header className={`flex items-start justify-between gap-4 border-b px-4 py-3 sm:px-5 ${toneClasses.header}`}>
        <div className="min-w-0">
          <h3 id={`${id}-title`} className="text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-base">
            {title}
          </h3>
          <p className={`mt-1 text-xs font-semibold ${toneClasses.label}`}>
            {tone === 'negative' ? 'Valori piu onerosi in evidenza' : 'Valori migliori in evidenza'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`text-xs font-medium ${toneClasses.label}`}>
            {rankedFunds.length} disponibili
          </span>
          <InfoPopover
            label="Dettaglio rating nel ranking"
            title="Rating Accademia Previdenza"
            linkHref="/guide#rating-accademia-previdenza"
            linkLabel="Vai alla metodologia"
          >
            Le righe mostrano il rating del comparto accanto al valore della classifica per leggere costo/rendimento e qualita del fondo insieme.
          </InfoPopover>
        </div>
      </header>

      {visibleFunds.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400 sm:px-5">
          Nessun valore confrontabile con i filtri attivi.
        </p>
      ) : (
        <div
          id={`${id}-list`}
          className={`${isExpanded ? 'max-h-[32rem] overflow-y-auto' : 'overflow-hidden'}`}
          tabIndex={isExpanded ? 0 : undefined}
          aria-describedby={isExpanded ? listDescriptionId : undefined}
          aria-label={isExpanded ? `Tutte le posizioni per ${title}` : undefined}
        >
          <p id={listDescriptionId} className="sr-only">
            Elenco scorrevole: usa i tasti freccia, Pagina su e Pagina giù per consultare tutte le posizioni.
          </p>
          <ol className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleFunds.map(({ fund, displayValue }, index) => (
              <li
                key={fund.id}
                className="text-sm"
              >
                <button
                  type="button"
                  onClick={() => onFundClick(fund)}
                  className="block w-full px-4 py-3 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50 dark:hover:bg-slate-900/70 dark:focus-visible:bg-slate-900/70 sm:px-5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`flex h-9 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold tabular-nums shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 ${toneClasses.rank}`}>
                      {index + 1}
                    </span>
                    <FundIdentity fund={fund} compact className="flex-1" />
                    <div className="ml-auto hidden shrink-0 items-center gap-3 sm:flex">
                      <FundRatingBadge fund={fund} compact variant="ranking" />
                      <span className={`min-w-[6.5rem] text-right text-sm font-bold tabular-nums ${toneClasses.value}`}>
                        {displayValue}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 pl-11 sm:hidden">
                    <FundRatingBadge fund={fund} compact variant="ranking" />
                    <span className={`text-sm font-bold tabular-nums ${toneClasses.value}`}>
                      {displayValue}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {hasAdditionalRanks && (
        <div className="border-t border-slate-100 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-950 sm:px-5">
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded={isExpanded}
            aria-controls={`${id}-list`}
            className="min-h-11 text-sm font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-100"
          >
            {isExpanded ? 'Mostra solo i primi 5' : `Mostra tutti (${rankedFunds.length})`}
          </button>
        </div>
      )}
    </section>
  );
};

export default RankingCard;
