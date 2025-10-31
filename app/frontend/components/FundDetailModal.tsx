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
    <div className="flex justify-between items-center py-3">
      <p className="text-gray-600 dark:text-gray-300">{label}</p>
      <p className={`font-semibold ${color}`}>{displayValue}</p>
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
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        style={{ animationFillMode: 'forwards' }}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-gray-200 dark:border-slate-700 relative">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-slate-100">{fund.linea}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{fund.pip}</p>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 max-h-[85vh] overflow-y-auto">
            {/* Principal Info */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Società</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 truncate" title={fund.societa || ''}>{fund.societa || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{CATEGORY_MAP[fund.categoria]}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{fund.type}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">N° Albo</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{fund.nAlbo}</p>
                </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PerformanceChart selectedFunds={[fund]} theme={theme} isCompact />
                    <CostChart selectedFunds={[]} detailFund={fund} theme={theme} />
                </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Performance Storica</h3>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-4 text-sm">
                        <ValueRow label="Rendimento ultimo anno" value={fund.rendimenti.ultimoAnno} />
                        <ValueRow label="Rendimento medio 3 anni" value={fund.rendimenti.ultimi3Anni} />
                        <ValueRow label="Rendimento medio 5 anni" value={fund.rendimenti.ultimi5Anni} />
                        <ValueRow label="Rendimento medio 10 anni" value={fund.rendimenti.ultimi10Anni} />
                        <ValueRow label="Rendimento medio 20 anni" value={fund.rendimenti.ultimi20Anni} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Dettaglio Costi (ISC)</h3>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-4 text-sm">
                        <ValueRow label="Costo a 2 anni" value={fund.isc.isc2a} />
                        <ValueRow label="Costo a 5 anni" value={fund.isc.isc5a} />
                        <ValueRow label="Costo a 10 anni" value={fund.isc.isc10a} />
                        <ValueRow label="Costo a 35 anni" value={fund.isc.isc35a} />
                    </div>
                </div>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FundDetailModal;