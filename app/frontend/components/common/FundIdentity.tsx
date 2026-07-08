import React from 'react';
import type { PensionFund } from '../../types';

interface FundIdentityProps {
  fund: PensionFund;
  compact?: boolean;
  className?: string;
  titleClassName?: string;
}

const FundIdentity: React.FC<FundIdentityProps> = ({ fund, compact = false, className = '', titleClassName = '' }) => (
  <div className={`min-w-0 ${className}`}>
    <div
      className={`${compact ? 'text-sm' : 'text-sm sm:text-base'} truncate font-semibold leading-snug text-slate-900 dark:text-slate-50 ${titleClassName}`}
      title={fund.linea}
    >
      <span className="align-bottom">{fund.linea}</span>
      {fund.chiusoNuoviAderenti && (
        <span className="ml-1 font-black text-rose-600 dark:text-rose-400" aria-label="Chiuso ai nuovi aderenti">
          *
        </span>
      )}
    </div>
    <div className={`${compact ? 'text-[11px]' : 'text-xs'} truncate text-slate-500 dark:text-slate-400`} title={fund.pip}>
      {fund.pip}
    </div>
    {fund.societa && (
      <div className={`${compact ? 'text-[11px]' : 'text-xs'} truncate font-medium text-slate-600 dark:text-slate-300`} title={fund.societa}>
        {fund.societa}
      </div>
    )}
  </div>
);

export default FundIdentity;
