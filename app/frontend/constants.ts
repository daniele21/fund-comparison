import { FundCategory } from './types';

export const CATEGORY_MAP: Record<FundCategory, string> = {
  GAR: 'Garantito',
  BIL: 'Bilanciato',
  AZN: 'Azionario',
  'OBB MISTO': 'Obbligazionario Misto',
  'OBB PURO': 'Obbligazionario Puro',
  'OBB': 'Obbligazionario',
};

// Added for visual indicators
export const CATEGORY_COLORS: Record<FundCategory, string> = {
  GAR: 'bg-emerald-500',
  BIL: 'bg-sky-500',
  AZN: 'bg-amber-500',
  'OBB MISTO': 'bg-cyan-500',
  'OBB PURO': 'bg-blue-500',
  'OBB': 'bg-indigo-500',
};

/** External subscription purchase URL */
export const SUBSCRIPTION_URL = 'https://financialspreadsheet.it/pages/comparatore-fondi-pensione';

// Simulator constants (D.Lgs. 252/2005)
export const MAX_CONTRIBUTO_DEDUCIBILE = 5300;

// IRPEF tax brackets for 2025
export const SCAGLIONI_IRPEF = [
  { min: 0, max: 28000, aliquota: 0.23, label: 'fino a 28.000€ (23%)' },
  { min: 28000.01, max: 50000, aliquota: 0.35, label: '28.001€ - 50.000€ (35%)' },
  { min: 50000.01, max: Infinity, aliquota: 0.43, label: 'oltre 50.000€ (43%)' },
] as const;
