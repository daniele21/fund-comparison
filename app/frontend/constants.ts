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
