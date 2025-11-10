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

const LABEL_TO_RENDIMENTO_KEY: Record<string, keyof PensionFund['rendimenti']> = PERFORMANCE_PERIODS.reduce(
  (acc, period) => {
    acc[period.label] = period.key;
    return acc;
  },
  {} as Record<string, keyof PensionFund['rendimenti']>
);

const DEFAULT_SORT_LABEL = PERFORMANCE_PERIODS[0].label;

const getValueForLabel = (fund: PensionFund, label: string): number => {
  const key = LABEL_TO_RENDIMENTO_KEY[label] ?? 'ultimoAnno';
  const value = fund.rendimenti[key];
  if (typeof value === 'number') {
    return value;
  }
  return value != null ? Number(value) : Number.NEGATIVE_INFINITY;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ selectedFunds, theme, isCompact = false }) => {
  const tickColor = theme === 'dark' ? '#94a3b8' : '#475569'; // slate-400 for dark, slate-600 for light
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0'; // slate-700 for dark, slate-200 for light

  // Create stable color mapping
  const selectedFundIds = selectedFunds.map(f => f.id);
  const chartWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const showPlaceholder = selectedFunds.length === 0 && !isCompact;

  React.useLayoutEffect(() => {
    const element = chartWrapperRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(() => {});
    observer.observe(element);

    return () => observer.disconnect();
  }, [selectedFunds.length, isCompact]);

  const fundLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();
    selectedFunds.forEach(fund => {
      map.set(fund.id, formatFundLabel(fund));
    });
    return map;
  }, [selectedFunds]);

  const orderedFunds = React.useMemo(() => {
    return [...selectedFunds].sort(
      (a, b) => getValueForLabel(b, DEFAULT_SORT_LABEL) - getValueForLabel(a, DEFAULT_SORT_LABEL)
    );
  }, [selectedFunds]);

  const chartData = React.useMemo(() => {
    return PERFORMANCE_PERIODS.map(period => {
      const entries = Object.fromEntries(
        orderedFunds.map(fund => {
          const label = fundLabelMap.get(fund.id) ?? formatFundLabel(fund);
          return [label, fund.rendimenti[period.key]];
        })
      );
      return {
        name: period.label,
        [TFR_BENCHMARK.label]: period.benchmark,
        ...entries,
      };
    });
  }, [orderedFunds, fundLabelMap]);

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
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center">
        <div className="flex flex-col items-center justify-center h-96">
            <svg className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 38H58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
                <path d="M2 2H58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
                <rect x="8" y="22" width="8" height="16" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
                <rect x="20" y="14" width="8" height="24" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
                <rect x="32" y="28" width="8" height="10" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
                <rect x="44" y="8" width="8" height="30" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
            </svg>
            <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">Confronto Performance</h2>
            <p className="text-slate-500 dark:text-slate-400">Seleziona fino a 10 fondi dalla tabella per confrontarli qui.</p>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 dark:text-slate-500 mt-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={isCompact ? '' : 'p-4 md:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700'}>
      {isCompact ? (
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Performance (Rendimento medio annuo %)</h3>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Confronto Performance (Rendimento medio annuo %)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-bold">Come leggere la linea TFR:</span> La linea rossa mostra il rendimento medio del TFR lasciato in azienda (rivalutazione legale: 1.5% + 75% inflazione).
            <br/>
            <strong>Se un fondo è costantemente sopra questa linea, sta generando un rendimento superiore.</strong> È il tuo punto di riferimento per valutare se l'investimento conviene.
          </p>
        </>
      )}
      <div ref={chartWrapperRef} style={{ width: '100%', height: isCompact ? 300 : 400 }}>
        <ResponsiveContainer>
          <BarChart 
            data={chartData} 
            margin={isCompact ? { top: 5, right: 30, left: 0, bottom: 5 } : { top: 5, right: 20, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: isCompact ? 10 : 14 }} dy={isCompact ? 5 : 10} />
            <YAxis unit="%" tick={{ fill: tickColor, fontSize: isCompact ? 10 : 12 }} />
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
            {orderedFunds.map((fund) => {
                 const label = fundLabelMap.get(fund.id);
                 if (!label) {
                   return null;
                 }
                 const color = getColorForFund(fund.id, selectedFundIds);
                 return <Bar key={fund.id} dataKey={label} fill={color} />;
            })}
            <Line type="monotone" dataKey={TFR_BENCHMARK.label} stroke={BENCHMARK_COLOR} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
