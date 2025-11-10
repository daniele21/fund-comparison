import React from 'react';
import { PensionFund } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { CHART_COLORS, getColorForFund } from '../utils/colorMapping';

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


const PerformanceChart: React.FC<PerformanceChartProps> = ({ selectedFunds, theme, isCompact = false }) => {
  const tickColor = theme === 'dark' ? '#94a3b8' : '#475569'; // slate-400 for dark, slate-600 for light
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0'; // slate-700 for dark, slate-200 for light

  // Create stable color mapping
  const selectedFundIds = selectedFunds.map(f => f.id);

  // Don't show placeholder in compact mode as it's for the modal which always has a fund
  if (selectedFunds.length === 0 && !isCompact) {
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
  
  // Create labels that include fund name and società for better identification
  const fundLabels = selectedFunds.map(f => {
    const societaPart = f.societa ? ` (${f.societa})` : '';
    return `${f.pip} - ${f.linea}${societaPart}`;
  });

  const chartData = [
    { name: 'Ultimo Anno', [TFR_BENCHMARK.label]: TFR_BENCHMARK.ultimoAnno, ...Object.fromEntries(selectedFunds.map((f, i) => [fundLabels[i], f.rendimenti.ultimoAnno])) },
    { name: 'Ultimi 3 Anni', [TFR_BENCHMARK.label]: TFR_BENCHMARK.ultimi3Anni, ...Object.fromEntries(selectedFunds.map((f, i) => [fundLabels[i], f.rendimenti.ultimi3Anni])) },
    { name: 'Ultimi 5 Anni', [TFR_BENCHMARK.label]: TFR_BENCHMARK.ultimi5Anni, ...Object.fromEntries(selectedFunds.map((f, i) => [fundLabels[i], f.rendimenti.ultimi5Anni])) },
    { name: 'Ultimi 10 Anni', [TFR_BENCHMARK.label]: TFR_BENCHMARK.ultimi10Anni, ...Object.fromEntries(selectedFunds.map((f, i) => [fundLabels[i], f.rendimenti.ultimi10Anni])) },
    // FIX: Added 20-year data to the chart.
    { name: 'Ultimi 20 Anni', [TFR_BENCHMARK.label]: TFR_BENCHMARK.ultimi20Anni, ...Object.fromEntries(selectedFunds.map((f, i) => [fundLabels[i], f.rendimenti.ultimi20Anni])) },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Sort payload to show benchmark first, then funds
      const sortedPayload = [...payload].sort((a, b) => {
        if (a.dataKey === TFR_BENCHMARK.label) return -1;
        if (b.dataKey === TFR_BENCHMARK.label) return 1;
        return (b.value || 0) - (a.value || 0); // Sort funds by value descending
      });

      return (
        <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
          {sortedPayload.map((pld: any, index: number) => {
            const color = pld.dataKey === TFR_BENCHMARK.label ? BENCHMARK_COLOR : pld.fill;
            return (
              <div key={pld.dataKey} className="flex items-center text-sm my-1">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                  <span className="text-slate-700 dark:text-slate-300 mr-2">{pld.dataKey}:</span> 
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{pld.value?.toFixed(2)}%</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

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
      <div style={{ width: '100%', height: isCompact ? 300 : 400 }}>
        <ResponsiveContainer>
          <BarChart 
            data={chartData} 
            margin={isCompact ? { top: 5, right: 30, left: 0, bottom: 5 } : { top: 5, right: 20, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: isCompact ? 10 : 14 }} dy={isCompact ? 5 : 10} />
            <YAxis unit="%" tick={{ fill: tickColor, fontSize: isCompact ? 10 : 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
            {!isCompact && <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}/>}
            {selectedFunds.map((fund) => {
                 const color = getColorForFund(fund.id, selectedFundIds);
                 return <Bar key={fund.id} dataKey={fundLabels[selectedFundIds.indexOf(fund.id)]} fill={color} />;
            })}
            <Line type="monotone" dataKey={TFR_BENCHMARK.label} stroke={BENCHMARK_COLOR} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;