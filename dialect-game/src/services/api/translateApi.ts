/**
 * LibreTranslate API Service - Free Translation API integration
 * Task 3: Intégration APIs gratuites - Phase TDD
 */

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
}

export interface LanguageInfo {
  code: string;
  name: string;
}

export interface DetectedLanguage {
  confidence: number;
  language: string;
}

export class TranslateApiService {
  private readonly baseUrl = 'https://libretranslate.com/api/v1';
  private cache = new Map<string, TranslationResult>();
  private readonly cacheTimeout = 10 * 60 * 1000; // 10 minutes
  private supportedLanguages: LanguageInfo[] = [];

  /**
   * Traduit un texte d'une langue vers une autre
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage = 'auto'
  ): Promise<TranslationResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    const normalizedText = text.trim();
    const cacheKey = `${sourceLanguage}:${targetLanguage}:${normalizedText}`;

    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          q: normalizedText,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Invalid translation request');
        }
        if (response.status === 403) {
          throw new Error('Translation service unavailable (rate limit exceeded)');
        }
        throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.translatedText) {
        throw new Error('Invalid response format from translation service');
      }

      const result: TranslationResult = {
        translatedText: data.translatedText,
        sourceLanguage: sourceLanguage === 'auto' ? (data.detectedLanguage || 'unknown') : sourceLanguage,
        targetLanguage,
        confidence: data.confidence
      };

      // Mettre en cache
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to translate text: ${error}`);
    }
  }

  /**
   * Détecte la langue d'un texte
   */
  async detectLanguage(text: string): Promise<DetectedLanguage[]> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    try {
      const response = await fetch(`${this.baseUrl}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          q: text.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Language detection error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from language detection service');
      }

      return data.map(item => ({
        confidence: item.confidence || 0,
        language: item.language || 'unknown'
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to detect language: ${error}`);
    }
  }

  /**
   * Récupère les langues supportées
   */
  async getSupportedLanguages(): Promise<LanguageInfo[]> {
    // Retourner le cache si disponible
    if (this.supportedLanguages.length > 0) {
      return this.supportedLanguages;
    }

    try {
      const response = await fetch(`${this.baseUrl}/languages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get supported languages: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from languages endpoint');
      }

      this.supportedLanguages = data.map(item => ({
        code: item.code || '',
        name: item.name || item.code || 'Unknown'
      }));

      return this.supportedLanguages;
    } catch (error) {
      // Fallback avec langues communes si l'API échoue
      this.supportedLanguages = this.getCommonLanguages();
      return this.supportedLanguages;
    }
  }

  /**
   * Vérifie si une langue est supportée
   */
  async isLanguageSupported(languageCode: string): Promise<boolean> {
    try {
      const languages = await this.getSupportedLanguages();
      return languages.some(lang => lang.code === languageCode);
    } catch (error) {
      // Vérifier avec les langues communes
      const commonLanguages = this.getCommonLanguages();
      return commonLanguages.some(lang => lang.code === languageCode);
    }
  }

  /**
   * Traduit plusieurs textes en lot
   */
  async translateBatch(
    texts: string[],
    targetLanguage: string,
    sourceLanguage = 'auto'
  ): Promise<TranslationResult[]> {
    if (!texts || texts.length === 0) {
      return [];
    }

    // Traiter en lot de 5 pour éviter la surcharge
    const batchSize = 5;
    const results: TranslationResult[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => 
        this.translateText(text, targetLanguage, sourceLanguage)
          .catch(error => ({
            translatedText: text, // Fallback au texte original
            sourceLanguage: sourceLanguage === 'auto' ? 'unknown' : sourceLanguage,
            targetLanguage,
            error: error.message
          } as TranslationResult))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Langues communes en fallback
   */
  private getCommonLanguages(): LanguageInfo[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl', name: 'Dutch' },
      { code: 'sv', name: 'Swedish' },
      { code: 'pl', name: 'Polish' },
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

  /**
   * Teste la connectivité à l'API
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.translateText('hello', 'es', 'en');
      return result.translatedText.length > 0;
    } catch (error) {
      return false;
    }
  }
}

// Instance singleton
export const translateApi = new TranslateApiService();