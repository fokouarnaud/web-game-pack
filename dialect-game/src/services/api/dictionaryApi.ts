/**
 * Dictionary API Service - Free Dictionary API integration
 * Task 3: Intégration APIs gratuites - Phase TDD
 */

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license?: License;
  sourceUrls?: string[];
}

export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface Definition {
  definition: string;
  synonyms?: string[];
  antonyms?: string[];
  example?: string;
}

export interface License {
  name: string;
  url: string;
}

export interface DictionaryApiError {
  title: string;
  message: string;
  resolution: string;
}

export class DictionaryApiService {
  private readonly baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries';
  private cache = new Map<string, DictionaryEntry[]>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Recherche la définition d'un mot
   */
  async searchWord(word: string, language = 'en'): Promise<DictionaryEntry[]> {
    if (!word || word.trim().length === 0) {
      throw new Error('Word cannot be empty');
    }

    const normalizedWord = word.toLowerCase().trim();
    const cacheKey = `${language}:${normalizedWord}`;

    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return cached;
    }

    try {
      const url = `${this.baseUrl}/${language}/${encodeURIComponent(normalizedWord)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No definitions found for "${word}"`);
        }
        throw new Error(`Dictionary API error: ${response.status} ${response.statusText}`);
      }

      const data: DictionaryEntry[] = await response.json();
      
      // Valider les données
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`Invalid response format for "${word}"`);
      }

      // Mettre en cache
      this.cache.set(cacheKey, data);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch definition for "${word}"`);
    }
  }

  /**
   * Récupère l'audio de prononciation d'un mot
   */
  async getWordAudio(word: string, language = 'en'): Promise<string | null> {
    try {
      const entries = await this.searchWord(word, language);
      
      for (const entry of entries) {
        for (const phonetic of entry.phonetics) {
          if (phonetic.audio && phonetic.audio.trim().length > 0) {
            return phonetic.audio;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to get audio for "${word}":`, error);
      return null;
    }
  }

  /**
   * Récupère la phonétique d'un mot
   */
  async getWordPhonetic(word: string, language = 'en'): Promise<string | null> {
    try {
      const entries = await this.searchWord(word, language);
      
      for (const entry of entries) {
        if (entry.phonetic) {
          return entry.phonetic;
        }
        for (const phonetic of entry.phonetics) {
          if (phonetic.text) {
            return phonetic.text;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to get phonetic for "${word}":`, error);
      return null;
    }
  }

  /**
   * Récupère les synonymes d'un mot
   */
  async getWordSynonyms(word: string, language = 'en'): Promise<string[]> {
    try {
      const entries = await this.searchWord(word, language);
      const synonyms = new Set<string>();

      for (const entry of entries) {
        for (const meaning of entry.meanings) {
          if (meaning.synonyms) {
            meaning.synonyms.forEach(synonym => synonyms.add(synonym));
          }
          for (const definition of meaning.definitions) {
            if (definition.synonyms) {
              definition.synonyms.forEach(synonym => synonyms.add(synonym));
            }
          }
        }
      }

      return Array.from(synonyms);
    } catch (error) {
      console.warn(`Failed to get synonyms for "${word}":`, error);
      return [];
    }
  }

  /**
   * Vérifie si un mot existe dans le dictionnaire
   */
  async wordExists(word: string, language = 'en'): Promise<boolean> {
    try {
      await this.searchWord(word, language);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère les langues supportées
   */
  getSupportedLanguages(): string[] {
    return [
      'en', // English
      'es', // Spanish 
      'fr', // French
      'de', // German
      'it', // Italian
      'pt', // Portuguese
      'ru', // Russian
      'ja', // Japanese
      'ko', // Korean
      'zh', // Chinese
      'ar', // Arabic
      'hi', // Hindi
    ];
  }

  /**
   * Nettoie le cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Récupère les statistiques du cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instance singleton
export const dictionaryApi = new DictionaryApiService();