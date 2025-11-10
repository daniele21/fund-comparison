/**
 * Stable color mapping for selected funds used across charts and chips
 */

export const CHART_COLORS = [
  '#0ea5e9', // sky
  '#14b8a6', // teal
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#ec4899', // pink
  '#22c55e', // green
  '#d97706', // yellow-600
  '#64748b'  // slate
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
    return `rgba(148, 163, 184, ${alpha})`;
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
