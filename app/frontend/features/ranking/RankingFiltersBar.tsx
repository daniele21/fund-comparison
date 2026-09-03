import React from 'react';
import type { CapitalGuaranteeFilter, FundCategory, FundType } from '../../types';
import { CATEGORY_MAP } from '../../constants';
import type { RankingFilters } from '../../utils/fundRanking';

interface RankingFiltersBarProps {
  filters: RankingFilters;
  categories: FundCategory[];
  onChange: (filters: RankingFilters) => void;
}

const RankingFiltersBar: React.FC<RankingFiltersBarProps> = ({ filters, categories, onChange }) => {
  const updateFilter = <Key extends keyof RankingFilters,>(key: Key, value: RankingFilters[Key]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Filtri ranking</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Restringi le classifiche per categoria, sostenibilita, garanzia o stato di adesione.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end xl:flex-nowrap">
          <select
            value={filters.fundType}
            onChange={(event) => updateFilter('fundType', event.target.value as FundType | 'all')}
            aria-label="Tipo fondo nel ranking"
            className="min-h-11 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 pr-7 text-sm font-medium text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand-primary-rgb)/1)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:min-w-[7rem]"
          >
            <option value="all">Tutti i tipi</option>
            <option value="PIP">PIP</option>
            <option value="FPA">FPA</option>
            <option value="FPN">FPN</option>
          </select>
          <select
            value={filters.category}
            onChange={(event) => updateFilter('category', event.target.value as FundCategory | 'all')}
            aria-label="Categoria ranking"
            className="min-h-11 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 pr-7 text-sm font-medium text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand-primary-rgb)/1)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:min-w-[12rem]"
          >
            <option value="all">Tutte le categorie</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_MAP[category]}
              </option>
            ))}
          </select>
          <select
            value={filters.capitalGuarantee}
            onChange={(event) => updateFilter('capitalGuarantee', event.target.value as CapitalGuaranteeFilter)}
            aria-label="Garanzia del capitale nel ranking"
            className="min-h-11 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 pr-7 text-sm font-medium text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand-primary-rgb)/1)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:min-w-[11rem]"
          >
            <option value="all">Tutte le garanzie</option>
            <option value="with-guarantee">Con garanzia</option>
            <option value="without-guarantee">Senza garanzia</option>
          </select>
          <ToggleFilter
            checked={filters.onlyEsg}
            label="Solo fondi ESG"
            onChange={(checked) => updateFilter('onlyEsg', checked)}
          />
          <ToggleFilter
            checked={filters.includeClosedFunds}
            label="Includi fondi chiusi"
            onChange={(checked) => updateFilter('includeClosedFunds', checked)}
          />
        </div>
      </div>
    </div>
  );
};

interface ToggleFilterProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

const ToggleFilter: React.FC<ToggleFilterProps> = ({ checked, label, onChange }) => {
  return (
    <label className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-[rgb(var(--brand-primary-rgb)/1)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[rgb(var(--brand-primary-rgb)/1)] dark:bg-slate-700" />
        <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </label>
  );
};

export default RankingFiltersBar;
