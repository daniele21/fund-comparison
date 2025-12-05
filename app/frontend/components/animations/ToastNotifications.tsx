/**
 * Toast Notification System Setup
 * 
 * Professional toast notifications with animations
 * Using react-hot-toast library
 */

import React from 'react';
import toast, { Toaster, Toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Custom toast component with animations
const CustomToast: React.FC<{ t: Toast; message: string; type: 'success' | 'error' | 'warning' | 'info' }> = ({
  t,
  message,
  type,
}) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    error: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
    warning: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : -50, scale: t.visible ? 1 : 0.8 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${bgColors[type]}`}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
      >
        {icons[type]}
      </motion.div>
      
      <p className="text-sm font-medium text-slate-900 dark:text-white">{message}</p>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => toast.dismiss(t.id)}
        className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

// Toast helper functions
export const showToast = {
  success: (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="success" />, {
      duration: 3000,
      position: 'top-right',
    });
  },
  
  error: (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="error" />, {
      duration: 4000,
      position: 'top-right',
    });
  },
  
  warning: (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="warning" />, {
      duration: 3500,
      position: 'top-right',
    });
  },
  
  info: (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="info" />, {
      duration: 3000,
      position: 'top-right',
    });
  },
  
  // Promise toast for async operations
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: {
          minWidth: '250px',
        },
        success: {
          duration: 3000,
        },
        error: {
          duration: 4000,
        },
      }
    );
  },
};

// Toaster component to add to App.tsx
export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    />
  );
};

/**
 * Usage Examples:
 * 
 * // In App.tsx, add ToastProvider
 * function App() {
 *   return (
 *     <>
 *       <ToastProvider />
 *       <YourAppContent />
 *     </>
 *   );
 * }
 * 
 * // In your components:
 * 
 * // Success notification
 * showToast.success('Fund added to comparison!');
 * 
 * // Error notification
 * showToast.error('Failed to load data');
 * 
 * // Warning
 * showToast.warning('You can select up to 5 funds');
 * 
 * // Info
 * showToast.info('Data updated 5 minutes ago');
 * 
 * // Promise toast (for async operations)
 * const fetchData = async () => {
 *   // ... your async code
 * };
 * 
 * showToast.promise(
 *   fetchData(),
 *   {
 *     loading: 'Loading funds...',
 *     success: 'Funds loaded successfully!',
 *     error: 'Failed to load funds',
 *   }
 * );
 */
