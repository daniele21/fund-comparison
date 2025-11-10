import { PensionFund } from '../types';

export const formatFundLabel = (fund: PensionFund): string => {
  const societaPart = fund.societa ? ` (${fund.societa})` : '';
  return `${fund.pip} - ${fund.linea}${societaPart}`;
};

export const formatShortFundLabel = (fund: PensionFund, maxLength = 32): string => {
  const label = formatFundLabel(fund);
  if (label.length <= maxLength) {
    return label;
  }
  return `${label.slice(0, Math.max(0, maxLength - 3))}...`;
};
