import type { PensionFund, UserProfile } from '../types';
import { FUND_LOGIC_CONFIG } from '../config/fundLogicConfig';

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
  const shortlistConfig = FUND_LOGIC_CONFIG.shortlist;
  const {
    weights,
    horizonCategoryRules,
    missingValues,
    riskPreferenceMap,
    categoryPatterns,
    ageBias,
  } = shortlistConfig;

  const categoryRule =
    horizonCategoryRules.find(rule => horizon <= rule.maxYearsInclusive) ??
    horizonCategoryRules[horizonCategoryRules.length - 1];
  const targetCategories = categoryRule.categories;

  // Helper: normalized cost (lower is better). Use 0..1 range where 0 is worst, 1 is best for scores
  const costs = funds.map(f => (f.isc?.isc35a == null ? missingValues.cost : f.isc.isc35a));
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);

  const returns10 = funds.map(f => (f.rendimenti.ultimi10Anni == null ? missingValues.returns10y : f.rendimenti.ultimi10Anni));
  const minR = Math.min(...returns10);
  const maxR = Math.max(...returns10);

  const normalized = (v: number, min: number, max: number) => (max === min ? 0.5 : (v - min) / (max - min));

  const filtered = funds.filter(fund => {
    const cat = (fund.categoria ?? '').toString().toUpperCase();
    return targetCategories.some(catTarget => cat.includes(catTarget));
  });

  // FPN filtering logic:
  // 1. If user has NO FPN (hasFpn === false), exclude all FPN funds
  // 2. If user has FPN and selected a specific category, only include FPN funds matching that category
  // 3. If user has FPN but no specific category selected, include all FPN funds
  const filteredAfterFpnPref = filtered.filter(fund => {
    const fundTypeNorm = (fund.type ?? '').toString().toUpperCase().trim();
    
    // Case 1: User explicitly does NOT have FPN - exclude all FPN funds
    if (profile.hasFpn === false && fundTypeNorm === 'FPN') {
      return false;
    }
    
    // Case 2: User HAS FPN and selected a specific contractual category
    if (profile.hasFpn === true && profile.contractualFpnCategory && fundTypeNorm === 'FPN') {
      // Only include this FPN fund if it matches the selected category
      if (fund.categoriaContratto) {
        const fundContracts = fund.categoriaContratto.split(',').map(c => c.trim());
        return fundContracts.includes(profile.contractualFpnCategory);
      }
      // If FPN fund has no categoriaContratto, exclude it
      return false;
    }
    
    return true;
  });

  const scored = filteredAfterFpnPref.map(fund => {
    const cost = fund.isc?.isc35a == null ? missingValues.cost : fund.isc.isc35a;
    const ret10 = fund.rendimenti.ultimi10Anni == null ? missingValues.returns10y : fund.rendimenti.ultimi10Anni;

    // normalized: higher is better for these components
    const costScore = 1 - normalized(cost, minCost, maxCost); // 1 best, 0 worst
    const returnScore = normalized(ret10, minR, maxR);

    // Stronger, graded risk preference effect
    const categoryUpper = (fund.categoria ?? '').toString().toUpperCase();
    const equityLike = categoryPatterns.equityLike.some(pattern => categoryUpper.includes(pattern));
    const mixedLike = categoryPatterns.mixedLike.some(pattern => categoryUpper.includes(pattern));

    const riskPref = profile.riskPreference ?? 'medium';
    const appetite = riskPreferenceMap[riskPref] ?? riskPreferenceMap.medium;

    // risk alignment score: if equity-like, aligned when appetite high; if conservative category, aligned when appetite low
    let riskAlignment = 0.5; // neutral
    if (equityLike) riskAlignment = appetite; // 0..1
    else if (mixedLike) riskAlignment = 0.5; // neutral
    else riskAlignment = 1 - appetite;

    // scale to boost range [-riskBoostMax, +riskBoostMax]
    const riskBoost = (riskAlignment - 0.5) * 2 * weights.riskBoostMax; // centered at 0

    // ageRange influence: slightly penalize equity for over50, favor equity slightly for under35
    let ageBoost = 0;
    if (profile.ageRange === 'over50' && equityLike) ageBoost -= weights.ageConservatism;
    if (profile.ageRange === 'under35' && equityLike) {
      ageBoost += weights.ageConservatism * ageBias.under35BoostFactor;
    }

    // hasFpn influence: prefer funds of type 'FPN' when user has a contractual FPN
    const fundTypeNorm = (fund.type ?? '').toString().toUpperCase().trim();
    const hasFpnBoost = profile.hasFpn === true && fundTypeNorm === 'FPN' ? weights.hasFpnBoost : 0;

    // contract category preference: small boost if matches known contractual category
    // Check if the selected contractual category matches any of the fund's categoriaContratto values
    let contractualBoost = 0;
    if (profile.contractualFpnCategory && fund.categoriaContratto) {
      const fundContracts = fund.categoriaContratto.split(',').map(c => c.trim());
      if (fundContracts.includes(profile.contractualFpnCategory)) {
        contractualBoost = weights.contractualCategoryBoost;
      }
    }

    const score = weights.cost * costScore + weights.returns * returnScore + riskBoost + ageBoost + hasFpnBoost + contractualBoost;

    return { fund, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map(s => s.fund);
}

export default computeShortlist;
