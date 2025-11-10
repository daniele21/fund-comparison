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
                            <th className="px-3 py-3"></th>
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
        <div className="lg:hidden mb-4 flex items-end justify-between gap-3">
            <div className="flex-grow">
                <label htmlFor="mobile-sort" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ordina per</label>
                <select
                    id="mobile-sort"
                    value={sortConfig.key}
                    onChange={(e) => {
                        const newKey = e.target.value as SortableKey;
                        // Use functional update to prevent race conditions and ensure state consistency.
                        setSortConfig(prev => ({ key: newKey, direction: 'descending' }));
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 text-sm appearance-none"
                >
                    <option value="ultimoAnno">Rend. 1A</option>
                    <option value="ultimi5Anni">Rend. 5A</option>
                    <option value="ultimi10Anni">Rend. 10A</option>
                    <option value="costoAnnuo">Costo Annuo</option>
                    <option value="linea">Fondo</option>
                    <option value="type">Tipo</option>
                    <option value="categoria">Categoria</option>
                    <option value="ultimi3Anni">Rend. 3A</option>
                    <option value="ultimi20Anni">Rend. 20A</option>
                </select>
            </div>
            <button
                onClick={() => {
                    setSortConfig(prevConfig => ({
                        key: prevConfig.key,
                        direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
                    }));
                }}
                className="p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="Inverti ordine"
            >
                {sortConfig.direction === 'ascending' ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>
        </div>
        
        {/* Mobile Card List */}
        <div className="lg:hidden space-y-3">
            {funds.length > 0 ? funds.map(fund => (
                <div key={fund.id} className="relative bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-3 pl-5 transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${CATEGORY_COLORS[fund.categoria]}`}></div>
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            checked={selectedFundIds.has(fund.id)}
                            onChange={() => toggleFundSelection(fund.id)}
                            disabled={!selectedFundIds.has(fund.id) && selectedFundIds.size >= 10}
                            className="h-5 w-5 text-sky-600 bg-gray-100 border-slate-300 dark:bg-slate-600 dark:border-slate-500 rounded focus:ring-sky-500 mt-1 mr-3 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex-grow">
                            <div className="cursor-pointer" onClick={() => onFundClick(fund)}>
                                <h3 className="text-md font-bold text-sky-600 dark:text-sky-400 hover:underline">{fund.linea}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{fund.pip}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mb-2">{fund.societa}</p>
                            </div>
                            <div className="space-y-1 border-t border-slate-200 dark:border-slate-700 pt-2">
                                <div className="flex justify-between w-full text-sm">
                                    <span className="font-semibold text-slate-500 dark:text-slate-400 mr-2">Costo Annuo:</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{fund.costoAnnuo !== null ? `${fund.costoAnnuo.toFixed(2)}%` : 'N/A'}</span>
                                </div>
                                <RendimentoCell value={fund.rendimenti.ultimoAnno} label="Rend. 1A" isMobile />
                                <RendimentoCell value={fund.rendimenti.ultimi3Anni} label="Rend. 3A" isMobile />
                                <RendimentoCell value={fund.rendimenti.ultimi5Anni} label="Rend. 5A" isMobile highlight />
                                <RendimentoCell value={fund.rendimenti.ultimi10Anni} label="Rend. 10A" isMobile highlight />
                                <RendimentoCell value={fund.rendimenti.ultimi20Anni} label="Rend. 20A" isMobile highlight />
                            </div>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                    <p className="font-semibold">Nessun fondo trovato</p>
                    <p className="text-sm">Prova a modificare i filtri per trovare quello che cerchi.</p>
                </div>
            )}
        </div>
    </>
  );
};

export default FundTable;