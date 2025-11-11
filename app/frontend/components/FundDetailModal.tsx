import React, { useEffect } from 'react';
import { PensionFund } from '../types';
import { CATEGORY_MAP } from '../constants';
import PerformanceChart from './PerformanceChart';
import CostChart from './CostChart';

interface FundDetailModalProps {
  fund: PensionFund | null;
  onClose: () => void;
  theme: string;
}

const ValueRow: React.FC<{ label: string; value: number | null; isPercentage?: boolean }> = ({ label, value, isPercentage = true }) => {
  const color = value === null ? 'text-gray-500 dark:text-gray-400' : value >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500';
  const displayValue = value !== null ? `${value.toFixed(2)}${isPercentage ? '%' : ''}` : 'N/A';
  return (
    <div className="flex justify-between items-center py-2 sm:py-3 gap-2">
      <p className="text-gray-600 dark:text-gray-300 text-left flex-1 min-w-0 truncate" title={label}>{label}</p>
      <p className={`font-semibold ${color} tabular-nums shrink-0`}>{displayValue}</p>
    </div>
  );
};

const FundDetailModal: React.FC<FundDetailModalProps> = ({ fund, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!fund) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-5xl transform transition-all duration-300 ease-in-out max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200 dark:border-slate-700 relative shrink-0">
          <div className="pr-10">
            <h2 id="modal-title" className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100 leading-tight">
              {fund.linea}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{fund.pip}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1">
            {/* Principal Info */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-5 sm:mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Società</p>
                    <p
                      className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate px-1"
                      title={fund.societa || (fund.type === 'FPN' ? 'Fondo pensione di categoria' : '')}
                    >
            {fund.societa || (fund.type === 'FPN' ? 'Fondo pensione di categoria' : 'N/A')}
                    </p>
                  </div>
                  <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Categoria</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate px-1">{CATEGORY_MAP[fund.categoria]}</p>
                  </div>
                  <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tipo</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">{fund.type}</p>
                  </div>
                  <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">N° Albo</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">{fund.nAlbo}</p>
                  </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="mb-5 sm:mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 sm:p-4">
                      <PerformanceChart selectedFunds={[fund]} theme={theme} isCompact />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 sm:p-4">
                      <CostChart selectedFunds={[]} detailFund={fund} theme={theme} />
                    </div>
                </div>
            </div>

            {/* Tables Section - Optimized for Mobile */}
            <div className="space-y-5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 pt-5 sm:pt-6 border-t border-gray-200 dark:border-slate-700">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Performance Storica
                    </h3>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 sm:px-4 text-xs sm:text-sm">
                        <ValueRow label="Rendimento ultimo anno" value={fund.rendimenti.ultimoAnno} />
                        <ValueRow label="Rendimento medio 3 anni" value={fund.rendimenti.ultimi3Anni} />
                        <ValueRow label="Rendimento medio 5 anni" value={fund.rendimenti.ultimi5Anni} />
                        <ValueRow label="Rendimento medio 10 anni" value={fund.rendimenti.ultimi10Anni} />
                        <ValueRow label="Rendimento medio 20 anni" value={fund.rendimenti.ultimi20Anni} />
                    </div>
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Dettaglio Costi (ISC)
                    </h3>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 sm:px-4 text-xs sm:text-sm">
                        <ValueRow label="Costo a 2 anni" value={fund.isc.isc2a} />
                        <ValueRow label="Costo a 5 anni" value={fund.isc.isc5a} />
                        <ValueRow label="Costo a 10 anni" value={fund.isc.isc10a} />
                        <ValueRow label="Costo a 35 anni" value={fund.isc.isc35a} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FundDetailModal;