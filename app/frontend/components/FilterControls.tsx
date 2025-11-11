import React, { useState, useEffect, useRef } from 'react';
import { FundCategory, PensionFund } from '../types';
import { CATEGORY_MAP } from '../constants';

interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: FundCategory | 'all';
  setSelectedCategory: (category: FundCategory | 'all') => void;
  categories: FundCategory[];
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  companies: string[];
  selectedType: PensionFund['type'] | 'all';
  setSelectedType: (t: PensionFund['type'] | 'all') => void;
  onReset: () => void;
  totalFunds?: number;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedCompany,
  setSelectedCompany,
  companies,
  selectedType,
  setSelectedType,
  onReset,
  totalFunds = 0
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setMobileFiltersOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Count active filters
  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== 'all' && selectedCategory,
    selectedCompany !== 'all' && selectedCompany,
    selectedType !== 'all' && selectedType
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3">
      {/* Desktop - All in one row */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <label htmlFor="search" className="sr-only">Cerca</label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Cerca fondi, società..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <select
          id="category_quick"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as FundCategory | 'all')}
          className="text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex-shrink-0 w-44"
        >
          <option value="all">Tutte le categorie</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{CATEGORY_MAP[cat]}</option>
          ))}
        </select>

        <select
          id="type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as PensionFund['type'] | 'all')}
          className="text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex-shrink-0 w-28"
        >
          <option value="all">Tutti i tipi</option>
          <option value="PIP">PIP</option>
          <option value="FPA">FPA</option>
          <option value="FPN">FPN</option>
        </select>

        <CompanyQuickSearch
          companies={companies}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          wrapperClassName="flex-shrink-0 w-36"
          inputClassName="px-2 py-1.5 w-full text-xs"
        />

        {activeFiltersCount > 0 && (
          <div className="inline-flex items-center px-2 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 text-xs rounded-full border border-sky-200 dark:border-slate-700 font-medium flex-shrink-0">
            {activeFiltersCount}
          </div>
        )}

        <button onClick={onReset} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 font-medium flex-shrink-0">
          Resetta
        </button>
      </div>

      {/* Mobile - Collapsible */}
      <div className="sm:hidden space-y-2">
        {/* Search bar */}
        <div className="flex-1 min-w-0">
          <label htmlFor="search-mobile" className="sr-only">Cerca</label>
          <div className="relative">
            <input
              id="search-mobile"
              type="text"
              placeholder="Cerca fondi, società..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMobileFiltersOpen(prev => !prev)}
            className="flex-1 inline-flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
          >
            <span>Filtri</span>
            <div className="flex items-center gap-1.5">
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200 text-xs font-bold h-5 w-5">
                  {activeFiltersCount}
                </span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          <button onClick={onReset} className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 font-semibold">
            Resetta
          </button>
        </div>

        {mobileFiltersOpen && (
          <div className="mt-2 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FundCategory | 'all')}
              className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Tutte le categorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_MAP[cat]}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as PensionFund['type'] | 'all')}
              className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Tutti i tipi</option>
              <option value="PIP">PIP</option>
              <option value="FPA">FPA</option>
              <option value="FPN">FPN</option>
            </select>

            <CompanyQuickSearch
              companies={companies}
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
              wrapperClassName="w-full"
              inputClassName="px-2 py-1.5 w-full text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;

// --- Compact searchable company combobox used in the compact header ---
interface CompanyQuickSearchProps {
  companies: string[];
  selectedCompany: string;
  setSelectedCompany: (c: string) => void;
  wrapperClassName?: string;
  inputClassName?: string;
}

const CompanyQuickSearch: React.FC<CompanyQuickSearchProps> = ({
  companies,
  selectedCompany,
  setSelectedCompany,
  wrapperClassName = 'w-40',
  inputClassName = 'w-full'
}) => {
  const [query, setQuery] = useState(selectedCompany === 'all' ? '' : selectedCompany || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // sync when external selection changes
    setQuery(selectedCompany === 'all' ? '' : selectedCompany || '');
  }, [selectedCompany]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('click', onOutside);
    return () => window.removeEventListener('click', onOutside);
  }, []);

  const normalized = (s: string) => (s || '').toLowerCase();
  const matches = query.trim() === ''
    ? companies.slice(0, 6)
    : companies.filter(c => normalized(c).includes(normalized(query))).slice(0, 8);

  const handleSelect = (c: string) => {
    setSelectedCompany(c);
    setQuery(c);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedCompany('all');
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${wrapperClassName}`} ref={containerRef}>
      <div className="flex items-center gap-1">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          placeholder="Società"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (matches.length > 0) handleSelect(matches[0]);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          className={`text-xs px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 ${inputClassName}`}
        />
        <button type="button" onClick={() => { if (selectedCompany === 'all') setIsOpen(s => !s); else clearSelection(); }} aria-label="clear or open" className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
          {selectedCompany && selectedCompany !== 'all' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          )}
        </button>
      </div>

      {isOpen && matches.length > 0 && (
        <ul className="absolute z-40 mt-1 w-full max-h-48 overflow-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-xs">
          <li className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-500 dark:text-slate-400" onClick={() => clearSelection()}>
            Tutte le società
          </li>
          {matches.map((c) => (
            <li key={c} className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" onClick={() => handleSelect(c)}>
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
