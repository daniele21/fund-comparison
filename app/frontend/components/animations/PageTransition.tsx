/**
 * Page Transition Component
 * 
 * Provides smooth transitions between different views/sections
 * with customizable animation variants
 */

import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'scale' | 'blur';
  duration?: number;
  className?: string;
}

// Animation variants library
const transitionVariants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
  variant = 'slideUp',
  duration = 0.3,
  className = '',
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        variants={transitionVariants[variant]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          ease: [0.22, 1, 0.36, 1], // Custom easing for smooth feel
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Staggered List Animation Component
 * Animates children with a stagger effect
 */
interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className = '',
  staggerDelay = 0.05,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

/**
 * Usage Examples:
 * 
 * // Page transition
 * <PageTransition pageKey={activeSection} variant="slideUp">
 *   <DashboardContent />
 * </PageTransition>
 * 
 * // Staggered list
 * <StaggeredList>
 *   {funds.map(fund => (
 *     <FundCard key={fund.id} fund={fund} />
 *   ))}
 * </StaggeredList>
 * 
 * // Custom duration
 * <PageTransition pageKey="chart-view" variant="blur" duration={0.5}>
 *   <PerformanceChart />
 * </PageTransition>
 */
