import React from 'react';
import { cn } from '../../lib/utils';

// Types pour les variants et tailles
type SkeletonVariant = 'default' | 'card' | 'text' | 'avatar' | 'button';
type SkeletonSize = 'sm' | 'md' | 'lg' | 'xl';

// Interface principale du composant
export interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  size?: SkeletonSize;
  width?: string | number;
  height?: string | number;
  className?: string;
  showText?: boolean;
  children?: React.ReactNode;
}

// Configuration des variants avec gaming UI
const skeletonVariants = {
  default: 'bg-muted animate-pulse rounded-md',
  card: 'gaming-card bg-muted/50 animate-pulse rounded-lg',
  text: 'bg-muted animate-pulse rounded h-4',
  avatar: 'bg-muted animate-pulse rounded-full',
  button: 'gaming-button bg-muted animate-pulse rounded-md'
};
// Configuration des tailles responsive
const skeletonSizes = {
  sm: 'h-4',
  md: 'h-6', 
  lg: 'h-8',
  xl: 'h-12'
};

// Composant principal LoadingSkeleton
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'default',
  size = 'md',
  width,
  height,
  className,
  showText = false,
  children,
  ...props
}) => {
  // Styles de base avec gaming theme
  const baseStyles = cn(
    skeletonVariants[variant],
    !height && skeletonSizes[size],
    className
  );

  // Styles inline pour dimensions personnalisées
  const inlineStyles: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={baseStyles}
      style={inlineStyles}
      role="status"
      aria-label="Chargement en cours"
      aria-live="polite"
      {...props}
    >
      {children}
      {showText && (
        <span className="sr-only">Chargement en cours...</span>
      )}
    </div>
  );
};
// Composant spécialisé pour skeleton de leçon
export interface LessonSkeletonProps {
  className?: string;
}

export const LessonSkeleton: React.FC<LessonSkeletonProps> = ({ 
  className 
}) => {
  return (
    <div 
      className={cn('space-y-6 p-6', className)}
      role="status"
      aria-label="Chargement de la leçon"
      aria-live="polite"
    >
      {/* Header skeleton avec gaming style */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <LoadingSkeleton variant="text" width="40%" height="24px" />
          <LoadingSkeleton variant="button" width="80px" height="32px" />
        </div>
        
        {/* Progress bar skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <LoadingSkeleton variant="text" width="30%" height="16px" />
            <LoadingSkeleton variant="text" width="20%" height="16px" />
          </div>
          <LoadingSkeleton variant="default" height="8px" className="rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="gaming-card p-6 space-y-4">
        <LoadingSkeleton variant="text" width="60%" height="28px" />
        <LoadingSkeleton variant="text" width="90%" height="20px" />
        <LoadingSkeleton variant="text" width="75%" height="20px" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <LoadingSkeleton variant="card" height="120px" />
          <LoadingSkeleton variant="card" height="120px" />
        </div>
        
        {/* Button row skeleton */}
        <div className="flex justify-center gap-3 mt-8">
          <LoadingSkeleton variant="button" width="120px" height="44px" />
          <LoadingSkeleton variant="button" width="120px" height="44px" />
        </div>
      </div>
    </div>
  );
};
// Composant pour skeleton de carte gaming
export interface GameCardSkeletonProps {
  count?: number;
  className?: string;
}

export const GameCardSkeleton: React.FC<GameCardSkeletonProps> = ({ 
  count = 3,
  className 
}) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="gaming-card p-4 space-y-3"
          role="status"
          aria-label={`Chargement de la carte ${index + 1}`}
        >
          <LoadingSkeleton variant="avatar" size="lg" className="mx-auto w-16 h-16" />
          <LoadingSkeleton variant="text" height="20px" />
          <LoadingSkeleton variant="text" width="80%" height="16px" />
          <LoadingSkeleton variant="button" height="36px" className="w-full mt-4" />
        </div>
      ))}
    </div>
  );
};

// Export par défaut
LoadingSkeleton.displayName = 'LoadingSkeleton';
LessonSkeleton.displayName = 'LessonSkeleton';
GameCardSkeleton.displayName = 'GameCardSkeleton';

export default LoadingSkeleton;