import React from 'react';
import { PensionFund } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import type { TooltipPayload } from 'recharts';
import { CHART_COLORS, getColorForFund } from '../utils/colorMapping';
import { formatFundLabel } from '../utils/fundLabel';
import ChartTooltip from './ChartTooltip';

interface CostChartProps {
  selectedFunds: PensionFund[];
  theme: string;
  isCompact?: boolean;
  detailFund?: PensionFund | null;
}

const CostChart: React.FC<CostChartProps> = ({ selectedFunds, theme, isCompact = false, detailFund = null }) => {
  const tickColor = theme === 'dark' ? '#94a3b8' : '#475569';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  
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
  
  const costTooltipSorter = React.useCallback(
    (a: TooltipPayload, b: TooltipPayload) => {
      const aValue = typeof a.value === 'number' ? a.value : parseFloat(String(a.value));
      const bValue = typeof b.value === 'number' ? b.value : parseFloat(String(b.value));
      return (bValue || 0) - (aValue || 0);
    },
    []
  );

  // Create stable color mapping
  const selectedFundIds = selectedFunds.map(f => f.id);

  const TOOLTIP_WIDTH = 260;
  const TOOLTIP_MARGIN = 16;
  const chartWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const [chartWidthPx, setChartWidthPx] = React.useState(0);
  const [chartHeightPx, setChartHeightPx] = React.useState(0);
  const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number } | undefined>(undefined);
  const [animationsEnabled, setAnimationsEnabled] = React.useState(true);
  const animationsDisabledRef = React.useRef(false);

  // Reset animations when selectedFunds change
  React.useEffect(() => {
    setAnimationsEnabled(true);
    animationsDisabledRef.current = false;
  }, [selectedFunds, detailFund]);

  React.useLayoutEffect(() => {
    const element = chartWrapperRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setChartWidthPx(rect.width);
      setChartHeightPx(rect.height);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [detailFund, isCompact, selectedFunds.length]);

  const handleTooltipMove = React.useCallback(
    (state: any) => {
      if (!state || !state.isTooltipActive) {
        setTooltipPosition(undefined);
        return;
      }

      if (!animationsDisabledRef.current) {
        animationsDisabledRef.current = true;
        setAnimationsEnabled(false);
      }

  const chartX = state.chartX ?? state.activeCoordinate?.x;
  // Prefer the data-point Y (activeCoordinate.y). If it's not available, use a stable
  // top-aligned Y based on chart height so the tooltip doesn't follow the mouse vertically.
  // Do NOT use state.activeCoordinate?.y here — it often reflects the mouse Y and
  // causes the tooltip to follow the cursor vertically. Use a stable top offset
  // so the tooltip behaves like the PerformanceChart's default placement.
  const TOP_OFFSET = 0; // small gap from the top of the chart
  const chartY = Math.max(TOP_OFFSET, Math.floor(chartHeightPx * 0.1));

      if (chartX == null || chartY == null) {
        setTooltipPosition(undefined);
        return;
      }

      let nextX = chartX + TOOLTIP_MARGIN; // default place to the right
      if (nextX + TOOLTIP_WIDTH + TOOLTIP_MARGIN > chartWidthPx) {
        nextX = Math.max(TOOLTIP_MARGIN, chartX - TOOLTIP_WIDTH - TOOLTIP_MARGIN);
      }

      setTooltipPosition({ x: nextX, y: chartY });
    },
    [chartHeightPx, chartWidthPx]
  );

  const resetTooltipPosition = React.useCallback(() => {
    setTooltipPosition(undefined);
  }, []);

  if (detailFund) {
    const detailChartData = [
      { name: '2 Anni', costo: detailFund.isc.isc2a },
      { name: '5 Anni', costo: detailFund.isc.isc5a },
      { name: '10 Anni', costo: detailFund.isc.isc10a },
      { name: '35 Anni', costo: detailFund.isc.isc35a },
    ].filter(d => d.costo !== null && !isNaN(d.costo));

    return (
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 sm:mb-4">Dettaglio Costi (ISC %)</h3>
        <div ref={chartWrapperRef} style={{ width: '100%', height: isMobile ? 250 : 300 }}>
          <ResponsiveContainer>
            <BarChart 
              data={detailChartData} 
              margin={isMobile ? { top: 5, right: 10, left: -15, bottom: 5 } : { top: 5, right: 20, left: 10, bottom: 5 }}
              onMouseMove={handleTooltipMove}
              onMouseLeave={resetTooltipPosition}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: tickColor, fontSize: isMobile ? 9 : 12 }}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 50 : undefined}
              />
              <YAxis 
                unit="%" 
                tick={{ fill: tickColor, fontSize: isMobile ? 9 : 12 }}
                width={isMobile ? 35 : undefined}
              />
              <Tooltip
                content={<ChartTooltip sorter={costTooltipSorter} />}
                cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                position={tooltipPosition}
                offset={0}
                allowEscapeViewBox={{ x: true, y: false }}
                wrapperStyle={{ pointerEvents: 'auto', opacity: 1, zIndex: 9999 }}
              />
              <Bar dataKey="costo" name="Costo" isAnimationActive={animationsEnabled} radius={isMobile ? [4, 4, 0, 0] : undefined}>
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
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center">
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
            <svg className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 dark:text-slate-600 mb-3 sm:mb-4" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 38H38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
              <path d="M2 2V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
              <rect x="2" y="8" width="22" height="6" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
              <rect x="2" y="17" width="32" height="6" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
              <rect x="2" y="26" width="16" height="6" fill={theme === 'dark' ? '#475569' : '#e2e8f0'}/>
            </svg>
            <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-slate-800 dark:text-slate-200">Confronto Costi</h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 px-4">I costi dei fondi selezionati appariranno qui.</p>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 dark:text-slate-500 mt-2 sm:mt-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </div>
      </div>
    );
  }
  
  // Create labels that include fund name and società for better identification
  const fundLabels = selectedFunds.map(formatFundLabel);

  const chartData = [
    { name: '2 Anni' },
    { name: '5 Anni' },
    { name: '10 Anni' },
    { name: '35 Anni' },
  ];

  selectedFunds.forEach((fund, index) => {
    chartData[0][fundLabels[index]] = fund.isc.isc2a;
    chartData[1][fundLabels[index]] = fund.isc.isc5a;
    chartData[2][fundLabels[index]] = fund.isc.isc10a;
    chartData[3][fundLabels[index]] = fund.isc.isc35a;
  });

  return (
    <div className={isCompact ? '' : 'p-3 sm:p-4 md:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700'}>
       <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200">Confronto Costi (ISC %)</h2>
       <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 bg-slate-50 dark:bg-slate-700/50 p-2 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-700">
           L'<strong>Indicatore Sintetico di Costo (ISC)</strong> mostra l'impatto percentuale dei costi sul montante accumulato{!isMobile && ', anno dopo anno'}. <strong>Una linea più bassa significa un fondo più efficiente.</strong>
       </p>
      <div ref={chartWrapperRef} style={{ width: '100%', height: isMobile ? (isCompact ? 250 : 300) : (isCompact ? 300 : 400) }}>
        <ResponsiveContainer>
          <LineChart 
            data={chartData} 
            margin={
              isMobile 
                ? { top: 5, right: 10, left: -20, bottom: 5 } 
                : (isCompact ? { top: 5, right: 30, left: 10, bottom: 5 } : { top: 5, right: 20, left: 10, bottom: 20 })
            }
            onMouseMove={handleTooltipMove}
            onMouseLeave={resetTooltipPosition}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: tickColor, fontSize: isMobile ? 9 : (isCompact ? 10 : 14) }} 
              dy={isMobile ? 3 : (isCompact ? 5 : 10)}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 50 : undefined}
            />
            <YAxis 
              unit="%" 
              tick={{ fill: tickColor, fontSize: isMobile ? 9 : (isCompact ? 10 : 12) }}
              width={isMobile ? 35 : undefined}
            />
            <Tooltip
              content={<ChartTooltip sorter={costTooltipSorter} />}
              cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
              position={tooltipPosition}
              offset={0}
              allowEscapeViewBox={{ x: true, y: false }}
              wrapperStyle={{ pointerEvents: 'auto', opacity: 1, zIndex: 9999 }}
            />
            {selectedFunds.map((fund, index) => {
                const color = getColorForFund(fund.id, selectedFundIds);
                return (
                  <Line 
                    key={fund.id} 
                    type="monotone" 
                    dataKey={fundLabels[index]} 
                    stroke={color} 
                    strokeWidth={isMobile ? 2 : 2.5} 
                    dot={{ r: isMobile ? 3 : 4 }} 
                    activeDot={{ r: isMobile ? 5 : 7 }} 
                    isAnimationActive={animationsEnabled}
                  />
                );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostChart;
