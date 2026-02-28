import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MontanteSeriesPoint } from '../../types';
import { formatCurrency } from '../../utils/simulatorCalc';

/* ── Custom tooltip for simulator charts ──────────────────────── */
const SERIES_META: Record<string, { label: string; color: string }> = {
  montanteSenzaFiscale: { label: 'Senza beneficio fiscale', color: '#3b82f6' },
  montanteConFiscale: { label: 'Con beneficio fiscale', color: '#10b981' },
  montanteTFR: { label: 'TFR in azienda', color: '#ef4444' },
  versatoCumulato: { label: 'Importi versati', color: '#0f766e' },
};

const SimulatorTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: number; theme: string }> = ({
  active,
  payload,
  label,
  theme,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const isDark = theme === 'dark';

  return (
    <div
      className="rounded-lg border shadow-lg px-3 py-2.5"
      style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        maxWidth: 280,
      }}
    >
      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
        Anno {label}
      </p>
      <div className="space-y-1">
        {[...payload]
          .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
          .map((entry: any) => {
            const meta = SERIES_META[entry.dataKey as string];
            const seriesLabel = meta?.label ?? entry.name ?? entry.dataKey;
            const color = meta?.color ?? entry.color ?? '#64748b';
            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="truncate text-slate-600 dark:text-slate-300">{seriesLabel}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums flex-shrink-0">
                  {formatCurrency(entry.value ?? 0)}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

interface MontanteChartProps {
  data: MontanteSeriesPoint[];
  theme: string;
  showFiscale?: boolean;
  showTFR?: boolean;
  showVersatoCumulato?: boolean;
}

const MontanteChart: React.FC<MontanteChartProps> = ({
  data,
  theme,
  showFiscale = false,
  showTFR = true,
  showVersatoCumulato = false,
}) => {
  const tickColor = theme === 'dark' ? '#94a3b8' : '#475569';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <svg
            className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm font-medium">Nessun dato da visualizzare</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMontanteSenzaFiscale" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorMontanteConFiscale" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorMontanteTFR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorVersatoCumulato" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="anno"
          stroke={tickColor}
          style={{ fontSize: isMobile ? '11px' : '12px' }}
          label={{
            value: 'Anni',
            position: 'insideBottom',
            offset: -5,
            style: { fill: tickColor, fontSize: isMobile ? '11px' : '12px' },
          }}
        />
        <YAxis
          stroke={tickColor}
          style={{ fontSize: isMobile ? '11px' : '12px' }}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          label={{
            value: 'Montante (€)',
            angle: -90,
            position: 'insideLeft',
            style: { fill: tickColor, fontSize: isMobile ? '11px' : '12px', textAnchor: 'middle' },
          }}
        />
        <Tooltip
          content={<SimulatorTooltip theme={theme} />}
        />
        <Legend
          wrapperStyle={{ fontSize: isMobile ? '11px' : '12px' }}
          iconType="line"
          iconSize={isMobile ? 12 : 14}
        />

        {showTFR && (
          <Area
            type="monotone"
            dataKey="montanteTFR"
            name="TFR in azienda"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorMontanteTFR)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        )}

        <Area
          type="monotone"
          dataKey="montanteSenzaFiscale"
          name="Senza beneficio fiscale"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#colorMontanteSenzaFiscale)"
          dot={false}
          activeDot={{ r: 5 }}
        />

        {showFiscale && (
          <Area
            type="monotone"
            dataKey="montanteConFiscale"
            name="Con beneficio fiscale"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#colorMontanteConFiscale)"
            dot={false}
            activeDot={{ r: 5 }}
          />
        )}

        {showVersatoCumulato && (
          <Area
            type="monotone"
            dataKey="versatoCumulato"
            name="Importi versati"
            stroke="#0f766e"
            strokeWidth={2.5}
            fill="url(#colorVersatoCumulato)"
            dot={false}
            activeDot={{ r: 5 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MontanteChart;
