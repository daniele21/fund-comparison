/**
 * ScrollReveal Component
 * 
 * Reveals elements with smooth animations as they enter the viewport
 * Uses Intersection Observer for performance-optimized scroll detection
 */

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  /** Animation variant to use */
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'blur';
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** How much of the element must be visible before animating (0-1) */
  threshold?: number;
  /** Whether to animate only once or every time element enters viewport */
  once?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional callback when element comes into view */
  onInView?: () => void;
}

// Animation variants library
const revealVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fadeIn',
  duration = 0.6,
  delay = 0,
  threshold = 0.1,
  once = true,
  className = '',
  onInView,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    if (isInView && !hasBeenInView) {
      setHasBeenInView(true);
      onInView?.();
    }
  }, [isInView, hasBeenInView, onInView]);

  return (
    <motion.div
      ref={ref}
      variants={revealVariants[variant]}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Smooth custom easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggeredScrollReveal Component
 * 
 * Reveals multiple children with staggered delays
 * Perfect for lists, grids, and repeated elements
 */

interface StaggeredScrollRevealProps {
  children: ReactNode;
  /** Animation variant for all children */
  variant?: ScrollRevealProps['variant'];
  /** Base duration for each child */
  duration?: number;
  /** Stagger delay between each child in seconds */
  staggerDelay?: number;
  /** Initial delay before first child animates */
  initialDelay?: number;
  /** Threshold for viewport detection */
  threshold?: number;
  /** Animate only once */
  once?: boolean;
  /** Container CSS classes */
  className?: string;
}

export const StaggeredScrollReveal: React.FC<StaggeredScrollRevealProps> = ({
  children,
  variant = 'slideUp',
  duration = 0.5,
  staggerDelay = 0.1,
  initialDelay = 0,
  threshold = 0.1,
  once = true,
  className = '',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const childArray = React.Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          variants={revealVariants[variant]}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{
            duration,
            delay: initialDelay + index * staggerDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

/**
 * ParallaxScroll Component
 * 
 * Creates subtle parallax scrolling effect
 * Perfect for hero sections and backgrounds
 */

interface ParallaxScrollProps {
  children: ReactNode;
  /** Parallax speed multiplier (0.1 = slow, 1 = normal speed, 2 = fast) */
  speed?: number;
  /** CSS classes */
  className?: string;
}

export const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  speed = 0.5,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollProgress = window.scrollY;
        setOffsetY(scrollProgress * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{
          y: offsetY,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/**
 * ScrollProgress Component
 * 
 * Shows a progress bar that fills as user scrolls down the page
 */

interface ScrollProgressProps {
  /** Position of the progress bar */
  position?: 'top' | 'bottom';
  /** Height of the progress bar in pixels */
  height?: number;
  /** Color of the progress bar (Tailwind class or CSS color) */
  color?: string;
  /** Z-index for positioning */
  zIndex?: number;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  position = 'top',
  height = 3,
  color = 'bg-sky-600',
  zIndex = 50,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const totalScroll = documentHeight - windowHeight;
      const progress = (scrollTop / totalScroll) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 ${color}`}
      style={{
        height: `${height}px`,
        width: `${scrollProgress}%`,
        zIndex,
      }}
      initial={{ width: 0 }}
      animate={{ width: `${scrollProgress}%` }}
      transition={{ duration: 0.1 }}
    />
  );
};

/**
 * ScrollToTop Component
 * 
 * A button that appears when user scrolls down and smoothly scrolls to top when clicked
 */

interface ScrollToTopProps {
  /** Show button after scrolling this many pixels */
  showAfter?: number;
  /** Position of the button */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** Custom CSS classes */
  className?: string;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  showAfter = 300,
  position = 'bottom-right',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfter);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  return (
    <motion.button
      onClick={scrollToTop}
      className={`fixed ${positionClasses[position]} z-50 rounded-full bg-sky-600 p-3 text-white shadow-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:bg-sky-500 dark:hover:bg-sky-600 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{ display: isVisible ? 'block' : 'none' }}
      aria-label="Scroll to top"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </motion.button>
  );
};
