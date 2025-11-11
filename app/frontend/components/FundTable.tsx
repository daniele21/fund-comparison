import React from 'react';
import { PensionFund, SortConfig, SortableKey } from '../types';
import { CATEGORY_MAP, CATEGORY_COLORS } from '../constants';

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
    <>
        {/* Desktop Table */}
        <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur z-10 shadow-sm">
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
                            <tr 
                                key={fund.id} 
                                className={`transition-colors duration-200 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer ${
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
                                    <div className="text-sm font-semibold text-sky-600 hover:underline dark:text-sky-400 truncate" title={fund.linea}>{fund.linea}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate" title={fund.pip}>{fund.pip}</div>
                                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate" title={fund.societa ?? ''}>{fund.societa}</div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                                    <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                        {CATEGORY_MAP[fund.categoria]}
                                    </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                                    <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
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
                            </tr>
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
        <div className="lg:hidden space-y-3">
            {funds.length > 0 ? funds.map(fund => (
                <div key={fund.id} className="relative bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 active:scale-[0.98]">
                    {/* Category Color Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${CATEGORY_COLORS[fund.categoria]}`}></div>
                    
                    {/* Card Header with Checkbox */}
                    <div className="flex items-start gap-2.5 p-3 pb-2">
                        <div 
                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0 active:bg-slate-200 dark:active:bg-slate-600 transition-colors"
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
                                className="h-4.5 w-4.5 text-sky-600 bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-500 rounded focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                aria-label={`Seleziona ${fund.linea}`}
                            />
                        </div>
                        
                        <div className="flex-grow min-w-0">
                            <div onClick={() => onFundClick(fund)} className="active:opacity-70 transition-opacity">
                                <h3 className="text-sm font-bold text-sky-600 dark:text-sky-400 leading-snug mb-0.5 truncate">
                                    {fund.linea}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-0.5">
                                    {fund.pip}
                                </p>
                                {fund.societa && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                                        {fund.societa}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                        <span className="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
                            {CATEGORY_MAP[fund.categoria]}
                        </span>
                        <span className="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                            {fund.type}
                        </span>
                    </div>

                    {/* Key Metrics Grid - More Compact */}
                    <div className="grid grid-cols-2 gap-2 px-3 pb-2">
                        {/* Cost Metric */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Costo Annuo</p>
                            <p className="text-base font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                                {fund.costoAnnuo !== null ? `${fund.costoAnnuo.toFixed(2)}%` : 'N/A'}
                            </p>
                        </div>
                        
                        {/* Best Return Metric (5Y) */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Rend. 5A</p>
                            <p className={`text-base font-bold tabular-nums ${
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
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-3 py-2.5">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Rendimenti Storici
                        </p>
                        <div className="grid grid-cols-3 gap-2">
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
                                <div className="text-center col-span-3 pt-1 border-t border-slate-200 dark:border-slate-700 mt-1">
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
                        className="w-full py-2 text-center text-xs font-medium text-sky-600 dark:text-sky-400 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:bg-slate-200 dark:active:bg-slate-700 flex items-center justify-center gap-1"
                    >
                        <span>Vedi dettagli</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )) : (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold text-lg mb-2">Nessun fondo trovato</p>
                    <p className="text-sm">Prova a modificare i filtri per trovare quello che cerchi.</p>
                </div>
            )}
        </div>
    </>
  );
};

export default FundTable;