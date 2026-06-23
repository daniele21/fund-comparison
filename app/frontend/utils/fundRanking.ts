import type { FundCostDetails, PensionFund } from '../types';
import { getCapitalGuaranteeStatus, getEsgStatus } from './fundAttributes';

type ReturnKey = keyof PensionFund['rendimenti'];
type IscKey = keyof PensionFund['isc'];
type CostKey = keyof FundCostDetails;

type RankingMetric =
  | { id: string; title: string; kind: 'return'; key: ReturnKey }
  | { id: string; title: string; kind: 'isc'; key: IscKey }
  | { id: string; title: string; kind: 'cost'; key: CostKey; unit: 'EUR' | '%' };

export const RANKING_METRICS: RankingMetric[] = [
  { id: 'return-1y', title: 'Maggior rendimento 1A', kind: 'return', key: 'ultimoAnno' },
  { id: 'return-3y', title: 'Maggior rendimento 3A', kind: 'return', key: 'ultimi3Anni' },
  { id: 'return-5y', title: 'Maggior rendimento 5A', kind: 'return', key: 'ultimi5Anni' },
  { id: 'return-10y', title: 'Maggior rendimento 10A', kind: 'return', key: 'ultimi10Anni' },
  { id: 'return-20y', title: 'Maggior rendimento 20A', kind: 'return', key: 'ultimi20Anni' },
  { id: 'isc-2y', title: 'Minore ISC 2A', kind: 'isc', key: 'isc2a' },
  { id: 'isc-5y', title: 'Minore ISC 5A', kind: 'isc', key: 'isc5a' },
  { id: 'isc-10y', title: 'Minore ISC 10A', kind: 'isc', key: 'isc10a' },
  { id: 'isc-35y', title: 'Minore ISC 35A', kind: 'isc', key: 'isc35a' },
  { id: 'cost-join', title: 'Minore costo di adesione', kind: 'cost', key: 'adesione', unit: 'EUR' },
  { id: 'cost-management', title: 'Minore costo di gestione annua', kind: 'cost', key: 'annuiGestione', unit: '%' },
  { id: 'cost-advance', title: 'Minori spese di anticipazione', kind: 'cost', key: 'anticipazione', unit: 'EUR' },
  { id: 'cost-transfer', title: 'Minori spese di trasferimento', kind: 'cost', key: 'trasferimento', unit: 'EUR' },
  { id: 'cost-redemption', title: 'Minori spese di riscatto', kind: 'cost', key: 'riscatto', unit: 'EUR' },
  { id: 'cost-reallocation', title: 'Minori spese di riallocazione posizione', kind: 'cost', key: 'riallocazionePosizione', unit: 'EUR' },
  { id: 'cost-payment', title: 'Minori spese di erogazione', kind: 'cost', key: 'erogazione', unit: '%' },
];

export interface RankingFilters { onlyEsg: boolean; onlyCapitalGuarantee: boolean; }
export interface RankedFund { fund: PensionFund; value: number; displayValue: string; }

const FREE_COST = /^(non previste?|non previsti|gratuit[ao]|nessun[oa] costo)$/i;
const firstNumber = (value: string): number | null => {
  const matched = value.match(/\d+(?:[.,]\d+)?/);
  return matched ? Number.parseFloat(matched[0].replace(',', '.')) : null;
};

const parseCost = (value: string | null, unit: 'EUR' | '%'): number | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (FREE_COST.test(normalized)) return 0;
  const isPercentage = normalized.includes('%');
  if ((unit === '%' && !isPercentage) || (unit === 'EUR' && isPercentage)) return null;
  if (/prima .*gratuita|a carico del datore|a carico dell.azienda|[-–]/i.test(normalized)) return null;
  return firstNumber(normalized);
};

const formatValue = (value: number, metric: RankingMetric): string => {
  if (metric.kind === 'return' || metric.kind === 'isc' || metric.unit === '%') return `${value.toFixed(2)}%`;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const metricValue = (fund: PensionFund, metric: RankingMetric): number | null => {
  if (metric.kind === 'return') return fund.rendimenti[metric.key];
  if (metric.kind === 'isc') return fund.isc[metric.key];
  return parseCost(fund.costiDettaglio[metric.key], metric.unit);
};

export const getRankedFunds = (funds: PensionFund[], metric: RankingMetric, filters: RankingFilters): RankedFund[] => {
  return funds
    .filter((fund) => !filters.onlyEsg || getEsgStatus(fund) === 'yes')
    .filter((fund) => !filters.onlyCapitalGuarantee || getCapitalGuaranteeStatus(fund) === 'yes')
    .flatMap((fund) => {
      const value = metricValue(fund, metric);
      return value == null ? [] : [{ fund, value, displayValue: formatValue(value, metric) }];
    })
    .sort((left, right) => {
      const direction = metric.kind === 'return' ? right.value - left.value : left.value - right.value;
      return direction || left.fund.linea.localeCompare(right.fund.linea, 'it');
    });
};
