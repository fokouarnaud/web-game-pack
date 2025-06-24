/**
 * Tests unitaires pour le Translate API Service
 * Task 3: Intégration APIs gratuites - Phase TDD
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranslateApiService } from '../../../../src/services/api/translateApi';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TranslateApiService', () => {
  let service: TranslateApiService;

  beforeEach(() => {
    service = new TranslateApiService();
    mockFetch.mockClear();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('translateText', () => {
    test('should translate text successfully', async () => {
      const mockResponse = {
        translatedText: 'Hola',
        detectedLanguage: 'en'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await service.translateText('Hello', 'es', 'en');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://libretranslate.com/api/v1/translate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            q: 'Hello',
            source: 'en',
            target: 'es',
            format: 'text'
          })
        })
      );

      expect(result).toEqual({
        translatedText: 'Hola',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        confidence: undefined
      });
    });

    test('should handle auto-detection of source language', async () => {
      const mockResponse = {
        translatedText: 'Hola',
        detectedLanguage: 'en'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.translateText('Hello', 'es');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"source":"auto"')
        })
      );

      expect(result.sourceLanguage).toBe('en');
    });

    test('should validate empty text input', async () => {
      await expect(service.translateText('', 'es')).rejects.toThrow('Text cannot be empty');
      await expect(service.translateText('   ', 'es')).rejects.toThrow('Text cannot be empty');
    });

    test('should validate target language', async () => {
      await expect(service.translateText('Hello', '')).rejects.toThrow('Target language is required');
    });

    test('should handle 400 Bad Request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid language pair' })
      });

      await expect(service.translateText('Hello', 'invalid')).rejects.toThrow('Invalid language pair');
    });

    test('should handle 403 Rate Limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await expect(service.translateText('Hello', 'es')).rejects.toThrow(
        'Translation service unavailable (rate limit exceeded)'
      );
    });

    test('should cache successful translations', async () => {
      const mockResponse = { translatedText: 'Hola' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Premier appel
      await service.translateText('Hello', 'es', 'en');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Deuxième appel - devrait utiliser le cache
      const result = await service.translateText('Hello', 'es', 'en');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Pas d'appel supplémentaire
      expect(result.translatedText).toBe('Hola');
    });
  });

  describe('detectLanguage', () => {
    test('should detect language successfully', async () => {
      const mockResponse = [
        { confidence: 0.95, language: 'en' },
        { confidence: 0.05, language: 'es' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.detectLanguage('Hello world');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://libretranslate.com/api/v1/detect',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ q: 'Hello world' })
        })
      );

      expect(result).toEqual([
        { confidence: 0.95, language: 'en' },
        { confidence: 0.05, language: 'es' }
      ]);
    });

    test('should validate empty text for detection', async () => {
      await expect(service.detectLanguage('')).rejects.toThrow('Text cannot be empty');
    });

    test('should handle detection errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(service.detectLanguage('Hello')).rejects.toThrow(
        'Language detection error: 500 Internal Server Error'
      );
    });
  });

  describe('getSupportedLanguages', () => {
    test('should fetch supported languages from API', async () => {
      const mockResponse = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getSupportedLanguages();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://libretranslate.com/api/v1/languages',
        expect.objectContaining({ method: 'GET' })
      );

      expect(result).toEqual(mockResponse);
    });

    test('should use cached languages on subsequent calls', async () => {
      const mockResponse = [{ code: 'en', name: 'English' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Premier appel
      await service.getSupportedLanguages();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Deuxième appel - devrait utiliser le cache
      const result = await service.getSupportedLanguages();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    test('should fallback to common languages on API failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getSupportedLanguages();

      expect(result).toEqual(expect.arrayContaining([
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' }
      ]));
    });
  });

  describe('isLanguageSupported', () => {
    test('should check if language is supported', async () => {
      const mockResponse = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const isSupported = await service.isLanguageSupported('en');
      expect(isSupported).toBe(true);

      const isNotSupported = await service.isLanguageSupported('xyz');
      expect(isNotSupported).toBe(false);
    });
  });

  describe('translateBatch', () => {
    test('should translate multiple texts', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ translatedText: 'Hola' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ translatedText: 'Adiós' })
        });

      const result = await service.translateBatch(['Hello', 'Goodbye'], 'es', 'en');

      expect(result).toHaveLength(2);
      expect(result[0].translatedText).toBe('Hola');
      expect(result[1].translatedText).toBe('Adiós');
    });

    test('should handle batch errors gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ translatedText: 'Hola' })
        })
        .mockRejectedValueOnce(new Error('Translation failed'));

      const result = await service.translateBatch(['Hello', 'Goodbye'], 'es', 'en');

      expect(result).toHaveLength(2);
      expect(result[0].translatedText).toBe('Hola');
      expect(result[1].translatedText).toBe('Goodbye'); // Fallback au texte original
    });

    test('should return empty array for empty input', async () => {
      const result = await service.translateBatch([], 'es', 'en');
      expect(result).toEqual([]);
    });
  });

  describe('testConnection', () => {
    test('should return true for successful connection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'hola' })
      });

      const isConnected = await service.testConnection();
      expect(isConnected).toBe(true);
    });

    test('should return false for failed connection', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const isConnected = await service.testConnection();
      expect(isConnected).toBe(false);
    });
  });

  describe('cache management', () => {
    test('should clear cache', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'Hola' })
      });

      await service.translateText('Hello', 'es', 'en');
      expect(service.getCacheStats().size).toBe(1);

      service.clearCache();
      expect(service.getCacheStats().size).toBe(0);
    });

    test('should provide cache statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'Hola' })
      });

      await service.translateText('Hello', 'es', 'en');
      const stats = service.getCacheStats();

      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('en:es:Hello');
    });
  });

  describe('error handling', () => {
    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.translateText('Hello', 'es')).rejects.toThrow(
        'Network error'
      );
    });

    test('should handle invalid response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      });

      await expect(service.translateText('Hello', 'es')).rejects.toThrow(
        'Invalid response format from translation service'
      );
    });

    test('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(service.translateText('Hello', 'es')).rejects.toThrow(
        'Invalid JSON'
      );
    });
  });
});