import React from 'react';
import { PensionFund } from '../types';
import { getColorForFund, withAlpha } from '../utils/colorMapping';
import { formatFundLabel, formatShortFundLabel } from '../utils/fundLabel';

interface SelectedFundsBarProps {
  selectedFunds: PensionFund[];
  selectedFundIds: string[];
  onToggleFund: (fundId: string) => void;
  onClearAll: () => void;
}

const SelectedFundsBar: React.FC<SelectedFundsBarProps> = ({
  selectedFunds,
  selectedFundIds,
  onToggleFund,
  onClearAll
}) => {
  if (selectedFunds.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-16 z-20 mb-4 rounded-xl bg-slate-900/90 dark:bg-slate-800/90 px-4 py-3 backdrop-blur shadow-lg border border-slate-700 dark:border-slate-600">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-300 dark:text-slate-400 mr-1">
          {selectedFunds.length} {selectedFunds.length === 1 ? 'fondo selezionato' : 'fondi selezionati'}:
        </span>

        {selectedFunds.map((fund) => {
          const color = getColorForFund(fund.id, selectedFundIds);
          const fullLabel = formatFundLabel(fund);
          const shortName = formatShortFundLabel(fund, 40);
          const chipBackground = withAlpha(color, 0.15);
          const chipBorder = withAlpha(color, 0.35);
          
          return (
            <button
              key={fund.id}
              onClick={() => onToggleFund(fund.id)}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors group"
              title={fullLabel}
              style={{
                backgroundColor: chipBackground,
                borderColor: chipBorder,
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-slate-200 dark:text-slate-300 truncate max-w-[140px] sm:max-w-[180px]">
                {shortName}
              </span>
              <span className="text-slate-400 group-hover:text-slate-200 dark:group-hover:text-slate-100 transition-colors text-base leading-none">
                ×
              </span>
            </button>
          );
        })}

        <button
          onClick={onClearAll}
          className="ml-auto text-xs text-slate-300 dark:text-slate-400 hover:text-slate-100 dark:hover:text-slate-200 underline font-medium transition-colors"
        >
          Deseleziona tutti
        </button>
      </div>
    </div>
  );
};

export default SelectedFundsBar;
