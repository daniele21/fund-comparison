import React from 'react';
import type { PensionFund } from '../../types';
import {
  formatRatingScoreOutOfTen,
  formatRatingStarsText,
  ratingBadgeClasses,
  ratingStarsFromScore,
} from '../../utils/fundRating';

interface FundRatingBadgeProps {
  fund: PensionFund;
  compact?: boolean;
  variant?: 'class' | 'ranking';
  className?: string;
}

const FundRatingBadge: React.FC<FundRatingBadgeProps> = ({ fund, compact = false, variant = 'class', className = '' }) => {
  const stars = ratingStarsFromScore(fund.rating.ratingScore);
  const starsText = formatRatingStarsText(fund.rating.ratingScore);
  const score = formatRatingScoreOutOfTen(fund.rating.ratingScore);
  const title = fund.rating.ammissibile
    ? `Rating ${starsText}: ${fund.rating.descrizioneRating ?? ''}. Score ${score ?? 'N/D'}. ISC ${fund.rating.iscOrizzonte ?? 'N/D'} usato.`
    : fund.rating.motivoEsclusione ?? 'Rating non calcolabile';
  const starSizeClass = compact ? 'text-[12px]' : 'text-sm';
  const badgeClass = variant === 'ranking'
    ? 'bg-[rgb(var(--brand-accent-surface-rgb)/0.7)] text-[rgb(var(--brand-primary-deep-rgb)/1)] border-[rgb(var(--brand-accent-rgb)/0.45)] dark:bg-slate-900 dark:text-[rgb(var(--brand-accent-rgb)/1)] dark:border-[rgb(var(--brand-accent-rgb)/0.35)]'
    : ratingBadgeClasses(fund.rating.classeRating);

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border font-bold tabular-nums ${badgeClass} ${compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1 text-xs'} ${className}`}
      title={title}
      aria-label={title}
    >
      <span className={`tracking-normal ${starSizeClass}`} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fillPercent = stars == null ? 0 : Math.max(0, Math.min(1, stars - index)) * 100;
          return (
            <span key={index} className="relative inline-block text-slate-300 dark:text-slate-600">
              <span aria-hidden="true">★</span>
              <span className="absolute inset-0 overflow-hidden text-amber-500" style={{ width: `${fillPercent}%` }} aria-hidden="true">★</span>
            </span>
          );
        })}
      </span>
      <span className="sr-only">{starsText}</span>
      {score && <span className="font-semibold opacity-80">{score}</span>}
    </span>
  );
};

export default FundRatingBadge;
