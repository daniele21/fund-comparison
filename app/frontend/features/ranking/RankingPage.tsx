import React from 'react';
import type { FundCategory, PensionFund } from '../../types';
import { CATEGORY_MAP } from '../../constants';
import { getRankedFunds, RANKING_METRICS, type RankingFilters } from '../../utils/fundRanking';
import RankingCard from './RankingCard';
import RankingFiltersBar from './RankingFiltersBar';

interface RankingPageProps {
  funds: PensionFund[];
  onFundClick: (fund: PensionFund) => void;
}

const RankingPage: React.FC<RankingPageProps> = ({ funds, onFundClick }) => {
  const [filters, setFilters] = React.useState<RankingFilters>({
    onlyEsg: false,
    capitalGuarantee: 'all',
    category: 'all',
    includeClosedFunds: false,
  });
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const categories = React.useMemo(() => {
    const categorySet = new Set<FundCategory>();
    funds.forEach((fund) => categorySet.add(fund.categoria));
    return Array.from(categorySet).sort((a, b) => CATEGORY_MAP[a].localeCompare(CATEGORY_MAP[b], 'it'));
  }, [funds]);
  const toggleExpanded = (id: string) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className="space-y-6">
      <RankingFiltersBar filters={filters} categories={categories} onChange={setFilters} />
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Di default sono esclusi i fondi chiusi a nuove adesioni. Le classifiche costi separano importi fissi in euro e percentuali per evitare confronti tra unita diverse.
      </p>
      <div className="space-y-5">
        {RANKING_METRICS.map((metric) => {
          const ranked = getRankedFunds(funds, metric, filters);
          const isExpanded = expanded.has(metric.id);
          return (
            <RankingCard
              key={metric.id}
              id={metric.id}
              title={metric.title}
              tone={metric.tone}
              rankedFunds={ranked}
              isExpanded={isExpanded}
              onToggleExpanded={() => toggleExpanded(metric.id)}
              onFundClick={onFundClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RankingPage;
