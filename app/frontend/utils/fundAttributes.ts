import type { PensionFund } from '../types';

export type FundAttributeStatus = 'yes' | 'no' | 'unknown';

const NEGATIVE_SUSTAINABILITY = /\b(no|non adotta|non tiene conto|art\.\s*6)\b/i;
const POSITIVE_SUSTAINABILITY = /\b(si|sì|promuove|art\.\s*8|art\.\s*9|sostenibil)\b/i;

export const getCapitalGuaranteeStatus = (fund: PensionFund): FundAttributeStatus => {
  if (fund.garanzia === true) return 'yes';
  if (fund.garanzia === false) return 'no';
  return 'unknown';
};

export const getEsgStatus = (fund: PensionFund): FundAttributeStatus => {
  const value = fund.sostenibilita;
  if (!value) return 'unknown';
  if (NEGATIVE_SUSTAINABILITY.test(value)) return 'no';
  if (POSITIVE_SUSTAINABILITY.test(value)) return 'yes';
  return 'unknown';
};

export const formatAttributeStatus = (status: FundAttributeStatus): string => {
  if (status === 'yes') return 'Sì';
  if (status === 'no') return 'No';
  return 'Non disponibile';
};
