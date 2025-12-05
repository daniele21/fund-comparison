import React, { useRef } from 'react';
import { PensionFund, SortConfig, SortableKey } from '../types';
import { CATEGORY_MAP, CATEGORY_COLORS } from '../constants';
import { motion, useInView } from 'framer-motion';

interface FundTableProps {
  funds: PensionFund[];
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig | ((prevConfig: SortConfig) => SortConfig)) => void;
  selectedFundIds: Set<string>;
  toggleFundSelection: (fundId: string) => void;
  onFundClick: (fund: PensionFund) => void;
}

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
  if (!direction) {
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
  }
  if (direction === 'ascending') {
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
  }
  return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
};

// Animated table row component
const AnimatedTableRow: React.FC<{
  children: React.ReactNode;
  index: number;
  className?: string;
  onClick?: () => void;
}> = ({ children, index, className, onClick }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.tr
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.tr>
  );
};

// Animated mobile card component
const AnimatedMobileCard: React.FC<{
  children: React.ReactNode;
  index: number;
}> = ({ children, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortableKey;
    sortConfig: SortConfig;
    setSortConfig: (config: SortConfig | ((prevConfig: SortConfig) => SortConfig)) => void;
    className?: string;
    align?: 'left' | 'center' | 'right';
}> = ({ label, sortKey, sortConfig, setSortConfig, className, align = 'left' }) => {
  const isSorted = sortConfig.key === sortKey;
  const direction = isSorted ? sortConfig.direction : undefined;

  const handleClick = () => {
    setSortConfig(prevConfig => {
      const isCurrentlySorted = prevConfig.key === sortKey;
      const newDirection = (isCurrentlySorted && prevConfig.direction === 'descending') ? 'ascending' : 'descending';
      return { key: sortKey, direction: newDirection };
    });
  };
  
  const alignmentClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  const textAlign = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  
    return (
        <th className={`py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider ${textAlign} ${className}`}>
            <button
                type="button"
                onClick={handleClick}
                className={`w-full ${textAlign} cursor-pointer select-none flex items-center ${alignmentClass} focus:outline-none group`}
                aria-pressed={isSorted}
                aria-label={`Ordina per ${label}`}
            >
                {label}
                <span className={`ml-2 transition-opacity ${isSorted ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                    <SortIcon direction={direction} />
                </span>
            </button>
        </th>
    );
};

const RendimentoCell: React.FC<{ value: number | null; label?: string; isMobile?: boolean, highlight?: boolean }> = ({ value, label, isMobile = false, highlight = false }) => {
    const color = value === null ? 'text-slate-400 dark:text-slate-500' : value >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500';
    const fontClass = highlight ? 'font-bold' : 'font-medium';
    
    const content = (
        <>
            {label && <span className={`text-slate-500 dark:text-slate-400 mr-2 ${highlight ? 'font-semibold' : ''}`}>{label}:</span>}
            <span className={`${fontClass} ${color} tabular-nums`}>{value !== null ? `${value.toFixed(2)}%` : 'N/A'}</span>
        </>
    );

    if (isMobile) {
        return <div className="flex justify-between w-full items-baseline text-sm">{content}</div>
    }

    return <td className="px-2 py-4 whitespace-nowrap text-sm text-right">{content}</td>;
};


const FundTable: React.FC<FundTableProps> = ({ funds, sortConfig, setSortConfig, selectedFundIds, toggleFundSelection, onFundClick }) => {
  return (
    <div className="w-full min-w-0 space-y-4">
        {/* Desktop Table */}
        <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 backdrop-blur z-10 shadow-sm">
                        <tr>
                            <SortableHeader label="Selezione" sortKey="selected" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-3" align="center" />
                            <SortableHeader label="Fondo" sortKey="linea" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-3" align="left" />
                            <SortableHeader label="Categoria" sortKey="categoria" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-3" align="left" />
                            <SortableHeader label="Tipo" sortKey="type" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-3" align="left" />
                            <SortableHeader label="Costo Annuo" sortKey="costoAnnuo" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-2" align="right" />
                            <SortableHeader label="Rend. 1A" sortKey="ultimoAnno" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-2" align="right" />
                            <SortableHeader label="Rend. 3A" sortKey="ultimi3Anni" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-2" align="right" />
                            <SortableHeader label="Rend. 5A" sortKey="ultimi5Anni" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-2" align="right" />
                            <SortableHeader label="Rend. 10A" sortKey="ultimi10Anni" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-2" align="right" />
                            <SortableHeader label="Rend. 20A" sortKey="ultimi20Anni" sortConfig={sortConfig} setSortConfig={setSortConfig} className="px-2" align="right" />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {funds.length > 0 ? funds.map((fund, index) => (
                            <AnimatedTableRow
                                key={fund.id}
                                index={index}
                                className={`transition-all duration-200 ease-in-out hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer hover:shadow-sm ${
                                    index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'
                                }`}
                                onClick={() => toggleFundSelection(fund.id)}
                            >
                                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedFundIds.has(fund.id)}
                                        onChange={() => toggleFundSelection(fund.id)}
                                        disabled={!selectedFundIds.has(fund.id) && selectedFundIds.size >= 10}
                                        className="h-4 w-4 text-sky-600 bg-gray-100 border-slate-300 dark:bg-slate-600 dark:border-slate-500 rounded focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap max-w-sm" onClick={(e) => { e.stopPropagation(); onFundClick(fund); }}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 truncate transition-colors" title={fund.linea}>{fund.linea}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate" title={fund.pip}>{fund.pip}</div>
                                            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate" title={fund.societa ?? ''}>{fund.societa}</div>
                                        </div>
                                        {fund.sitoWeb && (
                                            <a
                                                href={fund.sitoWeb.startsWith('http://') || fund.sitoWeb.startsWith('https://') ? fund.sitoWeb : `https://${fund.sitoWeb}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="shrink-0 p-1.5 rounded-full hover:bg-sky-100 dark:hover:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                                                title="Visita sito web"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                        {CATEGORY_MAP[fund.categoria]}
                                    </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                        {fund.type}
                                    </span>
                                </td>
                                <td className="px-2 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium text-right tabular-nums">
                                    {fund.costoAnnuo !== null ? `${fund.costoAnnuo.toFixed(2)}%` : 'N/A'}
                                </td>
                                <RendimentoCell value={fund.rendimenti.ultimoAnno} />
                                <RendimentoCell value={fund.rendimenti.ultimi3Anni} />
                                <RendimentoCell value={fund.rendimenti.ultimi5Anni} />
                                <RendimentoCell value={fund.rendimenti.ultimi10Anni} />
                                <RendimentoCell value={fund.rendimenti.ultimi20Anni} />
                            </AnimatedTableRow>
                        )) : (
                            <tr>
                                <td colSpan={10} className="text-center py-16 text-slate-500 dark:text-slate-400">
                                    <p className="font-semibold">Nessun fondo trovato</p>
                                    <p className="text-sm">Prova a modificare i filtri per trovare quello che cerchi.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Mobile Sort Controls */}
        <div className="lg:hidden mb-5">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <label htmlFor="mobile-sort" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        Ordina per
                    </label>
                    <button
                        onClick={() => {
                            setSortConfig(prevConfig => ({
                                key: prevConfig.key,
                                direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
                            }));
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors active:scale-95 flex items-center gap-1.5"
                        aria-label="Inverti ordine"
                    >
                        {sortConfig.direction === 'ascending' ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                </svg>
                                <span className="hidden sm:inline">Crescente</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                                <span className="hidden sm:inline">Decrescente</span>
                            </>
                        )}
                    </button>
                </div>
                <select
                    id="mobile-sort"
                    value={sortConfig.key}
                    onChange={(e) => {
                        const newKey = e.target.value as SortableKey;
                        setSortConfig(prev => ({ key: newKey, direction: 'descending' }));
                    }}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 text-sm font-medium cursor-pointer"
                >
                    <optgroup label="Rendimenti">
                        <option value="ultimoAnno">📈 Rendimento 1 Anno</option>
                        <option value="ultimi3Anni">📈 Rendimento 3 Anni</option>
                        <option value="ultimi5Anni">📈 Rendimento 5 Anni</option>
                        <option value="ultimi10Anni">📈 Rendimento 10 Anni</option>
                        <option value="ultimi20Anni">📈 Rendimento 20 Anni</option>
                    </optgroup>
                    <optgroup label="Altri">
                        <option value="costoAnnuo">💰 Costo Annuo</option>
                        <option value="selected">✓ Selezionati</option>
                        <option value="linea">🏢 Nome Fondo</option>
                        <option value="type">📋 Tipo</option>
                        <option value="categoria">🏷️ Categoria</option>
                    </optgroup>
                </select>
            </div>
        </div>
        
        {/* Mobile Card List */}
        <div className="lg:hidden space-y-2.5 sm:space-y-3">
            {funds.length > 0 ? funds.map((fund, index) => (
                <AnimatedMobileCard key={fund.id} index={index}>
                    <div className="relative bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 active:scale-[0.99]">
                    {/* Category Color Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${CATEGORY_COLORS[fund.categoria]}`}></div>
                    
                    {/* Card Header with Checkbox */}
                    <div className="flex items-start gap-3 p-3 sm:p-4 pb-2 sm:pb-2.5">
                        <div 
                            className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 shrink-0 active:scale-95 transition-all shadow-sm border border-slate-200 dark:border-slate-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFundSelection(fund.id);
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedFundIds.has(fund.id)}
                                onChange={() => {}}
                                disabled={!selectedFundIds.has(fund.id) && selectedFundIds.size >= 10}
                                className="h-5 w-5 text-sky-600 bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-500 rounded-md focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                                aria-label={`Seleziona ${fund.linea}`}
                            />
                        </div>
                        
                        <div className="flex-grow min-w-0">
                            <div onClick={() => onFundClick(fund)} className="active:opacity-70 transition-opacity">
                                <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-slate-50 leading-snug mb-1 truncate">
                                    {fund.linea}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mb-1 font-medium">
                                    {fund.pip}
                                </p>
                                {fund.societa && (
                                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-semibold truncate">
                                        {fund.societa}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 pb-2.5 sm:pb-3">
                        {/* Fund Type Badge with Icon */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm border border-indigo-400/20 h-[26px]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-[11px] font-bold tracking-wide uppercase leading-none whitespace-nowrap">{fund.type}</span>
                        </div>
                        
                        {/* Category Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-200 dark:border-sky-700/50 h-[26px]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-[11px] font-bold tracking-wide leading-none whitespace-nowrap">{CATEGORY_MAP[fund.categoria]}</span>
                        </div>
                        
                        {/* Website Link Badge */}
                        {fund.sitoWeb && (
                            <a
                                href={fund.sitoWeb.startsWith('http://') || fund.sitoWeb.startsWith('https://') ? fund.sitoWeb : `https://${fund.sitoWeb}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-sm border border-emerald-400/20 transition-all active:scale-95 h-[26px]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span className="text-[11px] font-bold tracking-wide uppercase leading-none whitespace-nowrap">Sito</span>
                            </a>
                        )}
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 px-2.5 sm:px-3 pb-1.5 sm:pb-2">
                        {/* Cost Metric */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 sm:p-2.5">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Costo Annuo</p>
                            <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                                {fund.costoAnnuo !== null ? `${fund.costoAnnuo.toFixed(2)}%` : 'N/A'}
                            </p>
                        </div>
                        
                        {/* Best Return Metric (5Y) */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 sm:p-2.5">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Rend. 5A</p>
                            <p className={`text-base sm:text-lg font-bold tabular-nums ${
                                fund.rendimenti.ultimi5Anni === null 
                                    ? 'text-slate-400 dark:text-slate-500' 
                                    : fund.rendimenti.ultimi5Anni >= 0 
                                        ? 'text-emerald-600 dark:text-emerald-500' 
                                        : 'text-rose-600 dark:text-rose-500'
                            }`}>
                                {fund.rendimenti.ultimi5Anni !== null ? `${fund.rendimenti.ultimi5Anni.toFixed(1)}%` : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* All Performance Metrics - Compact Grid */}
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-2.5 sm:px-3 py-2 sm:py-2.5">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                            Rendimenti Storici
                        </p>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                            {/* 1 Year */}
                            <div className="text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">1A</p>
                                <p className={`text-sm font-bold tabular-nums ${
                                    fund.rendimenti.ultimoAnno === null 
                                        ? 'text-slate-400 dark:text-slate-500' 
                                        : fund.rendimenti.ultimoAnno >= 0 
                                            ? 'text-emerald-600 dark:text-emerald-500' 
                                            : 'text-rose-600 dark:text-rose-500'
                                }`}>
                                    {fund.rendimenti.ultimoAnno !== null ? `${fund.rendimenti.ultimoAnno.toFixed(1)}%` : 'N/A'}
                                </p>
                            </div>
                            
                            {/* 3 Years */}
                            <div className="text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">3A</p>
                                <p className={`text-sm font-bold tabular-nums ${
                                    fund.rendimenti.ultimi3Anni === null 
                                        ? 'text-slate-400 dark:text-slate-500' 
                                        : fund.rendimenti.ultimi3Anni >= 0 
                                            ? 'text-emerald-600 dark:text-emerald-500' 
                                            : 'text-rose-600 dark:text-rose-500'
                                }`}>
                                    {fund.rendimenti.ultimi3Anni !== null ? `${fund.rendimenti.ultimi3Anni.toFixed(1)}%` : 'N/A'}
                                </p>
                            </div>
                            
                            {/* 10 Years */}
                            <div className="text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">10A</p>
                                <p className={`text-sm font-bold tabular-nums ${
                                    fund.rendimenti.ultimi10Anni === null 
                                        ? 'text-slate-400 dark:text-slate-500' 
                                        : fund.rendimenti.ultimi10Anni >= 0 
                                            ? 'text-emerald-600 dark:text-emerald-500' 
                                            : 'text-rose-600 dark:text-rose-500'
                                }`}>
                                    {fund.rendimenti.ultimi10Anni !== null ? `${fund.rendimenti.ultimi10Anni.toFixed(1)}%` : 'N/A'}
                                </p>
                            </div>
                            
                            {/* 20 Years - if available, show in separate row */}
                            {fund.rendimenti.ultimi20Anni !== null && (
                                <div className="text-center col-span-3 pt-1.5 border-t border-slate-200 dark:border-slate-700 mt-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">20A</p>
                                    <p className={`text-sm font-bold tabular-nums ${
                                        fund.rendimenti.ultimi20Anni >= 0 
                                            ? 'text-emerald-600 dark:text-emerald-500' 
                                            : 'text-rose-600 dark:text-rose-500'
                                    }`}>
                                        {fund.rendimenti.ultimi20Anni.toFixed(1)}%
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tap to view details hint */}
                    <button
                        onClick={() => onFundClick(fund)}
                        className="w-full py-2.5 text-center text-xs font-medium text-sky-600 dark:text-sky-400 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:bg-slate-200 dark:active:bg-slate-700 flex items-center justify-center gap-1.5"
                    >
                        <span>Vedi dettagli</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                </AnimatedMobileCard>
            )) : (
                <div className="text-center py-12 sm:py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">Nessun fondo trovato</p>
                    <p className="text-xs sm:text-sm">Prova a modificare i filtri per trovare quello che cerchi.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default FundTable;
