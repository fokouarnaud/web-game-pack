/**
 * Enhanced Button avec animations et micro-interactions avancées
 * Task 9: Amélioration UX/UI - Phase 2
 */

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const enhancedButtonVariants = cva(
  // Classes de base avec animations fluides
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'ring-offset-background transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    // Micro-interactions
    'transform-gpu',
    'hover:scale-[1.02] active:scale-[0.98]',
    'hover:shadow-lg hover:-translate-y-0.5',
    'active:transition-none',
    // Animations de glow subtiles
    'relative overflow-hidden',
    'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
    'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'shadow-md shadow-primary/25',
          'hover:shadow-primary/40',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
          'shadow-md shadow-destructive/25',
          'hover:shadow-destructive/40',
        ],
        outline: [
          'border border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
          'hover:border-primary/50',
          'shadow-sm hover:shadow-md',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
          'shadow-sm hover:shadow-md',
        ],
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
          'hover:shadow-sm',
        ],
        link: [
          'text-primary underline-offset-4',
          'hover:underline hover:text-primary/80',
          'shadow-none hover:shadow-none',
          'transform-none hover:scale-100 hover:translate-y-0',
        ],
        success: [
          'bg-green-600 text-white',
          'hover:bg-green-700',
          'shadow-md shadow-green-600/25',
          'hover:shadow-green-600/40',
        ],
        warning: [
          'bg-yellow-600 text-white',
          'hover:bg-yellow-700',
          'shadow-md shadow-yellow-600/25',
          'hover:shadow-yellow-600/40',
        ],
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-md px-10 text-base',
        icon: 'h-10 w-10',
      },
      glow: {
        none: '',
        subtle: 'hover:drop-shadow-glow-subtle',
        medium: 'hover:drop-shadow-glow-medium',
        strong: 'hover:drop-shadow-glow-strong',
      },
      rounded: {
        default: 'rounded-md',
        sm: 'rounded-sm',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      glow: 'none',
      rounded: 'default',
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
  tooltip?: string;
  badge?: string | number;
  pulse?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      glow,
      rounded,
      asChild = false,
      loading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      ripple = true,
      tooltip,
      badge,
      pulse = false,
      disabled,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const [rippleEffect, setRippleEffect] = React.useState<{
      x: number;
      y: number;
      show: boolean;
    } | null>(null);

    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => buttonRef.current!);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;

        // Effet ripple
        if (ripple && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          
          setRippleEffect({ x, y, show: true });
          
          // Nettoyer l'effet après animation
          setTimeout(() => setRippleEffect(null), 600);
        }

        // Feedback haptique (si disponible)
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }

        onClick?.(event);
      },
      [disabled, loading, ripple, onClick]
    );

    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <div className="relative inline-block">
        <Comp
          className={cn(
            enhancedButtonVariants({ variant, size, glow, rounded }),
            {
              // États spéciaux
              'animate-pulse': pulse && !loading,
              'cursor-not-allowed': isDisabled,
              'cursor-wait': loading,
            },
            className
          )}
          ref={buttonRef}
          disabled={isDisabled}
          onClick={handleClick}
          title={tooltip}
          aria-label={props['aria-label'] || tooltip}
          {...props}
        >
          {/* Effet ripple */}
          {rippleEffect?.show && (
            <span
              className="absolute rounded-full bg-white/30 animate-ping"
              style={{
                left: rippleEffect.x - 10,
                top: rippleEffect.y - 10,
                width: 20,
                height: 20,
              }}
            />
          )}

          {/* Contenu du bouton */}
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText || 'Chargement...'}
            </>
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <span className="inline-flex shrink-0">{icon}</span>
              )}
              
              <span className="flex-1">{children}</span>
              
              {icon && iconPosition === 'right' && (
                <span className="inline-flex shrink-0">{icon}</span>
              )}
            </>
          )}

          {/* Badge de notification */}
          {badge && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {badge}
            </span>
          )}
        </Comp>

        {/* Tooltip amélioré */}
        {tooltip && (
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
            {tooltip}
          </div>
        )}
      </div>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, enhancedButtonVariants };