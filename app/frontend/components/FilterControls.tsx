import React, { useState } from 'react';
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
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300">
      <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Filtra e Confronta</h2>
        <button aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}>
           <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cerca per nome</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    type="text"
                    placeholder="Es. 'Alleata Bilanciata', 'Allianz', etc."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Società</label>
                <select
                  id="company"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 appearance-none"
                >
                  <option value="all">Tutte le società</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo Fondo</label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as PensionFund['type'] | 'all')}
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 appearance-none"
                >
                  <option value="all">Tutti i tipi</option>
                  <option value="PIP">PIP</option>
                  <option value="FPA">FPA</option>
                  <option value="FPN">FPN</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria Rischio</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as FundCategory | 'all')}
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 appearance-none"
                >
                  <option value="all">Tutte le categorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{CATEGORY_MAP[category]}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                  <button
                      onClick={onReset}
                      className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
                  >
                      Resetta Filtri
                  </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;