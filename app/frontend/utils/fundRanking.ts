import type { CapitalGuaranteeFilter, FundCategory, FundCostDetails, PensionFund } from '../types';
import { getCapitalGuaranteeStatus, getEsgStatus } from './fundAttributes';

type ReturnKey = keyof PensionFund['rendimenti'];
type IscKey = keyof PensionFund['isc'];
type CostKey = keyof FundCostDetails;

export type RankingTone = 'positive' | 'negative';
export type RankingSortDirection = 'ascending' | 'descending';

export type RankingMetric =
  | { id: string; title: string; kind: 'return'; key: ReturnKey; sortDirection: RankingSortDirection; tone: RankingTone }
  | { id: string; title: string; kind: 'isc'; key: IscKey; sortDirection: RankingSortDirection; tone: RankingTone }
  | { id: string; title: string; kind: 'cost'; key: CostKey; unit: 'EUR' | '%'; sortDirection: RankingSortDirection; tone: RankingTone };

export const RANKING_METRICS: RankingMetric[] = [
  { id: 'return-1y', title: 'TOP rendimento a 1 anno', kind: 'return', key: 'ultimoAnno', sortDirection: 'descending', tone: 'positive' },
  { id: 'return-3y', title: 'TOP rendimento a 3 anni', kind: 'return', key: 'ultimi3Anni', sortDirection: 'descending', tone: 'positive' },
  { id: 'return-5y', title: 'TOP rendimento a 5 anni', kind: 'return', key: 'ultimi5Anni', sortDirection: 'descending', tone: 'positive' },
  { id: 'return-10y', title: 'TOP rendimento a 10 anni', kind: 'return', key: 'ultimi10Anni', sortDirection: 'descending', tone: 'positive' },
  { id: 'return-20y', title: 'TOP rendimento a 20 anni', kind: 'return', key: 'ultimi20Anni', sortDirection: 'descending', tone: 'positive' },
  { id: 'isc-2y', title: 'ISC piu alto a 2 anni', kind: 'isc', key: 'isc2a', sortDirection: 'descending', tone: 'negative' },
  { id: 'isc-5y', title: 'ISC piu alto a 5 anni', kind: 'isc', key: 'isc5a', sortDirection: 'descending', tone: 'negative' },
  { id: 'isc-10y', title: 'ISC piu alto a 10 anni', kind: 'isc', key: 'isc10a', sortDirection: 'descending', tone: 'negative' },
  { id: 'isc-35y', title: 'ISC piu alto a 35 anni', kind: 'isc', key: 'isc35a', sortDirection: 'descending', tone: 'negative' },
  { id: 'cost-join', title: 'Costo di adesione piu alto', kind: 'cost', key: 'adesione', unit: 'EUR', sortDirection: 'descending', tone: 'negative' },
  { id: 'cost-management-percent', title: 'Gestione annua percentuale piu costosa', kind: 'cost', key: 'annuiGestione', unit: '%', sortDirection: 'descending', tone: 'negative' },
  { id: 'cost-management-fixed', title: 'Gestione annua fissa piu costosa', kind: 'cost', key: 'annuiGestione', unit: 'EUR', sortDirection: 'descending', tone: 'negative' },
  { id: 'cost-advance', title: 'Anticipazione piu onerosa', kind: 'cost', key: 'anticipazione', unit: 'EUR', sortDirection: 'descending', tone: 'negative' },
  { id: 'cost-transfer', title: 'Trasferimento piu costoso', kind: 'cost', key: 'trasferimento', unit: 'EUR', sortDirection: 'descending', tone: 'negative' },
  { id: 'cost-redemption', title: 'Riscatto piu costoso', kind: 'cost', key: 'riscatto', unit: 'EUR', sortDirection: 'descending', tone: 'negative' },
  { id: 'cost-reallocation', title: 'Riallocazione piu costosa', kind: 'cost', key: 'riallocazionePosizione', unit: 'EUR', sortDirection: 'descending', tone: 'negative' },
  { id: 'cost-payment', title: 'Erogazione piu costosa', kind: 'cost', key: 'erogazione', unit: '%', sortDirection: 'descending', tone: 'negative' },
];

export interface RankingFilters {
  onlyEsg: boolean;
  capitalGuarantee: CapitalGuaranteeFilter;
  category: FundCategory | 'all';
  includeClosedFunds: boolean;
}
export interface RankedFund { fund: PensionFund; value: number; displayValue: string; }

