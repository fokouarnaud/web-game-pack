/**
 * Toast Notification System avec animations avancées
 * Task 9: Amélioration UX/UI - Phase 2
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
    'transform-gpu',
    'data-[swipe=cancel]:translate-x-0',
    'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
    'data-[swipe=move]:transition-none',
    'data-[state=open]:animate-slide-down',
    'data-[state=closed]:animate-fade-out',
    'data-[state=closed]:fade-out-0',
    'data-[state=closed]:zoom-out-95',
    'data-[state=open]:fade-in-0',
    'data-[state=open]:zoom-in-95',
  ],
  {
    variants: {
      variant: {
        default: [
          'border bg-background text-foreground',
          'hover:bg-background/80',
        ],
        success: [
          'border-green-200 bg-green-50 text-green-900',
          'dark:border-green-800 dark:bg-green-950 dark:text-green-100',
          'hover:bg-green-100 dark:hover:bg-green-900',
        ],
        destructive: [
          'border-red-200 bg-red-50 text-red-900',
          'dark:border-red-800 dark:bg-red-950 dark:text-red-100',
          'hover:bg-red-100 dark:hover:bg-red-900',
        ],
        warning: [
          'border-yellow-200 bg-yellow-50 text-yellow-900',
          'dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
          'hover:bg-yellow-100 dark:hover:bg-yellow-900',
        ],
        info: [
          'border-blue-200 bg-blue-50 text-blue-900',
          'dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
          'hover:bg-blue-100 dark:hover:bg-blue-900',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
  duration?: number;
  persistent?: boolean;
  icon?: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant,
      title,
      description,
      action,
      onClose,
      duration = 5000,
      persistent = false,
      icon,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [progress, setProgress] = React.useState(100);
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const intervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    // Auto-dismiss avec barre de progression
    React.useEffect(() => {
      if (persistent) return;

      const startTime = Date.now();
      const updateInterval = 50;

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (duration - elapsed) / duration * 100);
        setProgress(remaining);

        if (remaining === 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, updateInterval);

      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [duration, persistent]);

    const handleClose = React.useCallback(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Laisser le temps à l'animation de se terminer
    }, [onClose]);

    const getIcon = () => {
      if (icon) return icon;
      
      switch (variant) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'destructive':
          return <AlertCircle className="h-5 w-5 text-red-600" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        case 'info':
          return <Info className="h-5 w-5 text-blue-600" />;
        default:
          return null;
      }
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {/* Barre de progression */}
        {!persistent && (
          <div className="absolute bottom-0 left-0 h-1 bg-black/10 dark:bg-white/10 w-full">
            <div
              className="h-full bg-current transition-all duration-50 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Contenu principal */}
        <div className="flex items-start space-x-3 flex-1">
          {getIcon() && (
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
          )}
          
          <div className="flex-1 space-y-1">
            {title && (
              <div className="text-sm font-semibold">
                {title}
              </div>
            )}
            {description && (
              <div className="text-sm opacity-90">
                {description}
              </div>
            )}
            {action && (
              <div className="mt-3">
                {action}
              </div>
            )}
          </div>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Toast Provider et Context
interface ToastContextType {
  toast: (props: Omit<ToastProps, 'onClose'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastProps['position'];
  maxToasts?: number;
}

interface ToastState extends ToastProps {
  id: string;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = React.useState<ToastState[]>([]);

  const toast = React.useCallback((props: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastState = { ...props, id };

    setToasts(prev => {
      const updated = [...prev, newToast];
      // Limiter le nombre de toasts
      if (updated.length > maxToasts) {
        return updated.slice(-maxToasts);
      }
      return updated;
    });

    return id;
  }, [maxToasts]);

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-0 right-0 flex-col';
      case 'top-left':
        return 'top-0 left-0 flex-col';
      case 'bottom-right':
        return 'bottom-0 right-0 flex-col-reverse';
      case 'bottom-left':
        return 'bottom-0 left-0 flex-col-reverse';
      case 'top-center':
        return 'top-0 left-1/2 transform -translate-x-1/2 flex-col';
      case 'bottom-center':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 flex-col-reverse';
      default:
        return 'top-0 right-0 flex-col';
    }
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      
      {/* Container de toasts */}
      <div
        className={cn(
          'fixed z-[100] flex max-h-screen w-full max-w-sm space-y-4 p-4 pointer-events-none',
          getPositionClasses()
        )}
      >
        {toasts.map(({ id, ...toastProps }) => (
          <Toast
            key={id}
            {...toastProps}
            onClose={() => dismiss(id)}
            className="pointer-events-auto"
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook pour utiliser les toasts
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Helpers pour les différents types de toasts
export const createToastHelpers = (toast: ToastContextType['toast']) => ({
  success: (title: string, description?: string) =>
    toast({ variant: 'success', title, description }),
  
  error: (title: string, description?: string) =>
    toast({ variant: 'destructive', title, description }),
  
  warning: (title: string, description?: string) =>
    toast({ variant: 'warning', title, description }),
  
  info: (title: string, description?: string) =>
    toast({ variant: 'info', title, description }),
  
  loading: (title: string, description?: string) =>
    toast({ 
      variant: 'default', 
      title, 
      description, 
      persistent: true,
      icon: <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
    }),
});

export { Toast, toastVariants };