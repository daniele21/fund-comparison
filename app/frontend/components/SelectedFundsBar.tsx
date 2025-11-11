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

  const maxFunds = 10;
  const percentFilled = (selectedFunds.length / maxFunds) * 100;

  return (
    <div className="sticky top-0 z-20 mb-6">
      {/* Desktop/Tablet View */}
      <div className="hidden sm:block rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-4 md:px-5 py-4 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600 dark:text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Fondi Selezionati
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-bold">
                {selectedFunds.length}/{maxFunds}
              </span>
              {/* Progress Bar */}
              <div className="hidden md:block w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-500 transition-all duration-300 ease-out"
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 flex items-center gap-1.5 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Rimuovi tutti
          </button>
        </div>

        {/* Fund Chips - Desktop */}
        <div className="flex flex-wrap gap-2">
          {selectedFunds.map((fund) => {
            const color = getColorForFund(fund.id, selectedFundIds);
            const fullLabel = formatFundLabel(fund);
            const shortName = formatShortFundLabel(fund, 45);
            const chipBackground = withAlpha(color, 0.12);
            const chipBorder = withAlpha(color, 0.3);
            const chipHoverBg = withAlpha(color, 0.2);
            
            return (
              <button
                key={fund.id}
                onClick={() => onToggleFund(fund.id)}
                className="group inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200 hover:shadow-md active:scale-95"
                title={fullLabel}
                style={{
                  backgroundColor: chipBackground,
                  borderColor: chipBorder,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = chipHoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = chipBackground;
                }}
              >
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-slate-800"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px] lg:max-w-[250px]">
                  {shortName}
                </span>
                <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors text-lg leading-none font-bold ml-1">
                  ×
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Mobile Header */}
        <div className="px-3 py-2.5 bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-600 dark:text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Selezionati
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-bold">
                {selectedFunds.length}/{maxFunds}
              </span>
            </div>
            <button
              onClick={onClearAll}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors active:scale-95 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancella
            </button>
          </div>
          
          {/* Progress Bar - Mobile */}
          <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-500 transition-all duration-300 ease-out"
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>

        {/* Fund Chips - Mobile Scrollable */}
        <div className="px-3 py-2.5 overflow-x-auto">
          <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
            {selectedFunds.map((fund) => {
              const color = getColorForFund(fund.id, selectedFundIds);
              const fullLabel = formatFundLabel(fund);
              const shortName = formatShortFundLabel(fund, 30);
              const chipBackground = withAlpha(color, 0.15);
              const chipBorder = withAlpha(color, 0.35);
              
              return (
                <button
                  key={fund.id}
                  onClick={() => onToggleFund(fund.id)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all duration-200 active:scale-95 flex-shrink-0"
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
                  <span className="text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap">
                    {shortName}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 group-active:text-slate-700 dark:group-active:text-slate-200 transition-colors text-base leading-none font-bold">
                    ×
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll Hint - Mobile */}
        {selectedFunds.length > 3 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 sm:hidden pointer-events-none">
            <div className="bg-gradient-to-l from-slate-100 dark:from-slate-900 to-transparent w-8 h-full flex items-center justify-end pr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 dark:text-slate-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedFundsBar;