const FREE_COST = /\b(non\s+previst[eo]|gratuit[aoe]?|nessun[oa]\s+costo)\b/i;
const DISQUALIFYING_COST = /prima .*gratuita|a carico del datore|a carico dell.azienda|^[-–—]$/i;
const MONEY_VALUE = /(?:(?:€|eur|euro)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:€|eur|euro))/i;
const NUMERIC_ONLY = /^\d+(?:[.,]\d+)?$/;
const PERCENT_VALUE = /(\d+(?:[.,]\d+)?)\s*%/g;

const parseNumber = (value: string): number => Number.parseFloat(value.replace(',', '.'));
const isCalendarYear = (value: number): boolean => Number.isInteger(value) && value >= 1900 && value <= 2100;

const collectPercentages = (value: string): number[] => {
  return Array.from(value.matchAll(PERCENT_VALUE), (match) => parseNumber(match[1])).filter((parsed) => Number.isFinite(parsed));
};

const firstPercentage = (value: string): number | null => {
  return collectPercentages(value)[0] ?? null;
};

const firstTargetedPercentage = (value: string, patterns: RegExp[]): number | null => {
  for (const pattern of patterns) {
    const matched = value.match(pattern);
    const numericValue = matched?.[1] ?? matched?.[2];
    if (numericValue) {
      return parseNumber(numericValue);
    }
  }

  return null;
};

const parseErogazionePercentage = (value: string): number | null => {
  const targeted = firstTargetedPercentage(value, [
    /(?:caricamento|spese)\s+(?:per\s+)?(?:spese\s+)?pagamento\s+rendita[^%]*?(\d+(?:[.,]\d+)?)\s*%/i,
    /(?:costo|spese)\s+di\s+rivalutazione\s+rendita[^%]*?(\d+(?:[.,]\d+)?)\s*%/i,
    /(\d+(?:[.,]\d+)?)\s*%\s*annuale(?:\s+della\s+rendita)?/i,
    /(\d+(?:[.,]\d+)?)\s*%[^.;]*(?:coefficienti\s+di\s+conversione|rata\s+di\s+rendita|della\s+rendita|rendita\s+annua)/i,
  ]);
  if (targeted != null) return targeted;

  return firstPercentage(value);
};

export const parseRankingCostForTest = (value: string | null, unit: 'EUR' | '%', key?: CostKey): number | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/[’‘]/g, "'");
  if (FREE_COST.test(normalized)) return 0;
  if (DISQUALIFYING_COST.test(normalized)) return null;

  if (unit === '%') {
    if (!normalized.includes('%')) return null;
    return key === 'erogazione' ? parseErogazionePercentage(normalized) : firstPercentage(normalized);
  }

  const moneyMatch = normalized.match(MONEY_VALUE);
  const moneyValue = moneyMatch?.[1] ?? moneyMatch?.[2];
  if (moneyValue) {
    return parseNumber(moneyValue);
  }

  if (NUMERIC_ONLY.test(normalized)) {
    const parsed = parseNumber(normalized);
    return isCalendarYear(parsed) ? null : parsed;
  }

  return null;
};

const formatValue = (value: number, metric: RankingMetric): string => {
  if (metric.kind === 'return' || metric.kind === 'isc' || metric.unit === '%') return `${value.toFixed(2)}%`;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const metricValue = (fund: PensionFund, metric: RankingMetric): number | null => {
  if (metric.kind === 'return') return fund.rendimenti[metric.key];
  if (metric.kind === 'isc') return fund.isc[metric.key];
  return parseRankingCostForTest(fund.costiDettaglio[metric.key], metric.unit, metric.key);
};

export const getRankedFunds = (funds: PensionFund[], metric: RankingMetric, filters: RankingFilters): RankedFund[] => {
  return funds
    .filter((fund) => filters.includeClosedFunds || !fund.chiusoNuoviAderenti)
    .filter((fund) => !filters.onlyEsg || getEsgStatus(fund) === 'yes')
    .filter((fund) => filters.capitalGuarantee !== 'with-guarantee' || getCapitalGuaranteeStatus(fund) === 'yes')
    .filter((fund) => filters.capitalGuarantee !== 'without-guarantee' || getCapitalGuaranteeStatus(fund) === 'no')
    .filter((fund) => filters.category === 'all' || fund.categoria === filters.category)
    .flatMap((fund) => {
      const value = metricValue(fund, metric);
      return value == null ? [] : [{ fund, value, displayValue: formatValue(value, metric) }];
    })
    .sort((left, right) => {
      const direction = metric.sortDirection === 'descending'
        ? right.value - left.value
        : left.value - right.value;
      return direction || left.fund.linea.localeCompare(right.fund.linea, 'it');
    });
};
