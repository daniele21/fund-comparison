import type { AgeRange, FundCategory, RiskPreference } from '../types';

type HorizonRiskRule = {
  minYearsExclusive: number;
  idealRisk: number;
};

type HorizonCategoryRule = {
  maxYearsInclusive: number;
  categories: string[];
};

export const FUND_LOGIC_CONFIG = {
  costThresholds: {
    veryCompetitive: 0.6,
    average: 1.0,
  },
  performanceThresholds: {
    aboveAverage: 4.0,
    inLine: 2.0,
  },
  categoryRiskScores: {
    GAR: 10,
    'OBB PURO': 25,
    OBB: 30,
    'OBB MISTO': 40,
    BIL: 55,
    AZN: 85,
  } as Record<FundCategory, number>,
  coherence: {
    defaultIdealRisk: 50,
    shortHorizonRisk: 20,
    horizonRiskRules: [
      { minYearsExclusive: 20, idealRisk: 75 },
      { minYearsExclusive: 15, idealRisk: 65 },
      { minYearsExclusive: 10, idealRisk: 50 },
      { minYearsExclusive: 5, idealRisk: 35 },
    ] as HorizonRiskRule[],
    ageFallbackRisk: {
      under35: 70,
      '35-50': 50,
      over50: 30,
    } as Record<AgeRange, number>,
  },
  shortlist: {
    weights: {
      cost: 0.5,
      returns: 0.4,
      riskBoostMax: 0.14,
      hasFpnBoost: 0.18,
      contractualCategoryBoost: 0.12,
      ageConservatism: 0.06,
    },
    horizonCategoryRules: [
      { maxYearsInclusive: 10, categories: ['GAR', 'OBB', 'MISTO PRUDENTE'] },
      { maxYearsInclusive: 20, categories: ['BIL', 'OBB MISTO', 'MISTO'] },
      { maxYearsInclusive: Number.POSITIVE_INFINITY, categories: ['AZN', 'AZ', 'CRESCITA', 'BIL'] },
    ] as HorizonCategoryRule[],
    missingValues: {
      cost: 999,
      returns10y: -999,
    },
    riskPreferenceMap: {
      low: 0,
      medium: 0.5,
      high: 1,
    } as Record<RiskPreference, number>,
    categoryPatterns: {
      equityLike: ['AZN', 'AZ', 'CRESCITA'],
      mixedLike: ['MISTO', 'BIL', 'OBB MISTO', 'OBB'],
    },
    ageBias: {
      over50Penalty: 0.06,
      under35BoostFactor: 0.5,
    },
  },
};

export type FundLogicConfig = typeof FUND_LOGIC_CONFIG;
