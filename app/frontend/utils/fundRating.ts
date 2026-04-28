import type { FundRating, FundRatingClass, FundType, PensionFund, TipoAdesione } from '../types';

type RatingPeriod = '3y' | '5y' | '10y' | '15y' | '20y' | '25y';
type RatingInput = Pick<PensionFund, 'type' | 'isc' | 'rendimenti'>;

const BASE_WEIGHTS: Record<RatingPeriod, number> = {
  '3y': 0.15,
  '5y': 0.20,
  '10y': 0.25,
  '15y': 0.15,
  '20y': 0.15,
  '25y': 0.10,
};

const emptyScores = {
  score3y: null,
  score5y: null,
  score10y: null,
  score15y: null,
  score20y: null,
  score25y: null,
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const tipoAdesioneFromFundType = (type: FundType): TipoAdesione => (
  type === 'FPN' ? 'collettiva' : 'individuale'
);

export const ratingClassFromScore = (score: number): FundRatingClass => {
  if (score >= 8) return 'A';
  if (score >= 5) return 'B';
  if (score >= 2) return 'C';
  if (score >= 0) return 'D';
  return 'E';
};

export const ratingDescriptionFromClass = (ratingClass: FundRatingClass): string => {
  switch (ratingClass) {
    case 'A':
      return 'Eccellente';
    case 'B':
      return 'Buono';
    case 'C':
      return 'Medio';
    case 'D':
      return 'Debole';
    case 'E':
      return 'Scarso';
  }
};

export const calculateFundRating = (fund: RatingInput): FundRating => {
  const tipoAdesione = tipoAdesioneFromFundType(fund.type);

  if (fund.rendimenti.ultimi3Anni == null) {
    return {
      ammissibile: false,
      motivoEsclusione: 'Rendimento a 3 anni non disponibile',
      iscUtilizzato: null,
      iscOrizzonte: null,
      scores: emptyScores,
      ratingScore: null,
      classeRating: null,
      descrizioneRating: null,
      tipoAdesione,
    };
  }

  const iscUtilizzato = fund.isc.isc10a ?? fund.isc.isc5a;
  const iscOrizzonte = fund.isc.isc10a != null ? '10y' : fund.isc.isc5a != null ? '5y' : null;

  if (iscUtilizzato == null || iscOrizzonte == null) {
    return {
      ammissibile: false,
      motivoEsclusione: 'ISC non disponibile',
      iscUtilizzato: null,
      iscOrizzonte: null,
      scores: emptyScores,
      ratingScore: null,
      classeRating: null,
      descrizioneRating: null,
      tipoAdesione,
    };
  }

  const availableScores: Partial<Record<RatingPeriod, number>> = {
    '3y': fund.rendimenti.ultimi3Anni != null ? round2(fund.rendimenti.ultimi3Anni - iscUtilizzato) : undefined,
    '5y': fund.rendimenti.ultimi5Anni != null ? round2(fund.rendimenti.ultimi5Anni - iscUtilizzato) : undefined,
    '10y': fund.rendimenti.ultimi10Anni != null ? round2(fund.rendimenti.ultimi10Anni - iscUtilizzato) : undefined,
    '20y': fund.rendimenti.ultimi20Anni != null ? round2(fund.rendimenti.ultimi20Anni - iscUtilizzato) : undefined,
  };
  const periods = (Object.keys(availableScores) as RatingPeriod[]).filter((period) => availableScores[period] != null);
  const weightSum = periods.reduce((sum, period) => sum + BASE_WEIGHTS[period], 0);
  const ratingScore = round2(
    periods.reduce((sum, period) => {
      const score = availableScores[period];
      return score == null ? sum : sum + score * (BASE_WEIGHTS[period] / weightSum);
    }, 0)
  );
  const classeRating = ratingClassFromScore(ratingScore);

  return {
    ammissibile: true,
    motivoEsclusione: null,
    iscUtilizzato,
    iscOrizzonte,
    scores: {
      score3y: availableScores['3y'] ?? null,
      score5y: availableScores['5y'] ?? null,
      score10y: availableScores['10y'] ?? null,
      score15y: null,
      score20y: availableScores['20y'] ?? null,
      score25y: null,
    },
    ratingScore,
    classeRating,
    descrizioneRating: ratingDescriptionFromClass(classeRating),
    tipoAdesione,
  };
};

export const ratingBadgeClasses = (ratingClass: FundRatingClass | null): string => {
  switch (ratingClass) {
    case 'A':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/35 dark:text-emerald-200 dark:border-emerald-800';
    case 'B':
      return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/35 dark:text-lime-200 dark:border-lime-800';
    case 'C':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/35 dark:text-amber-200 dark:border-amber-800';
    case 'D':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/35 dark:text-orange-200 dark:border-orange-800';
    case 'E':
      return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/35 dark:text-rose-200 dark:border-rose-800';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};
