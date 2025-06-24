/**
 * LazyImage component - Image component with lazy loading and optimizations
 * Task 4: Système d'assets placeholder - Composant moderne
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ImageAsset } from '../../services/api/assetsApi';

export interface LazyImageProps {
  asset: ImageAsset;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: React.ReactNode;
  quality?: 'low' | 'medium' | 'high';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}

export const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(({
  asset,
  className,
  alt,
  width,
  height,
  priority = false,
  onLoad,
  onError,
  placeholder,
  quality = 'medium',
  objectFit = 'cover',
  ...props
}, ref) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Commencer à charger 50px avant d'être visible
        threshold: 0.1
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Sélection de l'URL d'image en fonction de la qualité
  const getImageUrl = () => {
    switch (quality) {
      case 'low':
        return asset.thumbnailUrl;
      case 'high':
        return asset.webpUrl || asset.url;
      case 'medium':
      default:
        return asset.url;
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const imageAlt = alt || asset.alt || 'Image';
  const imageUrl = getImageUrl();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        className
      )}
      style={{
        width: width || asset.width,
        height: height || asset.height,
        aspectRatio: `${asset.width}/${asset.height}`
      }}
      data-testid="lazy-image-container"
    >
      {/* Placeholder pendant le chargement */}
      {!isLoaded && !isError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse"
          data-testid="image-placeholder"
        >
          {placeholder || (
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          )}
        </div>
      )}

      {/* Message d'erreur */}
      {isError && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center"
          data-testid="image-error"
        >
          <svg
            className="w-8 h-8 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-xs">Failed to load image</span>
        </div>
      )}

      {/* Image principale */}
      {isInView && (
        <img
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            if (imgRef) {
              imgRef.current = node;
            }
          }}
          src={imageUrl}
          alt={imageAlt}
          width={width || asset.width}
          height={height || asset.height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            objectFit === 'cover' && "object-cover",
            objectFit === 'contain' && "object-contain",
            objectFit === 'fill' && "object-fill",
            objectFit === 'scale-down' && "object-scale-down",
            objectFit === 'none' && "object-none"
          )}
          style={{
            width: '100%',
            height: '100%'
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          data-testid="lazy-image"
          {...props}
        />
      )}

      {/* Attribution du photographe */}
      {asset.photographer && asset.source !== 'placeholder' && (
        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
          {asset.photographerUrl ? (
            <a 
              href={asset.photographerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              © {asset.photographer}
            </a>
          ) : (
            <span>© {asset.photographer}</span>
          )}
        </div>
      )}

      {/* Badge de source */}
      {asset.source !== 'placeholder' && (
        <div 
          className="absolute top-1 left-1 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity"
          data-testid="source-badge"
        >
          {asset.source}
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';