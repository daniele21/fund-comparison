// Centralized configuration for fund labels and thresholds
import type { FundCategory, AgeRange, UserProfile } from '../types';
import { FUND_LOGIC_CONFIG } from './fundLogicConfig';

export const COST_THRESHOLDS = FUND_LOGIC_CONFIG.costThresholds;
export const PERFORMANCE_THRESHOLDS = FUND_LOGIC_CONFIG.performanceThresholds;

export function costLabelFromIsc35(isc35: number | null | undefined): string {
  if (isc35 == null) return 'Costo: dato non disponibile';
  if (isc35 <= COST_THRESHOLDS.veryCompetitive) return 'Costo: molto competitivo';
  if (isc35 <= COST_THRESHOLDS.average) return 'Costo: nella media';
  return 'Costo: sopra la media';
}

// Small wrapper to support ISC measured at 10 years (isc10a).
// Currently we reuse the same thresholds as for ISC35; if you want
// different thresholds for 10y, update FUND_LOGIC_CONFIG.costThresholds.
export function costLabelFromIsc10(isc10: number | null | undefined): string {
  return costLabelFromIsc35(isc10);
}

export function perfLabelFromRendimento10y(rendimento10y: number | null | undefined): string {
  if (rendimento10y == null) return 'Rendimenti: dato mancante';
  if (rendimento10y >= PERFORMANCE_THRESHOLDS.aboveAverage) return 'Rendimenti: sopra la media';
  if (rendimento10y >= PERFORMANCE_THRESHOLDS.inLine) return 'Rendimenti: in linea con fondi simili';
  return 'Rendimenti: sotto la media recente';
}

// Risk score for each fund category (0 = safest, 100 = most aggressive)
const CATEGORIA_RISK_SCORE: Record<FundCategory, number> = FUND_LOGIC_CONFIG.categoryRiskScores;
const { defaultIdealRisk, shortHorizonRisk, horizonRiskRules, ageFallbackRisk } = FUND_LOGIC_CONFIG.coherence;

/**
 * Compute a coherence score (0-100) between a fund and user profile.
 * Higher = better match.
 */
export function computeCoherenceScore(
  fundCategoria: FundCategory | undefined,
  profile: UserProfile
): number {
  if (!fundCategoria) return 50; // neutral when unknown

  const fundRisk = CATEGORIA_RISK_SCORE[fundCategoria];

  // Derive ideal risk score from horizonYears and ageRange
  let idealRisk = defaultIdealRisk; // default: balanced

  const { horizonYears, ageRange } = profile;

  // Horizon is the primary factor
  if (horizonYears != null) {
    idealRisk = shortHorizonRisk;
    for (const rule of horizonRiskRules) {
      if (horizonYears > rule.minYearsExclusive) {
        idealRisk = rule.idealRisk;
        break;
      }
    }
  } else if (ageRange) {
    // Fallback to ageRange if horizonYears is missing
    idealRisk = ageFallbackRisk[ageRange] ?? idealRisk;
  }

  // Score inversely proportional to distance
  const distance = Math.abs(fundRisk - idealRisk);
  const maxDistance = 100;
  const score = Math.max(0, 100 - (distance / maxDistance) * 100);

  return Math.round(score);
}

export function coherenceLabelFromScore(score: number): string {
  if (score >= 80) return 'Coerenza: ottima per il tuo profilo';
  if (score >= 60) return 'Coerenza: buona, in linea con le tue esigenze';
  if (score >= 40) return 'Coerenza: accettabile, ma valuta alternative';
  return 'Coerenza: poco adatta al tuo orizzonte temporale';
}

// UI helpers: return Tailwind classes for badge background and small dot color
export function colorForCost(isc35: number | null | undefined) {
  if (isc35 == null) return { badgeBg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400' };
  if (isc35 <= COST_THRESHOLDS.veryCompetitive) return { badgeBg: 'bg-emerald-50 dark:bg-emerald-900/20', dot: 'bg-emerald-500' };
  if (isc35 <= COST_THRESHOLDS.average) return { badgeBg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-400' };
  return { badgeBg: 'bg-red-50 dark:bg-red-900/20', dot: 'bg-red-500' };
}

// Wrapper for 10-year ISC coloring (reuses same logic as isc35 for now).
export function colorForCost10(isc10: number | null | undefined) {
  return colorForCost(isc10);
}

export function colorForPerf(rendimento10y: number | null | undefined) {
  if (rendimento10y == null) return { badgeBg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400' };
  if (rendimento10y >= PERFORMANCE_THRESHOLDS.aboveAverage) return { badgeBg: 'bg-emerald-50 dark:bg-emerald-900/20', dot: 'bg-emerald-500' };
  if (rendimento10y >= PERFORMANCE_THRESHOLDS.inLine) return { badgeBg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-400' };
  return { badgeBg: 'bg-red-50 dark:bg-red-900/20', dot: 'bg-red-500' };
}

export function colorForCoherence(score: number | null | undefined) {
  if (score == null) return { badgeBg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400' };
  if (score >= 80) return { badgeBg: 'bg-emerald-50 dark:bg-emerald-900/20', dot: 'bg-emerald-500' };
  if (score >= 60) return { badgeBg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-400' };
  return { badgeBg: 'bg-red-50 dark:bg-red-900/20', dot: 'bg-red-500' };
}

export function matchLabelFromFund(
  fund: { categoria?: FundCategory; type?: string } | null | undefined,
  profile?: UserProfile
): string {
  if (!fund) return 'Coerenza: dati mancanti';
  
  if (!profile || (!profile.horizonYears && !profile.ageRange)) {
    // No user context: just show fund type
    return `Coerenza: fondo ${fund.categoria ?? 'N/D'} (${fund.type ?? 'N/D'})`;
  }

  const score = computeCoherenceScore(fund.categoria, profile);
  return coherenceLabelFromScore(score);
}
