/**
 * Floating Action Button (FAB)
 * 
 * A sticky button that appears when funds are selected
 * Perfect for quick actions like "Compare" or "Analyze"
 */

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingActionButtonProps {
  isVisible: boolean;
  onClick: () => void;
  icon?: ReactNode;
  badge?: number;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'primary' | 'success' | 'warning';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  isVisible,
  onClick,
  icon,
  badge,
  label = 'Compare',
  position = 'bottom-right',
  variant = 'primary',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className={`fixed z-50 ${positionClasses[position]} ${variantClasses[variant]} 
            rounded-full px-6 py-4 shadow-2xl flex items-center gap-3 
            font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-blue-300
            backdrop-blur-sm`}
          initial={{ scale: 0, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 100 }}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }}
          onClick={onClick}
        >
          {/* Icon */}
          {icon && (
            <motion.div
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          {/* Label */}
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {label}
          </motion.span>

          {/* Badge */}
          {badge !== undefined && badge > 0 && (
            <motion.div
              className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold 
                rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 shadow-lg
                border-2 border-white dark:border-slate-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 15,
                delay: 0.3,
              }}
            >
              {badge > 99 ? '99+' : badge}
            </motion.div>
          )}

          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white opacity-0"
            initial={false}
            whileTap={{ opacity: [0, 0.3, 0], scale: [0.8, 1.2] }}
            transition={{ duration: 0.4 }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/**
 * Compact FAB for mobile
 */
export const CompactFAB: React.FC<{
  isVisible: boolean;
  onClick: () => void;
  icon: ReactNode;
  badge?: number;
}> = ({ isVisible, onClick, icon, badge }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="fixed bottom-6 right-6 z-50 
            bg-gradient-to-r from-blue-600 to-blue-700 
            text-white rounded-full p-4 shadow-2xl
            focus:outline-none focus:ring-4 focus:ring-blue-300"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={onClick}
        >
          {icon}
          
          {badge !== undefined && badge > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold 
                rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 
                border-2 border-white dark:border-slate-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              {badge}
            </motion.div>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/**
 * Usage Examples:
 * 
 * // Desktop FAB with badge
 * <FloatingActionButton
 *   isVisible={selectedFunds.length > 0}
 *   onClick={handleCompare}
 *   icon={<ChartBarIcon className="w-6 h-6" />}
 *   badge={selectedFunds.length}
 *   label="Compare Funds"
 * />
 * 
 * // Mobile compact FAB
 * <CompactFAB
 *   isVisible={selectedFunds.length > 0}
 *   onClick={handleCompare}
 *   icon={<CompareIcon className="w-6 h-6" />}
 *   badge={selectedFunds.length}
 * />
 * 
 * // Success variant
 * <FloatingActionButton
 *   isVisible={hasResults}
 *   onClick={handleExport}
 *   variant="success"
 *   label="Export Results"
 *   icon={<DownloadIcon />}
 * />
 */
