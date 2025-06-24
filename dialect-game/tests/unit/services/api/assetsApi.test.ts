/**
 * Tests unitaires pour le Assets API Service
 * Task 4: Système d'assets placeholder - Phase TDD
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssetsApiService } from '../../../../src/services/api/assetsApi';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AssetsApiService', () => {
  let service: AssetsApiService;

  beforeEach(() => {
    service = new AssetsApiService();
    mockFetch.mockClear();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('searchUnsplash', () => {
    test('should search images successfully', async () => {
      const mockResponse = {
        results: [
          {
            id: 'photo1',
            urls: {
              regular: 'https://example.com/photo1.jpg',
              thumb: 'https://example.com/photo1_thumb.jpg'
            },
            alt_description: 'Beautiful landscape',
            width: 800,
            height: 600,
            user: {
              name: 'John Photographer',
              links: { html: 'https://unsplash.com/@john' }
            },
            color: '#334455',
            links: { download: 'https://example.com/download1' },
            tags: [{ title: 'nature' }, { title: 'landscape' }]
          }
        ],
        total: 100,
        total_pages: 10,
        page: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.searchUnsplash({
        query: 'nature',
        page: 1,
        perPage: 20
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.unsplash.com/search/photos'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Client-ID demo'
          })
        })
      );

      expect(result).toEqual({
        images: [
          {
            id: 'unsplash-photo1',
            url: 'https://example.com/photo1.jpg',
            thumbnailUrl: 'https://example.com/photo1_thumb.jpg',
            webpUrl: 'https://example.com/photo1.jpg&fm=webp',
            alt: 'Beautiful landscape',
            width: 800,
            height: 600,
            photographer: 'John Photographer',
            photographerUrl: 'https://unsplash.com/@john',
            source: 'unsplash',
            tags: ['nature', 'landscape'],
            color: '#334455',
            downloadUrl: 'https://example.com/download1'
          }
        ],
        total: 100,
        page: 1,
        totalPages: 10,
        hasMore: true
      });
    });

    test('should handle API errors and fallback to placeholders', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await service.searchUnsplash({
        query: 'nature',
        perPage: 5
      });

      // Should return placeholder images
      expect(result.images).toHaveLength(5);
      expect(result.images[0].source).toBe('placeholder');
      expect(result.images[0].photographer).toBe('Lorem Picsum');
    });

    test('should cache successful requests', async () => {
      const mockResponse = {
        results: [{
          id: 'test',
          urls: { regular: 'test.jpg', thumb: 'thumb.jpg' },
          width: 100,
          height: 100,
          user: { name: 'Test', links: { html: '' } },
          alt_description: 'Test image',
          color: '#000000',
          links: { download: 'download.jpg' },
          tags: []
        }],
        total: 1,
        total_pages: 1,
        page: 1
      };

      // Vider le cache avant le test
      service.clearCache();

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      // Premier appel
      await service.searchUnsplash({ query: 'test-cache' });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Deuxième appel - devrait utiliser le cache
      const result = await service.searchUnsplash({ query: 'test-cache' });
      expect(mockFetch).toHaveBeenCalledTimes(1); // Pas d'appel supplémentaire
      expect(result.images).toHaveLength(1);
    });
  });

  describe('searchPexels', () => {
    test('should search images successfully', async () => {
      const mockResponse = {
        photos: [
          {
            id: 123,
            src: {
              large: 'https://example.com/large.jpg',
              medium: 'https://example.com/medium.jpg'
            },
            alt: 'Mountain view',
            width: 1200,
            height: 800,
            photographer: 'Jane Doe',
            photographer_url: 'https://pexels.com/@jane',
            avg_color: '#225566'
          }
        ],
        total_results: 50,
        page: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.searchPexels({
        query: 'mountain',
        page: 1,
        perPage: 10
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.pexels.com/v1/search'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'demo'
          })
        })
      );

      expect(result.images[0]).toEqual({
        id: 'pexels-123',
        url: 'https://example.com/large.jpg',
        thumbnailUrl: 'https://example.com/medium.jpg',
        webpUrl: 'https://example.com/large.jpg?fm=webp',
        alt: 'Mountain view',
        width: 1200,
        height: 800,
        photographer: 'Jane Doe',
        photographerUrl: 'https://pexels.com/@jane',
        source: 'pexels',
        tags: [],
        color: '#225566'
      });
    });

    test('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.searchPexels({ query: 'test' });

      // Should fallback to placeholders
      expect(result.images[0].source).toBe('placeholder');
    });
  });

  describe('searchImages (auto mode)', () => {
    test('should try Unsplash first, then Pexels, then placeholders', async () => {
      // Vider le cache avant le test
      service.clearCache();
      
      // Mock searchUnsplash pour qu'il jette une exception
      const originalSearchUnsplash = service.searchUnsplash;
      vi.spyOn(service, 'searchUnsplash').mockRejectedValue(new Error('Unsplash error'));
      
      // Mock searchPexels pour qu'il retourne un résultat valide
      vi.spyOn(service, 'searchPexels').mockResolvedValue({
        images: [{
          id: 'pexels-1',
          url: 'test.jpg',
          thumbnailUrl: 'thumb.jpg',
          alt: 'Test image',
          width: 100,
          height: 100,
          photographer: 'Test',
          photographerUrl: 'test.com',
          source: 'pexels',
          tags: [],
          color: '#000000'
        }],
        total: 1,
        page: 1,
        totalPages: 1,
        hasMore: false
      });

      const result = await service.searchImages({ query: 'test-auto' }, 'auto');

      expect(result.images[0].source).toBe('pexels');
      
      // Restaurer les mocks
      vi.restoreAllMocks();
    });

    test('should fallback to placeholders when all APIs fail', async () => {
      mockFetch.mockRejectedValue(new Error('All APIs failed'));

      const result = await service.searchImages({ query: 'test' }, 'auto');

      expect(result.images[0].source).toBe('placeholder');
    });
  });

  describe('getPlaceholderImages', () => {
    test('should generate placeholder images with correct properties', () => {
      const result = service.getPlaceholderImages({
        query: 'nature',
        perPage: 3,
        page: 1,
        orientation: 'portrait'
      });

      expect(result.images).toHaveLength(3);
      expect(result.images[0]).toMatchObject({
        id: 'placeholder-100',
        source: 'placeholder',
        photographer: 'Lorem Picsum',
        width: 400,
        height: 600, // Portrait orientation
        alt: 'Placeholder image for nature'
      });

      expect(result.images[0].url).toContain('https://picsum.photos/400/600');
    });

    test('should handle different orientations', () => {
      const landscape = service.getPlaceholderImages({
        query: 'test',
        orientation: 'landscape',
        perPage: 1
      });

      expect(landscape.images[0].width).toBe(600);
      expect(landscape.images[0].height).toBe(400);
    });

    test('should generate unique IDs for different pages', () => {
      const page1 = service.getPlaceholderImages({ query: 'test', page: 1, perPage: 2 });
      const page2 = service.getPlaceholderImages({ query: 'test', page: 2, perPage: 2 });

      expect(page1.images[0].id).toBe('placeholder-100');
      expect(page2.images[0].id).toBe('placeholder-102');
    });
  });

  describe('getOptimizedImage', () => {
    test('should return optimized placeholder image', async () => {
      const result = await service.getOptimizedImage('placeholder-123', 300, 200);

      expect(result).toMatchObject({
        id: 'placeholder-123',
        width: 300,
        height: 200,
        source: 'placeholder'
      });

      expect(result?.url).toBe('https://picsum.photos/300/200?random=123');
    });

    test('should return null for non-placeholder images', async () => {
      const result = await service.getOptimizedImage('unsplash-123', 300, 200);
      expect(result).toBeNull();
    });
  });

  describe('getGameThemeImages', () => {
    test('should search images for game themes', async () => {
      // Vider le cache avant le test
      service.clearCache();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{
            id: 'nature1',
            urls: { regular: 'test.jpg', thumb: 'thumb.jpg' },
            width: 100,
            height: 100,
            user: { name: 'Test', links: { html: '' } },
            alt_description: 'Nature image',
            color: '#000000',
            links: { download: 'download.jpg' },
            tags: []
          }],
          total: 1,
          total_pages: 1,
          page: 1
        })
      });

      const result = await service.getGameThemeImages('nature', 5);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('nature+landscape+mountains+forest'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Client-ID demo'
          })
        })
      );
      expect(result).toHaveLength(1);
    });

    test('should handle unknown themes', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API error'));

      const result = await service.getGameThemeImages('unknown-theme', 3);

      // Should fallback to placeholders
      expect(result).toHaveLength(3);
      expect(result[0].source).toBe('placeholder');
    });
  });

  describe('preloadImages', () => {
    test('should preload image URLs', async () => {
      // Mock Image constructor
      const mockImages: any[] = [];
      global.Image = vi.fn(() => {
        const mockImage = {
          onload: null as (() => void) | null,
          onerror: null as (() => void) | null,
          src: ''
        };
        mockImages.push(mockImage);
        return mockImage;
      }) as any;

      const images = [
        { id: '1', url: 'test1.jpg', thumbnailUrl: 'thumb1.jpg', alt: '', width: 100, height: 100, photographer: '', source: 'placeholder' as const, tags: [] },
        { id: '2', url: 'test2.jpg', thumbnailUrl: 'thumb2.jpg', alt: '', width: 100, height: 100, photographer: '', source: 'placeholder' as const, tags: [] }
      ];

      const preloadPromise = service.preloadImages(images);

      // Simuler le chargement réussi de toutes les images
      setTimeout(() => {
        mockImages.forEach(img => {
          if (img.onload) img.onload();
        });
      }, 10);

      await preloadPromise;

      expect(global.Image).toHaveBeenCalledTimes(2);
    }, 15000); // Augmenter le timeout
  });

  describe('testConnectivity', () => {
    test('should test API connectivity', async () => {
      // Vider le cache avant le test
      service.clearCache();
      
      // Unsplash succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [], total: 0, total_pages: 0, page: 1 })
      });

      // Pexels succeeds aussi (pour éviter la randomness)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ photos: [], total_results: 0, page: 1 })
      });

      const result = await service.testConnectivity();

      expect(result).toEqual({
        unsplash: true,
        pexels: true,
        placeholder: true,
        overall: true
      });
    });
  });

  describe('cache management', () => {
    test('should clear cache', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [], total: 0, total_pages: 0, page: 1 })
      });

      await service.searchUnsplash({ query: 'test' });
      expect(service.getCacheStats().size).toBe(1);

      service.clearCache();
      expect(service.getCacheStats().size).toBe(0);
    });

    test('should provide cache statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [], total: 0, total_pages: 0, page: 1 })
      });

      await service.searchUnsplash({ query: 'test' });
      const stats = service.getCacheStats();

      expect(stats.size).toBe(1);
      expect(stats.keys.length).toBe(1);
      expect(stats.keys[0]).toContain('unsplash');
    });
  });
});