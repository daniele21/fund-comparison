import type { PensionFund, UserProfile } from '../types';

type ScoreOptions = {
  maxResults?: number;
};

/**
 * Compute a shortlist of funds based on a user's profile.
 *
 * Strategy (simple, explainable):
 * - Filter by category candidates derived from horizon years.
 * - Score by normalized cost (isc35a) and long-run returns (ultimi10Anni).
 * - Optionally consider risk preference by preferring equity categories for higher risk tolerance.
 *
 * Inputs/outputs (contract):
 * - inputs: funds array, profile (may have undefined fields)
 * - output: array of funds ordered by score (best first), limited to maxResults
 */
export function computeShortlist(funds: PensionFund[], profile: UserProfile, options: ScoreOptions = {}) {
  const { maxResults = 5 } = options;

  if (!profile.horizonYears) return [];

  const horizon = profile.horizonYears;

  // Tunable weights / thresholds
  const WEIGHTS = {
    cost: 0.5,
    returns: 0.4,
    riskBoostMax: 0.14, // max boost for strong risk alignment
    hasFpnBoost: 0.18, // boost when user has contractual FPN and fund.type === 'FPN'
    contractualCategoryBoost: 0.12, // boost when fund category matches contractualFpnCategory
    ageConservatism: 0.06, // penalty to equity when over50
  };

  let targetCategories: string[] = [];
  if (horizon <= 10) targetCategories = ['GAR', 'OBB', 'MISTO PRUDENTE'];
  else if (horizon <= 20) targetCategories = ['BIL', 'OBB MISTO', 'MISTO'];
  else targetCategories = ['AZN', 'AZ', 'CRESCITA', 'BIL'];

  // Helper: normalized cost (lower is better). Use 0..1 range where 0 is worst, 1 is best for scores
  const costs = funds.map(f => (f.isc?.isc35a == null ? 999 : f.isc.isc35a));
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);

  const returns10 = funds.map(f => (f.rendimenti.ultimi10Anni == null ? -999 : f.rendimenti.ultimi10Anni));
  const minR = Math.min(...returns10);
  const maxR = Math.max(...returns10);

  const normalized = (v: number, min: number, max: number) => (max === min ? 0.5 : (v - min) / (max - min));

  const filtered = funds.filter(fund => {
    const cat = (fund.categoria ?? '').toString().toUpperCase();
    return targetCategories.some(catTarget => cat.includes(catTarget));
  });

  // If the user explicitly indicates they do NOT have a contractual FPN, exclude FPN-type funds entirely.
  const filteredAfterFpnPref = filtered.filter(fund => {
    const fundTypeNorm = (fund.type ?? '').toString().toUpperCase().trim();
    if (profile.hasFpn === false && fundTypeNorm === 'FPN') return false;
    return true;
  });

  const scored = filteredAfterFpnPref.map(fund => {
    const cost = fund.isc?.isc35a == null ? 999 : fund.isc.isc35a;
    const ret10 = fund.rendimenti.ultimi10Anni == null ? -999 : fund.rendimenti.ultimi10Anni;

    // normalized: higher is better for these components
    const costScore = 1 - normalized(cost, minCost, maxCost); // 1 best, 0 worst
    const returnScore = normalized(ret10, minR, maxR);

    // Stronger, graded risk preference effect
    const categoryUpper = fund.categoria.toUpperCase();
    const equityLike = /AZ|CRESCITA/.test(categoryUpper);
    const mixedLike = /MISTO|BIL|OBB MISTO|OBB/.test(categoryUpper);

    const riskPref = profile.riskPreference ?? 'medium';
    // map risk pref to a numeric appetite
    const riskMap: Record<string, number> = { low: 0, medium: 0.5, high: 1 };
    const appetite = riskMap[riskPref] ?? 0.5;

    // risk alignment score: if equity-like, aligned when appetite high; if conservative category, aligned when appetite low
    let riskAlignment = 0.5; // neutral
    if (equityLike) riskAlignment = appetite; // 0..1
    else if (mixedLike) riskAlignment = 0.5; // neutral
    else riskAlignment = 1 - appetite;

    // scale to boost range [-riskBoostMax, +riskBoostMax]
    const riskBoost = (riskAlignment - 0.5) * 2 * WEIGHTS.riskBoostMax; // centered at 0

    // ageRange influence: slightly penalize equity for over50, favor equity slightly for under35
    let ageBoost = 0;
    if (profile.ageRange === 'over50' && equityLike) ageBoost -= WEIGHTS.ageConservatism;
    if (profile.ageRange === 'under35' && equityLike) ageBoost += WEIGHTS.ageConservatism / 2;

  // hasFpn influence: prefer funds of type 'FPN' when user has a contractual FPN
  const fundTypeNorm = (fund.type ?? '').toString().toUpperCase().trim();
  const hasFpnBoost = profile.hasFpn === true && fundTypeNorm === 'FPN' ? WEIGHTS.hasFpnBoost : 0;

    // contract category preference: small boost if matches known contractual category
  const contractualBoost = profile.contractualFpnCategory && (fund.categoria ?? '').toString() === profile.contractualFpnCategory ? WEIGHTS.contractualCategoryBoost : 0;

    const score = WEIGHTS.cost * costScore + WEIGHTS.returns * returnScore + riskBoost + ageBoost + hasFpnBoost + contractualBoost;

    return { fund, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map(s => s.fund);
}

export default computeShortlist;
