/**
 * Tests unitaires pour le Dictionary API Service
 * Task 3: Intégration APIs gratuites - Phase TDD
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DictionaryApiService } from '../../../../src/services/api/dictionaryApi';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DictionaryApiService', () => {
  let service: DictionaryApiService;

  beforeEach(() => {
    service = new DictionaryApiService();
    mockFetch.mockClear();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('searchWord', () => {
    test('should fetch word definition successfully', async () => {
      const mockResponse = [
        {
          word: 'hello',
          phonetic: '/həˈloʊ/',
          phonetics: [
            {
              text: '/həˈloʊ/',
              audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3'
            }
          ],
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [
                {
                  definition: 'A greeting or expression of goodwill.',
                  example: 'She gave a cheerful hello.'
                }
              ]
            }
          ]
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await service.searchWord('hello');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.dictionaryapi.dev/api/v2/entries/en/hello',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle word not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(service.searchWord('nonexistentword')).rejects.toThrow(
        'No definitions found for "nonexistentword"'
      );
    });

    test('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(service.searchWord('hello')).rejects.toThrow(
        'Dictionary API error: 500 Internal Server Error'
      );
    });

    test('should validate empty word input', async () => {
      await expect(service.searchWord('')).rejects.toThrow('Word cannot be empty');
      await expect(service.searchWord('   ')).rejects.toThrow('Word cannot be empty');
    });

    test('should cache successful requests', async () => {
      const mockResponse = [{ word: 'test', phonetics: [], meanings: [] }];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Premier appel
      await service.searchWord('test');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Deuxième appel - devrait utiliser le cache
      const result = await service.searchWord('test');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Pas d'appel supplémentaire
      expect(result).toEqual(mockResponse);
    });

    test('should handle different languages', async () => {
      const mockResponse = [{ word: 'bonjour', phonetics: [], meanings: [] }];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await service.searchWord('bonjour', 'fr');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.dictionaryapi.dev/api/v2/entries/fr/bonjour',
        expect.any(Object)
      );
    });
  });

  describe('getWordAudio', () => {
    test('should return audio URL when available', async () => {
      const mockResponse = [
        {
          word: 'hello',
          phonetics: [
            { audio: 'https://example.com/hello.mp3' }
          ],
          meanings: []
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const audioUrl = await service.getWordAudio('hello');
      expect(audioUrl).toBe('https://example.com/hello.mp3');
    });

    test('should return null when no audio available', async () => {
      const mockResponse = [
        {
          word: 'hello',
          phonetics: [{ text: '/həˈloʊ/' }],
          meanings: []
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const audioUrl = await service.getWordAudio('hello');
      expect(audioUrl).toBeNull();
    });

    test('should handle errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const audioUrl = await service.getWordAudio('hello');
      expect(audioUrl).toBeNull();
    });
  });

  describe('getWordPhonetic', () => {
    test('should return phonetic notation', async () => {
      const mockResponse = [
        {
          word: 'hello',
          phonetic: '/həˈloʊ/',
          phonetics: [],
          meanings: []
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const phonetic = await service.getWordPhonetic('hello');
      expect(phonetic).toBe('/həˈloʊ/');
    });

    test('should return phonetic from phonetics array if main phonetic missing', async () => {
      const mockResponse = [
        {
          word: 'hello',
          phonetics: [{ text: '/həˈloʊ/' }],
          meanings: []
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const phonetic = await service.getWordPhonetic('hello');
      expect(phonetic).toBe('/həˈloʊ/');
    });
  });

  describe('getWordSynonyms', () => {
    test('should collect synonyms from all meanings', async () => {
      const mockResponse = [
        {
          word: 'happy',
          phonetics: [],
          meanings: [
            {
              partOfSpeech: 'adjective',
              definitions: [
                { definition: 'Feeling joy', synonyms: ['joyful', 'cheerful'] }
              ],
              synonyms: ['glad', 'pleased']
            }
          ]
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const synonyms = await service.getWordSynonyms('happy');
      expect(synonyms).toContain('joyful');
      expect(synonyms).toContain('cheerful');
      expect(synonyms).toContain('glad');
      expect(synonyms).toContain('pleased');
      expect(synonyms.length).toBe(4);
    });

    test('should return empty array when no synonyms available', async () => {
      const mockResponse = [
        {
          word: 'test',
          phonetics: [],
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [{ definition: 'A test' }]
            }
          ]
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const synonyms = await service.getWordSynonyms('test');
      expect(synonyms).toEqual([]);
    });
  });

  describe('wordExists', () => {
    test('should return true for existing word', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ word: 'hello', phonetics: [], meanings: [] }]
      });

      const exists = await service.wordExists('hello');
      expect(exists).toBe(true);
    });

    test('should return false for non-existing word', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const exists = await service.wordExists('nonexistent');
      expect(exists).toBe(false);
    });
  });

  describe('getSupportedLanguages', () => {
    test('should return list of supported languages', () => {
      const languages = service.getSupportedLanguages();
      
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
      expect(languages.length).toBeGreaterThan(5);
    });
  });

  describe('cache management', () => {
    test('should clear cache', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ word: 'test', phonetics: [], meanings: [] }]
      });

      await service.searchWord('test');
      expect(service.getCacheStats().size).toBe(1);

      service.clearCache();
      expect(service.getCacheStats().size).toBe(0);
    });

    test('should provide cache statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ word: 'test', phonetics: [], meanings: [] }]
      });

      await service.searchWord('test');
      const stats = service.getCacheStats();
      
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('en:test');
    });
  });

  describe('error handling', () => {
    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.searchWord('hello')).rejects.toThrow(
        'Network error'
      );
    });

    test('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(service.searchWord('hello')).rejects.toThrow(
        'Invalid JSON'
      );
    });

    test('should handle empty response array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await expect(service.searchWord('hello')).rejects.toThrow(
        'Invalid response format for "hello"'
      );
    });
  });
});