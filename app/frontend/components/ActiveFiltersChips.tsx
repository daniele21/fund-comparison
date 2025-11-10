import React from 'react';
import { FundCategory, PensionFund } from '../types';
import { CATEGORY_MAP } from '../constants';

interface ActiveFiltersChipsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: FundCategory | 'all';
  setSelectedCategory: (category: FundCategory | 'all') => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  selectedType: PensionFund['type'] | 'all';
  setSelectedType: (t: PensionFund['type'] | 'all') => void;
  onResetAll: () => void;
}

const ActiveFiltersChips: React.FC<ActiveFiltersChipsProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCompany,
  setSelectedCompany,
  selectedType,
  setSelectedType,
  onResetAll
}) => {
  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedCompany !== 'all' || selectedType !== 'all';

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-1">
          Filtri attivi:
        </span>
        
        {selectedCompany !== 'all' && (
          <button
            onClick={() => setSelectedCompany('all')}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 dark:bg-sky-900/30 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
          >
            <span>Società: {selectedCompany}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {selectedType !== 'all' && (
          <button
            onClick={() => setSelectedType('all')}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 dark:bg-sky-900/30 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
          >
            <span>Tipo: {selectedType}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 dark:bg-sky-900/30 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
          >
            <span>Categoria: {CATEGORY_MAP[selectedCategory]}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 dark:bg-sky-900/30 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
          >
            <span>Cerca: &quot;{searchTerm.length > 20 ? searchTerm.substring(0, 20) + '...' : searchTerm}&quot;</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <button
          onClick={onResetAll}
          className="ml-auto text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium transition-colors"
        >
          Azzera tutti
        </button>
      </div>
    </div>
  );
};

export default ActiveFiltersChips;
