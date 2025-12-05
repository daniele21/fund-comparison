/**
 * Skeleton Loading Components
 * 
 * Professional skeleton screens for better perceived performance
 * Replaces blank screens during data loading
 */

import React from 'react';
import { motion } from 'framer-motion';

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 2,
    ease: 'linear',
    repeat: Infinity,
  },
};

// Base skeleton element
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    className={`bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded ${className}`}
    style={{ backgroundSize: '200% 100%' }}
    animate={shimmer.animate}
    transition={shimmer.transition}
  />
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC = () => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="border-b border-slate-200 dark:border-slate-700"
  >
    <td className="px-3 py-4">
      <Skeleton className="h-4 w-4 rounded-full" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-4 w-48" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-4 w-16" />
    </td>
    <td className="px-2 py-4 text-right">
      <Skeleton className="h-4 w-12 ml-auto" />
    </td>
    <td className="px-2 py-4 text-right">
      <Skeleton className="h-4 w-12 ml-auto" />
    </td>
    <td className="px-2 py-4 text-right">
      <Skeleton className="h-4 w-12 ml-auto" />
    </td>
  </motion.tr>
);

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}
  >
    <Skeleton className="h-6 w-3/4 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-2" />
    <Skeleton className="h-4 w-4/6 mb-4" />
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </motion.div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
  >
    <Skeleton className="h-6 w-48 mb-6" />
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-end gap-2" style={{ height: `${80 + Math.random() * 120}px` }}>
          <Skeleton className="w-full h-full" />
        </div>
      ))}
    </div>
  </motion.div>
);

// Filter Skeleton
export const FilterSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </motion.div>
);

// Full Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <tr>
            {[...Array(7)].map((_, i) => (
              <th key={i} className="px-3 py-3">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {[...Array(rows)].map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Usage Examples:
 * 
 * // Table loading
 * {isLoading ? <TableSkeleton rows={10} /> : <FundTable funds={funds} />}
 * 
 * // Card loading
 * {isLoading ? <CardSkeleton /> : <FundCard fund={fund} />}
 * 
 * // Multiple cards
 * {isLoading ? (
 *   <div className="grid grid-cols-3 gap-4">
 *     {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
 *   </div>
 * ) : (
 *   <FundGrid funds={funds} />
 * )}
 */
