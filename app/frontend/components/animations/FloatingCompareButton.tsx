/**
 * FloatingCompareButton Component
 * 
 * A floating action button that shows the count of selected funds
 * and provides quick access to scroll to the comparison section
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingCompareButtonProps {
  /** Number of selected funds */
  selectedCount: number;
  /** Maximum allowed selections */
  maxCount?: number;
  /** Callback when button is clicked */
  onClick: () => void;
  /** Whether the button should be visible */
  show?: boolean;
  /** Position of the button */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const FloatingCompareButton: React.FC<FloatingCompareButtonProps> = ({
  selectedCount,
  maxCount = 10,
  onClick,
  show = true,
  position = 'bottom-right',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6',
  };

  const shouldShow = show && selectedCount > 0;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Button clicked, count:', selectedCount);
            onClick();
          }}
          className={`fixed ${positionClasses[position]} z-[9999] group cursor-pointer`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Compare ${selectedCount} selected funds`}
        >
          {/* Main button */}
          <div className="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 pointer-events-none">
            {/* Icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 pointer-events-none" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>

            {/* Text */}
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium opacity-90">Confronta</span>
              <span className="text-sm font-bold">
                {selectedCount} {selectedCount === 1 ? 'fondo' : 'fondi'}
              </span>
            </div>

            {/* Badge with count */}
            <motion.div
              className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 bg-white text-sky-600 rounded-full font-bold text-sm shadow-md border-2 border-sky-600 pointer-events-none"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {selectedCount}
            </motion.div>

            {/* Progress ring (if max count) */}
            {maxCount && (
              <svg className="absolute -inset-1 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 48 * (1 - selectedCount / maxCount),
                  }}
                  transition={{ duration: 0.5 }}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                  }}
                />
              </svg>
            )}
          </div>

          {/* Tooltip on hover */}
          <motion.div
            className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            initial={{ y: 5, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
          >
            Vai al confronto
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
          </motion.div>

          {/* Pulse ring animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-sky-500 pointer-events-none -z-10"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{
              scale: [1, 1.2, 1.4],
              opacity: [0.5, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/**
 * Compact version for mobile with just icon and badge
 */
export const CompactFloatingCompareButton: React.FC<FloatingCompareButtonProps> = ({
  selectedCount,
  onClick,
  show = true,
  position = 'bottom-right',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  const shouldShow = show && selectedCount > 0;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          onClick={onClick}
          className={`fixed ${positionClasses[position]} z-40 w-14 h-14 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Compare ${selectedCount} selected funds`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>

          {/* Badge */}
          <motion.div
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-white text-sky-600 rounded-full font-bold text-xs shadow-md border-2 border-sky-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {selectedCount}
          </motion.div>

          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-sky-500"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{
              scale: [1, 1.3],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
