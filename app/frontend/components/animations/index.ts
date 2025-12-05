/**
 * Animation Components - Barrel Export
 * 
 * Convenient imports for all animation components
 * Usage: import { AnimatedButton, showToast } from './components/animations';
 */

export { AnimatedCard } from './AnimatedCard';
export { AnimatedButton } from './AnimatedButton';
export { PageTransition, StaggeredList } from './PageTransition';
export {
  Skeleton,
  TableRowSkeleton,
  CardSkeleton,
  ChartSkeleton,
  FilterSkeleton,
  TableSkeleton,
} from './SkeletonLoader';
export { FloatingActionButton, CompactFAB } from './FloatingActionButton';
export { showToast, ToastProvider } from './ToastNotifications';
export {
  ScrollReveal,
  StaggeredScrollReveal,
  ParallaxScroll,
  ScrollProgress,
  ScrollToTop,
} from './ScrollReveal';
export { FloatingCompareButton, CompactFloatingCompareButton } from './FloatingCompareButton';

/**
 * Quick Reference:
 * 
 * import {
 *   AnimatedCard,        // Reusable animated card
 *   AnimatedButton,      // Button with micro-interactions
 *   PageTransition,      // Smooth page transitions
 *   StaggeredList,       // List with stagger animation
 *   TableSkeleton,       // Loading skeleton for tables
 *   FloatingActionButton,// FAB for quick actions
 *   showToast,          // Toast notification helper
 *   ToastProvider,      // Toast container (add to App)
 * } from './components/animations';
 */
