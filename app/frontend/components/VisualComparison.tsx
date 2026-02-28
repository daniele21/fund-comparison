import React from 'react';
import { PensionFund } from '@/types';
import { useGuidedComparator, MAX_SELECTED_FUNDS, MIN_SELECTED_FUNDS_FOR_COMPARE } from './guided/GuidedComparatorContext';
import SelectedFundsBar from './SelectedFundsBar';
import PerformanceChart from './PerformanceChart';
import CostChart from './CostChart';

interface VisualComparisonProps {
  appSelectedFunds: PensionFund[];
  fundById: Map<string, PensionFund>;
  theme: string;
}

const VisualComparison: React.FC<VisualComparisonProps> = ({ appSelectedFunds, fundById, theme }) => {
  const { selectedFundIds, toggleSelectedFund, clearSelectedFunds } = useGuidedComparator();

  const guidedSelected = React.useMemo(() => {
    if (!selectedFundIds || selectedFundIds.length === 0) return null;
    return selectedFundIds.map(id => fundById.get(id)).filter((f): f is PensionFund => !!f);
  }, [selectedFundIds, fundById]);

  const fundsToShow = guidedSelected && guidedSelected.length > 0 ? guidedSelected : appSelectedFunds;

  return (
    <div>
      <SelectedFundsBar
        selectedFunds={fundsToShow}
        selectedFundIds={selectedFundIds}
        onToggleFund={(id: string) => toggleSelectedFund(id)}
        onClearAll={() => clearSelectedFunds()}
        isHeaderVisible={false}
        maxFunds={MAX_SELECTED_FUNDS}
      />

      {fundsToShow.length < MIN_SELECTED_FUNDS_FOR_COMPARE && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Seleziona almeno 2 fondi (massimo 3) per attivare il confronto completo.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
          <PerformanceChart selectedFunds={fundsToShow} theme={theme} />
        </div>
        <div className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
          <CostChart selectedFunds={fundsToShow} theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default VisualComparison;
