/**
 * Stable color mapping for selected funds used across charts and chips
 */

export const CHART_COLORS = [
  'rgb(var(--brand-chart-1-rgb) / 1)',
  'rgb(var(--brand-chart-2-rgb) / 1)',
  'rgb(var(--brand-chart-3-rgb) / 1)',
  'rgb(var(--brand-chart-4-rgb) / 1)',
  'rgb(var(--brand-chart-5-rgb) / 1)',
  'rgb(var(--brand-chart-6-rgb) / 1)',
  'rgb(var(--brand-primary-rgb) / 1)',
  'rgb(var(--brand-primary-bright-rgb) / 1)',
  'rgb(var(--brand-accent-rgb) / 1)',
  'rgb(var(--brand-text-rgb) / 1)',
];

/**
 * Get a stable color for a fund ID based on its position in the selection
 */
export const getColorForFund = (fundId: string, selectedFundIds: string[]): string => {
  const index = selectedFundIds.indexOf(fundId);
  if (index === -1) return CHART_COLORS[0];
  return CHART_COLORS[index % CHART_COLORS.length];
};

export const withAlpha = (color: string, alpha = 0.15): string => {
  if (!color) {
    return `rgb(var(--brand-primary-rgb) / ${alpha})`;
  }

  const rgbVarMatch = color.match(/^rgb\(var\((--[\w-]+)\)\s*\/\s*[\d.]+\)$/);
  if (rgbVarMatch) {
    return `rgb(var(${rgbVarMatch[1]}) / ${alpha})`;
  }

  if (!color.startsWith('#')) {
    return color;
  }

  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const bigint = parseInt(hex, 16);
  if (Number.isNaN(bigint)) {
    return color;
  }

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
