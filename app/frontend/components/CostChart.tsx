import React from 'react';
import { PensionFund } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface CostChartProps {
  selectedFunds: PensionFund[];
  theme: string;
  isCompact?: boolean;
  detailFund?: PensionFund | null;
}

const CHART_COLORS = [
    '#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#f43f5e',
    '#6366f1', '#ec4899', '#22c55e', '#d97706', '#64748b'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Sort payload by value for clarity
    const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

    return (
      <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
        {sortedPayload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center text-sm my-1">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: pld.stroke || pld.fill }}></span>
                <span className="text-slate-700 dark:text-slate-300 mr-2">{pld.dataKey || pld.name}:</span> 
                <span className="font-semibold text-slate-900 dark:text-slate-100">{pld.value?.toFixed(2)}%</span>
            </div>
        ))}
      </div>
    );
  }
  return null;
};

const CostChart: React.FC<CostChartProps> = ({ selectedFunds, theme, isCompact = false, detailFund = null }) => {
  const tickColor = theme === 'dark' ? '#94a3b8' : '#475569';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  if (detailFund) {
    const detailChartData = [
      { name: '2 Anni', costo: detailFund.isc.isc2a },
      { name: '5 Anni', costo: detailFund.isc.isc5a },
      { name: '10 Anni', costo: detailFund.isc.isc10a },
      { name: '35 Anni', costo: detailFund.isc.isc35a },
    ].filter(d => d.costo !== null && !isNaN(d.costo));

    return (
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Dettaglio Costi (ISC %)</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart 
              data={detailChartData} 
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
              <YAxis unit="%" tick={{ fill: tickColor, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
              <Bar dataKey="costo" name="Costo">
                {detailChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (selectedFunds.length === 0 && !isCompact) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center">
        <div className="flex flex-col items-center justify-center h-96">
            <svg className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 38H38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
              <path d="M2 2V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
              <rect x="2" y="8" width="22" height="6" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
              <rect x="2" y="17" width="32" height="6" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
              <rect x="2" y="26" width="16" height="6" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
            </svg>
            <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">Confronto Costi</h2>
            <p className="text-slate-500 dark:text-slate-400">I costi dei fondi selezionati appariranno qui.</p>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 dark:text-slate-500 mt-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </div>
      </div>
    );
  }
  
  const chartData = [
    { name: '2 Anni' },
    { name: '5 Anni' },
    { name: '10 Anni' },
    { name: '35 Anni' },
  ];

  selectedFunds.forEach(fund => {
    chartData[0][fund.linea] = fund.isc.isc2a;
    chartData[1][fund.linea] = fund.isc.isc5a;
    chartData[2][fund.linea] = fund.isc.isc10a;
    chartData[3][fund.linea] = fund.isc.isc35a;
  });

  return (
    <div className={isCompact ? '' : 'p-4 md:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700'}>
       <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Confronto Costi (ISC %)</h2>
       <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
           L'<strong>Indicatore Sintetico di Costo (ISC)</strong> mostra l'impatto percentuale dei costi sul montante accumulato, anno dopo anno. <strong>Una linea più bassa significa un fondo più efficiente.</strong>
       </p>
      <div style={{ width: '100%', height: isCompact ? 300 : 400 }}>
        <ResponsiveContainer>
          <LineChart 
            data={chartData} 
            margin={isCompact ? { top: 5, right: 30, left: 0, bottom: 5 } : { top: 5, right: 20, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: isCompact ? 10 : 14 }} dy={isCompact ? 5 : 10} />
            <YAxis unit="%" tick={{ fill: tickColor, fontSize: isCompact ? 10 : 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
            {!isCompact && <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}/>}
            {selectedFunds.map((fund, index) => (
                <Line 
                  key={fund.id} 
                  type="monotone" 
                  dataKey={fund.linea} 
                  stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 7 }} 
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostChart;