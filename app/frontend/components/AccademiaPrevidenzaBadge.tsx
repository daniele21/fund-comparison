import React from 'react';
import { BRAND_TOKENS } from '../config/brandTokens';

interface AccademiaPrevidenzaBadgeProps {
  location?: 'header' | 'footer' | 'playbook-header' | 'playbook-footer';
}

const AccademiaPrevidenzaBadge: React.FC<AccademiaPrevidenzaBadgeProps> = ({ location = 'footer' }) => {
  const trackingUrl = `${BRAND_TOKENS.websiteUrl}?utm_source=fondi-pensione&utm_medium=badge&utm_campaign=webapp-branding&utm_content=${location}`;
  
  return (
    <a
      href={trackingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-300 ease-out cursor-pointer backdrop-blur-sm"
      title={`Visita il sito di ${BRAND_TOKENS.name}`}
    >
      <img
        src={BRAND_TOKENS.logo.pwa192}
        alt={BRAND_TOKENS.name}
        className="h-6 dark:hidden drop-shadow-sm group-hover:drop-shadow-md transition-all"
      />
      <img
        src={BRAND_TOKENS.logo.horizontal}
        alt={BRAND_TOKENS.name}
        className="h-6 hidden dark:block drop-shadow-sm group-hover:drop-shadow-md transition-all"
      />
      {/* <span className="text-[9px] text-slate-600 dark:text-slate-400 font-medium leading-tight tracking-wide group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors text-center">
        Un prodotto di
        <br />
        {BRAND_TOKENS.name}
      </span> */}
    </a>
  );
};

export default AccademiaPrevidenzaBadge;
