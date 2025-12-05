/**
 * Reusable Animated Card Component
 * 
 * A professionally animated card with hover effects, tap feedback,
 * and smooth transitions. Perfect for fund cards, feature cards, etc.
 */

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'elevated';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  variant = 'default',
  hoverEffect = 'lift',
  className = '',
  ...motionProps
}) => {
  // Base styles for different variants
  const variantStyles = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    glass: 'bg-white/10 dark:bg-slate-800/10 backdrop-blur-lg border border-white/20 dark:border-slate-700/20',
    elevated: 'bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700',
  };

  // Hover animation configs
  const hoverConfigs = {
    lift: {
      y: -8,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    glow: {
      boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
    },
    scale: {
      scale: 1.02,
    },
    none: {},
  };

  return (
    <motion.div
      className={`rounded-xl p-6 transition-all duration-300 ${variantStyles[variant]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverConfigs[hoverEffect]}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

/**
 * Usage Examples:
 * 
 * // Default lifted card
 * <AnimatedCard>
 *   <h3>Fund Name</h3>
 *   <p>Performance: +5.2%</p>
 * </AnimatedCard>
 * 
 * // Glass effect with glow
 * <AnimatedCard variant="glass" hoverEffect="glow">
 *   <FeatureContent />
 * </AnimatedCard>
 * 
 * // Elevated with scale effect
 * <AnimatedCard variant="elevated" hoverEffect="scale" className="cursor-pointer">
 *   <ComparisonCard />
 * </AnimatedCard>
 */
