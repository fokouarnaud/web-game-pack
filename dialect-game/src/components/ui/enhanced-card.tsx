/**
 * Enhanced Card avec animations et interactions avancées
 * Task 9: Amélioration UX/UI - Phase 2
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const enhancedCardVariants = cva(
  [
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    'transition-all duration-300 ease-out',
    'transform-gpu',
  ],
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: [
          'shadow-lg hover:shadow-xl',
          'hover:-translate-y-1',
          'border-border/50',
        ],
        interactive: [
          'cursor-pointer',
          'hover:shadow-lg hover:-translate-y-0.5',
          'hover:border-primary/50',
          'active:translate-y-0 active:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        ],
        glass: [
          'glass',
          'border-white/20',
          'hover:border-white/30',
          'hover:bg-white/[0.15]',
        ],
        gradient: [
          'bg-gradient-to-br from-card via-card to-card/80',
          'border-gradient',
          'hover:from-card/90 hover:via-card hover:to-card/90',
        ],
      },
      size: {
        sm: 'p-3',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      animation: {
        none: '',
        fade: 'animate-fade-in',
        slide: 'animate-slide-up',
        scale: 'animate-scale-in',
      },
      glow: {
        none: '',
        subtle: 'hover:drop-shadow-glow-subtle',
        medium: 'hover:drop-shadow-glow-medium',
        strong: 'hover:drop-shadow-glow-strong',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
      glow: 'none',
    },
  }
);

interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedCardVariants> {
  hover?: boolean;
  loading?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      glow,
      hover = false,
      loading = false,
      selected = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          enhancedCardVariants({ variant, size, animation, glow }),
          {
            // États conditionnels
            'opacity-50 pointer-events-none': disabled,
            'loading-skeleton': loading,
            'ring-2 ring-primary ring-offset-2': selected,
            'hover-lift': hover && !disabled,
          },
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Overlay de loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-loading-dots"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-loading-dots [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-loading-dots [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}

        {/* Effet de brillance au hover */}
        {isHovered && variant === 'interactive' && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                       transform translate-x-[-100%] animate-[slide-right_0.6s_ease-out] pointer-events-none rounded-lg"
          />
        )}

        {children}
      </div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    centerContent?: boolean;
  }
>(({ className, centerContent = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 p-6',
      centerContent && 'items-center text-center',
      className
    )}
    {...props}
  />
));
EnhancedCardHeader.displayName = 'EnhancedCardHeader';

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean;
  }
>(({ className, gradient = false, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      gradient && 'bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent',
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = 'EnhancedCardTitle';

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    muted?: boolean;
  }
>(({ className, muted = true, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm leading-relaxed',
      muted ? 'text-muted-foreground' : 'text-foreground',
      className
    )}
    {...props}
  />
));
EnhancedCardDescription.displayName = 'EnhancedCardDescription';

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
EnhancedCardContent.displayName = 'EnhancedCardContent';

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    justify?: 'start' | 'center' | 'end' | 'between';
  }
>(({ className, justify = 'start', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center p-6 pt-0',
      {
        'justify-start': justify === 'start',
        'justify-center': justify === 'center',
        'justify-end': justify === 'end',
        'justify-between': justify === 'between',
      },
      className
    )}
    {...props}
  />
));
EnhancedCardFooter.displayName = 'EnhancedCardFooter';

// Hook pour animations de card
export const useCardAnimation = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return { isVisible, cardRef };
};

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  enhancedCardVariants,
};