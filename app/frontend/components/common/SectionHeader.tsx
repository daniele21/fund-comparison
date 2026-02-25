import React from 'react';
import { AnimatedButton } from '../animations/AnimatedButton';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  badge?: {
    text: string;
    variant?: 'new' | 'beta' | 'updated' | 'info';
  };
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  tourAction?: {
    label?: string;
    onClick: () => void;
  };
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  badge,
  primaryAction,
  secondaryAction,
  tourAction,
  stats,
}) => {
  const badgeColors = {
    new: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    beta: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    updated: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm backdrop-blur-sm">
      <div className="px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8">
        {/* Header Top */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {/* Eyebrow Tag */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                {eyebrow}
              </span>

              {/* Optional Badge */}
              {badge && (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${badgeColors[badge.variant || 'info']}`}>
                  {badge.text}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3 leading-tight">
              {title}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {description}
            </p>
          </div>

          {/* Right: Actions */}
          {(primaryAction || secondaryAction || tourAction) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2 sm:gap-3 shrink-0">
              {/* Tour Button */}
              {tourAction && (
                <button
                  onClick={tourAction.onClick}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                  title="Avvia tour guidato"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">{tourAction.label || 'Tour Guidato'}</span>
                  <span className="sm:hidden">Tour</span>
                </button>
              )}

              {/* Secondary Action */}
              {secondaryAction && (
                <AnimatedButton
                  onClick={secondaryAction.onClick}
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  {secondaryAction.icon}
                  {secondaryAction.label}
                </AnimatedButton>
              )}

              {/* Primary Action */}
              {primaryAction && (
                <AnimatedButton
                  onClick={primaryAction.onClick}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto shadow-lg shadow-blue-500/20"
                >
                  {primaryAction.icon}
                  {primaryAction.label}
                </AnimatedButton>
              )}
            </div>
          )}
        </div>

        {/* Optional Stats Bar */}
        {stats && stats.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                  {stat.icon && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {stat.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
