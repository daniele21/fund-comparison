import React from 'react';
import type { TooltipPayload, TooltipProps } from 'recharts';
import { withAlpha } from '../utils/colorMapping';

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

  const isCrowded = sortedPayload.length > 4;
  const shouldScroll = sortedPayload.length > 6;

  return (
    <div
      className="p-3 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg"
      style={{
        opacity: 1,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        zIndex: 9999,
        maxWidth: 320,
      }}
    >
      {label && (
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
          {label}
        </p>
      )}
      <div
        className="space-y-1.5 pr-1"
        style={{
          maxHeight: shouldScroll ? 220 : undefined,
          overflowY: shouldScroll ? 'auto' : undefined,
        }}
      >
        {sortedPayload.map((entry, index) => {
          const key = `${entry.dataKey ?? entry.name ?? 'series'}-${index}`;
          const isHighlight = entry.dataKey === highlightKey && !!highlightColor;
          const color =
            isHighlight && highlightColor
              ? highlightColor
              : entry.color || entry.stroke || entry.fill || '#64748b';
          const value = valueFormatter(entry.value as number | string | undefined);

          const rowBackground = withAlpha(color, isHighlight ? 0.25 : isDark ? 0.3 : 0.12);
          const rowBorder = withAlpha(color, isDark ? 0.5 : 0.35);

          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm gap-3"
              style={{
                backgroundColor: rowBackground,
                border: `1px solid ${rowBorder}`,
              }}
            >
              <div className="flex items-center min-w-0 gap-2">
                {isCrowded && (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-5">
                    {index + 1}
                  </span>
                )}
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                ></span>
                <span className="truncate text-slate-700 dark:text-slate-200">
                  {entry.dataKey || entry.name}
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTooltip;
