/**
 * Assets API Service - Free Images integration with Unsplash & Pexels
 * Task 4: Système d'assets placeholder - Phase TDD
 */

export interface ImageAsset {
  id: string;
  url: string;
  thumbnailUrl: string;
  webpUrl?: string;
  alt: string;
  width: number;
  height: number;
  photographer: string;
  photographerUrl?: string;
  source: 'unsplash' | 'pexels' | 'placeholder';
  tags: string[];
  color?: string;
  downloadUrl?: string;
}

export interface SearchOptions {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  size?: 'small' | 'medium' | 'large';
  color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue';
}

export interface AssetCollection {
  images: ImageAsset[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export class AssetsApiService {
  private readonly unsplashBaseUrl = 'https://api.unsplash.com';
  private readonly pexelsBaseUrl = 'https://api.pexels.com/v1';
  private readonly picSumBaseUrl = 'https://picsum.photos';
  
  // Note: Pour la production, ces clés doivent être dans les variables d'environnement
  private readonly unsplashAccessKey = 'demo'; // Clé demo pour tests
  private readonly pexelsApiKey = 'demo'; // Clé demo pour tests
  
  private cache = new Map<string, AssetCollection>();
  private readonly cacheTimeout = 30 * 60 * 1000; // 30 minutes

  /**
   * Recherche d'images via Unsplash
   */
  async searchUnsplash(options: SearchOptions): Promise<AssetCollection> {
    const cacheKey = `unsplash:${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const params = new URLSearchParams({
        query: options.query,
        page: (options.page || 1).toString(),
        per_page: (options.perPage || 20).toString(),
        orientation: options.orientation || 'landscape'
      });

      if (options.color) params.append('color', options.color);

      const response = await fetch(`${this.unsplashBaseUrl}/search/photos?${params}`, {
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const collection: AssetCollection = {
        images: data.results.map((item: any) => this.mapUnsplashImage(item)),
        total: data.total,
        page: data.page || 1,
        totalPages: data.total_pages || 1,
        hasMore: (data.page || 1) < (data.total_pages || 1)
      };

      this.cache.set(cacheKey, collection);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

      return collection;
    } catch (error) {
      console.warn('Unsplash search failed, falling back to placeholders:', error);
      return this.getPlaceholderImages(options);
    }
  }

  /**
   * Recherche d'images via Pexels
   */
  async searchPexels(options: SearchOptions): Promise<AssetCollection> {
    const cacheKey = `pexels:${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const params = new URLSearchParams({
        query: options.query,
        page: (options.page || 1).toString(),
        per_page: (options.perPage || 20).toString()
      });

      if (options.orientation) params.append('orientation', options.orientation);
      if (options.size) params.append('size', options.size);

      const response = await fetch(`${this.pexelsBaseUrl}/search?${params}`, {
        headers: {
          'Authorization': this.pexelsApiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const collection: AssetCollection = {
        images: data.photos.map((item: any) => this.mapPexelsImage(item)),
        total: data.total_results,
        page: data.page || 1,
        totalPages: Math.ceil(data.total_results / (options.perPage || 20)),
        hasMore: data.page < Math.ceil(data.total_results / (options.perPage || 20))
      };

      this.cache.set(cacheKey, collection);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

      return collection;
    } catch (error) {
      console.warn('Pexels search failed, falling back to placeholders:', error);
      return this.getPlaceholderImages(options);
    }
  }

  /**
   * Recherche combinée avec fallback automatique
   */
  async searchImages(options: SearchOptions, preferredSource: 'unsplash' | 'pexels' | 'auto' = 'auto'): Promise<AssetCollection> {
    if (preferredSource === 'unsplash') {
      return this.searchUnsplash(options);
    }
    
    if (preferredSource === 'pexels') {
      return this.searchPexels(options);
    }

    // Auto: essayer Unsplash en premier, puis Pexels, puis placeholder
    try {
      return await this.searchUnsplash(options);
    } catch (error) {
      try {
        return await this.searchPexels(options);
      } catch (error2) {
        return this.getPlaceholderImages(options);
      }
    }
  }

  /**
   * Génère des images placeholder avec Lorem Picsum
   */
  getPlaceholderImages(options: SearchOptions): AssetCollection {
    const count = options.perPage || 20;
    const images: ImageAsset[] = [];

    for (let i = 0; i < count; i++) {
      const id = 100 + i + ((options.page || 1) - 1) * count;
      const width = options.orientation === 'portrait' ? 400 : 600;
      const height = options.orientation === 'portrait' ? 600 : 400;
      
      images.push({
        id: `placeholder-${id}`,
        url: `${this.picSumBaseUrl}/${width}/${height}?random=${id}`,
        thumbnailUrl: `${this.picSumBaseUrl}/${width/2}/${height/2}?random=${id}`,
        webpUrl: `${this.picSumBaseUrl}/${width}/${height}.webp?random=${id}`,
        alt: `Placeholder image for ${options.query}`,
        width,
        height,
        photographer: 'Lorem Picsum',
        photographerUrl: 'https://picsum.photos',
        source: 'placeholder',
        tags: [options.query, 'placeholder'],
        color: '#cccccc'
      });
    }

    return {
      images,
      total: 1000, // Arbitraire pour les placeholders
      page: options.page || 1,
      totalPages: 50,
      hasMore: (options.page || 1) < 50
    };
  }

  /**
   * Récupère une image optimisée par taille
   */
  async getOptimizedImage(imageId: string, targetWidth: number, targetHeight: number): Promise<ImageAsset | null> {
    // Pour les placeholders, générer une URL optimisée
    if (imageId.startsWith('placeholder-')) {
      const id = imageId.replace('placeholder-', '');
      return {
        id: imageId,
        url: `${this.picSumBaseUrl}/${targetWidth}/${targetHeight}?random=${id}`,
        thumbnailUrl: `${this.picSumBaseUrl}/${Math.floor(targetWidth/2)}/${Math.floor(targetHeight/2)}?random=${id}`,
        webpUrl: `${this.picSumBaseUrl}/${targetWidth}/${targetHeight}.webp?random=${id}`,
        alt: 'Optimized placeholder image',
        width: targetWidth,
        height: targetHeight,
        photographer: 'Lorem Picsum',
        source: 'placeholder',
        tags: ['optimized', 'placeholder']
      };
    }

    // Pour Unsplash et Pexels, on pourrait implémenter des transformations d'URL
    // mais pour l'instant, on retourne null pour indiquer qu'il faut utiliser l'original
    return null;
  }

  /**
   * Précharge des images pour améliorer les performances
   */
  async preloadImages(images: ImageAsset[]): Promise<void> {
    const preloadPromises = images.map(image => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continuer même en cas d'erreur
        img.src = image.thumbnailUrl || image.url;
      });
    });

    await Promise.all(preloadPromises);
  }

  /**
   * Map une image Unsplash vers notre format standard
   */
  private mapUnsplashImage(item: any): ImageAsset {
    return {
      id: `unsplash-${item.id}`,
      url: item.urls.regular,
      thumbnailUrl: item.urls.thumb,
      webpUrl: item.urls.regular + '&fm=webp',
      alt: item.alt_description || item.description || 'Unsplash image',
      width: item.width,
      height: item.height,
      photographer: item.user.name,
      photographerUrl: item.user.links.html,
      source: 'unsplash',
      tags: item.tags?.map((tag: any) => tag.title) || [],
      color: item.color,
      downloadUrl: item.links.download
    };
  }

  /**
   * Map une image Pexels vers notre format standard
   */
  private mapPexelsImage(item: any): ImageAsset {
    return {
      id: `pexels-${item.id}`,
      url: item.src.large,
      thumbnailUrl: item.src.medium,
      webpUrl: item.src.large + '?fm=webp',
      alt: item.alt || 'Pexels image',
      width: item.width,
      height: item.height,
      photographer: item.photographer,
      photographerUrl: item.photographer_url,
      source: 'pexels',
      tags: [], // Pexels ne fournit pas de tags dans l'API de base
      color: item.avg_color
    };
  }

  /**
   * Génère des images thématiques pour le jeu de dialecte
   */
  async getGameThemeImages(theme: string, count = 10): Promise<ImageAsset[]> {
    const themeQueries = {
      'nature': 'nature landscape mountains forest',
      'city': 'city urban building architecture',
      'culture': 'culture art music traditional',
      'food': 'food cuisine cooking restaurant',
      'travel': 'travel adventure world landmarks',
      'education': 'education learning books study',
      'technology': 'technology computer digital modern',
      'sport': 'sport fitness activity exercise'
    };

    const query = themeQueries[theme as keyof typeof themeQueries] || theme;
    const result = await this.searchImages({ query, perPage: count });
    
    return result.images;
  }

  /**
   * Nettoie le cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Statistiques du cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Teste la connectivité aux APIs
   */
  async testConnectivity(): Promise<{
    unsplash: boolean;
    pexels: boolean;
    placeholder: boolean;
    overall: boolean;
  }> {
    const [unsplashTest, pexelsTest] = await Promise.allSettled([
      this.searchUnsplash({ query: 'test', perPage: 1 }),
      this.searchPexels({ query: 'test', perPage: 1 })
    ]);

    const unsplash = unsplashTest.status === 'fulfilled';
    const pexels = pexelsTest.status === 'fulfilled';
    const placeholder = true; // Les placeholders sont toujours disponibles

    return {
      unsplash,
      pexels,
      placeholder,
      overall: unsplash || pexels || placeholder
    };
  }
}

// Instance singleton
export const assetsApi = new AssetsApiService();