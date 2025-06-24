/**
 * ImageGallery component - Gallery component for game assets
 * Task 4: Système d'assets placeholder - Galerie moderne
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { LazyImage } from './lazy-image';
import { cn } from '@/lib/utils';
import type { ImageAsset, SearchOptions } from '../../services/api/assetsApi';

export interface ImageGalleryProps {
  images: ImageAsset[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onImageSelect?: (image: ImageAsset) => void;
  selectedImageId?: string;
  className?: string;
  columns?: 2 | 3 | 4 | 5;
  showAttribution?: boolean;
  showSource?: boolean;
  title?: string;
  emptyMessage?: string;
}

export const ImageGallery = React.forwardRef<HTMLDivElement, ImageGalleryProps>(({
  images,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onImageSelect,
  selectedImageId,
  className,
  columns = 3,
  showAttribution = true,
  showSource = true,
  title,
  emptyMessage = 'No images found',
  ...props
}, ref) => {
  const [loadedImages, setLoadedImages] = useState(new Set<string>());
  const [failedImages, setFailedImages] = useState(new Set<string>());

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  const handleImageError = (imageId: string) => {
    setFailedImages(prev => new Set([...prev, imageId]));
  };

  const handleImageClick = (image: ImageAsset) => {
    onImageSelect?.(image);
  };

  const getGridColumns = () => {
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  const visibleImages = images.filter(img => !failedImages.has(img.id));

  return (
    <Card className={cn("w-full", className)} ref={ref} {...props}>
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Badge variant="outline">{visibleImages.length} images</Badge>
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Gallery Grid */}
        {visibleImages.length > 0 ? (
          <div 
            className={cn("grid gap-4", getGridColumns())}
            data-testid="image-gallery-grid"
          >
            {visibleImages.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg",
                  selectedImageId === image.id && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => handleImageClick(image)}
                data-testid={`gallery-item-${image.id}`}
              >
                <LazyImage
                  asset={image}
                  className="w-full h-48 object-cover"
                  onLoad={() => handleImageLoad(image.id)}
                  onError={() => handleImageError(image.id)}
                  quality="medium"
                />
                
                {/* Overlay avec informations */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 text-black hover:bg-white"
                    >
                      Select
                    </Button>
                  </div>
                </div>

                {/* Source badge */}
                {showSource && (
                  <Badge 
                    variant="outline" 
                    className="absolute top-2 left-2 bg-white/90"
                    data-testid={`source-badge-${image.id}`}
                  >
                    {image.source}
                  </Badge>
                )}

                {/* Attribution */}
                {showAttribution && image.photographer && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                      © {image.photographer}
                    </div>
                  </div>
                )}

                {/* Selection indicator */}
                {selectedImageId === image.id && (
                  <div 
                    className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                    data-testid="selection-indicator"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div 
              className="text-center py-12"
              data-testid="empty-state"
            >
              <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          )
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div 
            className={cn("grid gap-4", getGridColumns())}
            data-testid="loading-skeleton"
          >
            {Array.from({ length: columns * 2 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-muted animate-pulse rounded-lg"
                data-testid={`skeleton-${i}`}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="text-center pt-4">
            <Button
              onClick={onLoadMore}
              variant="outline"
              disabled={isLoading}
              data-testid="load-more-button"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Images'
              )}
            </Button>
          </div>
        )}

        {/* Statistics */}
        <div className="flex justify-between items-center text-sm text-muted-foreground pt-4 border-t">
          <span>
            {loadedImages.size} loaded, {failedImages.size} failed
          </span>
          <span>
            {visibleImages.length} total images
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

ImageGallery.displayName = 'ImageGallery';