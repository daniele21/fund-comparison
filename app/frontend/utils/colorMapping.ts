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
