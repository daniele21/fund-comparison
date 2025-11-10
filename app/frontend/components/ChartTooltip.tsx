import React from 'react';
import type { TooltipPayload, TooltipProps } from 'recharts';

const DEFAULT_VALUE_FORMATTER = (value?: number | string): string => {
  if (value == null) {
    return '-';
  }
  if (typeof value === 'number') {
    return `${value.toFixed(2)}%`;
  }
  return String(value);
};

interface ChartTooltipProps extends TooltipProps<number, string> {
  sorter?: (a: TooltipPayload, b: TooltipPayload) => number;
  valueFormatter?: (value?: number | string) => string;
  highlightKey?: string;
  highlightColor?: string;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  sorter,
  valueFormatter = DEFAULT_VALUE_FORMATTER,
  highlightKey,
  highlightColor,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const sortedPayload = sorter ? [...payload].sort(sorter) : [...payload].sort((a, b) => {
    const aValue = typeof a.value === 'number' ? a.value : parseFloat(String(a.value));
    const bValue = typeof b.value === 'number' ? b.value : parseFloat(String(b.value));
    return (bValue || 0) - (aValue || 0);
  });

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div
      className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg"
      style={{ opacity: 1, backgroundColor: isDark ? '#1e293b' : '#ffffff', zIndex: 9999 }}
    >
      {label && <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>}
      {sortedPayload.map((entry, index) => {
        const key = `${entry.dataKey ?? entry.name ?? 'series'}-${index}`;
        const color =
          entry.dataKey === highlightKey && highlightColor
            ? highlightColor
            : entry.color || entry.stroke || entry.fill || '#64748b';

        return (
          <div key={key} className="flex items-center text-sm my-1">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
            <span className="text-slate-700 dark:text-slate-300 mr-2">
              {entry.dataKey || entry.name}:
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {valueFormatter(entry.value as number | string | undefined)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ChartTooltip;
