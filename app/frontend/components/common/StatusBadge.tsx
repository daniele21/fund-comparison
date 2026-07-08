import React from 'react';

export type StatusBadgeVariant = 'new' | 'beta' | 'updated' | 'info';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  new: 'border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-300 dark:text-amber-950',
  beta: 'border-violet-300 bg-violet-100 text-violet-900 dark:border-violet-700 dark:bg-violet-900/50 dark:text-violet-100',
  updated: 'border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-100',
  info: 'border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-700 dark:bg-sky-900/50 dark:text-sky-100',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ children, variant = 'info', className = '' }) => (
  <span
    className={`inline-flex min-h-[1.625rem] items-center rounded-full border px-2.5 py-1 text-xs font-bold leading-none shadow-sm ${VARIANT_CLASSES[variant]} ${className}`}
  >
    {children}
  </span>
);

export default StatusBadge;
