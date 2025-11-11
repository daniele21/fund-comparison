import React from 'react';
import { PensionFund } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import type { TooltipPayload } from 'recharts';
import { getColorForFund } from '../utils/colorMapping';
import { formatFundLabel } from '../utils/fundLabel';
import ChartTooltip from './ChartTooltip';

interface PerformanceChartProps {
  selectedFunds: PensionFund[];
  theme: string;
  isCompact?: boolean;
}

const BENCHMARK_COLOR = '#e11d48'; // A distinct rose for the benchmark

// TFR revaluation rates based on historical ISTAT FOI data.
// The rate is calculated annually as 1.5% + 75% of the inflation rate.
// Multi-year values are geometric means of the annual rates.
const TFR_BENCHMARK = {
  ultimoAnno: 9.97,     // 2023
  ultimi3Anni: 6.69,    // 2021-2023 Average
  ultimi5Anni: 4.54,    // 2019-2023 Average
  ultimi10Anni: 2.91,   // 2014-2023 Average
  ultimi20Anni: 3.10,   // 2004-2023 Average
  label: 'Benchmark TFR',
};

const PERFORMANCE_PERIODS = [
  { label: 'Ultimo Anno', key: 'ultimoAnno' as const, benchmark: TFR_BENCHMARK.ultimoAnno },
  { label: 'Ultimi 3 Anni', key: 'ultimi3Anni' as const, benchmark: TFR_BENCHMARK.ultimi3Anni },
  { label: 'Ultimi 5 Anni', key: 'ultimi5Anni' as const, benchmark: TFR_BENCHMARK.ultimi5Anni },
  { label: 'Ultimi 10 Anni', key: 'ultimi10Anni' as const, benchmark: TFR_BENCHMARK.ultimi10Anni },
  { label: 'Ultimi 20 Anni', key: 'ultimi20Anni' as const, benchmark: TFR_BENCHMARK.ultimi20Anni },
];

const PerformanceChart: React.FC<PerformanceChartProps> = ({ selectedFunds, theme, isCompact = false }) => {
  const tickColor = theme === 'dark' ? '#94a3b8' : '#475569'; // slate-400 for dark, slate-600 for light
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0'; // slate-700 for dark, slate-200 for light

  // Detect if we're on mobile
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create stable color mapping
  const selectedFundIds = selectedFunds.map(f => f.id);
  const chartWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const showPlaceholder = selectedFunds.length === 0 && !isCompact;

  const fundLabels = React.useMemo(() => selectedFunds.map(formatFundLabel), [selectedFunds]);

  const chartData = React.useMemo(() => {
    return PERFORMANCE_PERIODS.map(period => {
      const entries = Object.fromEntries(
        selectedFunds.map((fund, index) => [fundLabels[index], fund.rendimenti[period.key]])
      );
      return {
        name: period.label,
        [TFR_BENCHMARK.label]: period.benchmark,
        ...entries,
      };
    });
  }, [selectedFunds, fundLabels]);

  const performanceTooltipSorter = React.useCallback(
    (a: TooltipPayload, b: TooltipPayload) => {
      if (a.dataKey === TFR_BENCHMARK.label) return -1;
      if (b.dataKey === TFR_BENCHMARK.label) return 1;
      const aValue = typeof a.value === 'number' ? a.value : parseFloat(String(a.value));
      const bValue = typeof b.value === 'number' ? b.value : parseFloat(String(b.value));
      return (bValue || 0) - (aValue || 0);
    },
    []
  );
  if (showPlaceholder) {
    return (
      <div className="p-3 sm:p-4 md:p-6 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
        <div className="flex flex-col items-center justify-center h-48 sm:h-64 md:h-96">
            <svg className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-slate-300 dark:text-slate-600 mb-2 sm:mb-3 md:mb-4" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 38H58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
                <path d="M2 2H58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
                <rect x="8" y="22" width="8" height="16" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
                <rect x="20" y="14" width="8" height="24" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
                <rect x="32" y="28" width="8" height="10" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
                <rect x="44" y="8" width="8" height="30" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
            </svg>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-1 text-slate-800 dark:text-slate-200">Confronto Performance</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 px-3 sm:px-4">Seleziona fino a 10 fondi dalla tabella per confrontarli qui.</p>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-slate-400 dark:text-slate-500 mt-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isCompact ? '' : 'p-2 sm:p-3 md:p-4 lg:p-6 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700'} min-w-0 overflow-hidden`}>
      {isCompact ? (
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3 md:mb-4 px-1">Performance (Rendimento medio annuo %)</h3>
      ) : (
        <>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-200 px-1">Confronto Performance (Rendimento medio annuo %)</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2 sm:mb-3 md:mb-4 bg-slate-50 dark:bg-slate-700/50 p-2 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-700 mt-2">
            <span className="font-bold">Come leggere la linea TFR:</span> La linea rossa mostra il rendimento medio del TFR lasciato in azienda (rivalutazione legale: 1.5% + 75% inflazione).
            {!isMobile && (
              <>
                <br/>
                <strong>Se un fondo è costantemente sopra questa linea, sta generando un rendimento superiore.</strong> È il tuo punto di riferimento per valutare se l'investimento conviene.
              </>
            )}
          </p>
        </>
      )}
      <div ref={chartWrapperRef} className="min-w-0" style={{ width: '100%', height: isMobile ? (isCompact ? 200 : 250) : (isCompact ? 280 : 380) }}>
        <ResponsiveContainer>
          <BarChart 
            data={chartData} 
            margin={
              isMobile 
                ? { top: 10, right: 5, left: -25, bottom: 5 } 
                : (isCompact ? { top: 10, right: 20, left: -5, bottom: 5 } : { top: 10, right: 20, left: -5, bottom: 20 })
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: tickColor, fontSize: isMobile ? 8 : (isCompact ? 9 : 12) }} 
              dy={isMobile ? 5 : (isCompact ? 5 : 10)}
              angle={isMobile ? -30 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 55 : (isCompact ? 50 : undefined)}
            />
            <YAxis 
              unit="%" 
              tick={{ fill: tickColor, fontSize: isMobile ? 8 : (isCompact ? 9 : 11) }}
              width={isMobile ? 30 : (isCompact ? 35 : 40)}
            />
            <Tooltip
              content={
                <ChartTooltip
                  sorter={performanceTooltipSorter}
                  highlightKey={TFR_BENCHMARK.label}
                  highlightColor={BENCHMARK_COLOR}
                />
              }
              cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
              wrapperStyle={{ pointerEvents: 'auto', opacity: 1, zIndex: 9999 }}
            />
            {selectedFunds.map((fund, index) => {
                 const label = fundLabels[index];
                 const color = getColorForFund(fund.id, selectedFundIds);
                 return <Bar key={fund.id} dataKey={label} fill={color} radius={isMobile ? [3, 3, 0, 0] : [4, 4, 0, 0]} />;
            })}
            <Line 
              type="monotone" 
              dataKey={TFR_BENCHMARK.label} 
              stroke={BENCHMARK_COLOR} 
              strokeWidth={isMobile ? 2 : 2.5} 
              dot={{ r: isMobile ? 2.5 : 4 }} 
              activeDot={{ r: isMobile ? 4 : 6 }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
