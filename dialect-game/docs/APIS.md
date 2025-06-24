# 🌐 Guide de Configuration des APIs

Guide complet pour configurer, modifier et remplacer les APIs utilisées dans le Dialect Learning Game.

## 📋 Table des Matières
- [Vue d'ensemble](#vue-densemble)
- [APIs Actuelles](#apis-actuelles)
- [Dictionary API](#dictionary-api)
- [Translation API](#translation-api)
- [Assets API](#assets-api)
- [Configuration](#configuration)
- [Alternatives](#alternatives)
- [Cache et Performance](#cache-et-performance)
- [Gestion d'Erreurs](#gestion-derreurs)
- [Tests et Monitoring](#tests-et-monitoring)

## 🎯 Vue d'ensemble

Le Dialect Game utilise exclusivement des **APIs gratuites** pour toutes ses fonctionnalités :

### Architecture API
```
src/services/api/
├── dictionaryApi.ts     # Free Dictionary API
├── translateApi.ts      # LibreTranslate API
├── assetsApi.ts        # Unsplash + Pexels + Lorem Picsum
└── gameApiService.ts   # Service composite
```

### Principes de Design
- ✅ **100% Gratuit** - Aucun coût d'utilisation
- ✅ **Fallbacks Robustes** - Fonctionne même si APIs indisponibles
- ✅ **Cache Intelligent** - Performance optimisée
- ✅ **Rate Limiting** - Respect des limitations
- ✅ **Type Safety** - TypeScript strict

## 📚 Dictionary API

### Configuration Actuelle
```typescript
// src/services/api/dictionaryApi.ts
const DICTIONARY_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/';

export class DictionaryApiService {
  async searchWord(word: string, language = 'en'): Promise<DictionaryResult> {
    const url = `${DICTIONARY_BASE_URL}${language}/${encodeURIComponent(word)}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return this.transformResponse(data);
    } catch (error) {
      return this.handleError(error, word);
    }
  }
}
```

### Fonctionnalités
- **Définitions** multiples par mot
- **Phonétique** avec transcription IPA
- **Audio** pronunciation (quand disponible)
- **Exemples** d'utilisation
- **Synonymes** et antonymes
- **Parties du discours** (nom, verbe, adjectif...)

### Langues Supportées
```typescript
export const DICTIONARY_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'hi', 'ar', 'tr'
];
```

### Exemple de Réponse
```typescript
interface DictionaryResult {
  word: string;
  phonetic?: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
  sourceUrls: string[];
}
```

### Fallbacks
```typescript
private getFallbackDefinition(word: string): DictionaryResult {
  return {
    word,
    meanings: [{
      partOfSpeech: 'unknown',
      definitions: [{
        definition: `Definition not available for "${word}". Try a different word.`,
        example: undefined,
        synonyms: [],
        antonyms: []
      }]
    }],
    phonetics: [],
    sourceUrls: []
  };
}
```

## 🔄 Translation API

### Configuration LibreTranslate
```typescript
// src/services/api/translateApi.ts
const TRANSLATE_BASE_URL = 'https://libretranslate.de/translate';

export class TranslateApiService {
  async translateText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage = 'auto'
  ): Promise<TranslationResult> {
    
    const payload = {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    };

    try {
      const response = await fetch(TRANSLATE_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
      
      const data = await response.json();
      return {
        originalText: text,
        translatedText: data.translatedText,
        sourceLanguage: data.detectedLanguage || sourceLanguage,
        targetLanguage,
        confidence: 1.0 // LibreTranslate ne fournit pas de score
      };
    } catch (error) {
      return this.handleTranslationError(error, text, targetLanguage);
    }
  }
}
```

### Langues Supportées
```typescript
export const TRANSLATION_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' }
];
```

### Détection de Langue
```typescript
async detectLanguage(text: string): Promise<LanguageDetectionResult> {
  try {
    const response = await fetch(`${TRANSLATE_BASE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text })
    });

    const data = await response.json();
    return {
      language: data.language,
      confidence: data.confidence || 0.9
    };
  } catch (error) {
    return { language: 'en', confidence: 0.1 }; // Fallback
  }
}
```

### Batch Translation
```typescript
async translateBatch(
  texts: string[], 
  targetLanguage: string
): Promise<TranslationResult[]> {
  // Traiter par petits lots pour éviter les timeouts
  const batchSize = 5;
  const results: TranslationResult[] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text => 
      this.translateText(text, targetLanguage)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<TranslationResult>).value)
    );
  }
  
  return results;
}
```

## 🖼️ Assets API

### Multi-Source Strategy
```typescript
// src/services/api/assetsApi.ts
export class AssetsApiService {
  private sources = ['unsplash', 'pexels', 'placeholder'] as const;

  async searchImages(
    query: string, 
    options: SearchOptions = {}
  ): Promise<ImageSearchResult> {
    
    for (const source of this.sources) {
      try {
        const result = await this.searchBySource(source, query, options);
        if (result.images.length > 0) {
          return result;
        }
      } catch (error) {
        console.warn(`${source} failed:`, error);
        continue; // Essayer la source suivante
      }
    }
    
    // Fallback ultime : images placeholder
    return this.getPlaceholderImages(query, options);
  }
}
```

### Unsplash Configuration
```typescript
private async searchUnsplash(options: SearchOptions): Promise<ImageResult[]> {
  const params = new URLSearchParams({
    query: options.query,
    page: options.page?.toString() || '1',
    per_page: options.count?.toString() || '10',
    orientation: options.orientation || 'landscape'
  });

  const response = await fetch(
    `https://api.unsplash.com/search/photos?${params}`,
    {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept': 'application/json'
      }
    }
  );

  const data = await response.json();
  return data.results.map(this.transformUnsplashImage);
}
```

### Pexels Fallback
```typescript
private async searchPexels(options: SearchOptions): Promise<ImageResult[]> {
  const params = new URLSearchParams({
    query: options.query,
    page: options.page?.toString() || '1',
    per_page: options.count?.toString() || '10'
  });

  const response = await fetch(
    `https://api.pexels.com/v1/search?${params}`,
    {
      headers: {
        'Authorization': PEXELS_API_KEY,
        'Accept': 'application/json'
      }
    }
  );

  const data = await response.json();
  return data.photos.map(this.transformPexelsImage);
}
```

### Lorem Picsum Placeholder
```typescript
private getPlaceholderImages(
  query: string, 
  options: SearchOptions
): ImageSearchResult {
  const count = options.count || 10;
  const images: ImageResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = Math.floor(Math.random() * 1000) + i;
    images.push({
      id: `placeholder-${id}`,
      url: `https://picsum.photos/800/600?random=${id}`,
      thumbnail: `https://picsum.photos/200/150?random=${id}`,
      alt: `Placeholder image for ${query}`,
      source: 'placeholder',
      author: 'Lorem Picsum',
      downloadUrl: `https://picsum.photos/800/600?random=${id}`
    });
  }
  
  return { images, totalResults: count, query };
}
```

## ⚙️ Configuration

### Variables d'Environnement
```env
# .env.local
# APIs Keys (optionnelles, fallbacks inclus)
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key_here
VITE_PEXELS_API_KEY=your_pexels_key_here

# Configuration APIs
VITE_DICTIONARY_BASE_URL=https://api.dictionaryapi.dev/api/v2/entries/
VITE_TRANSLATE_BASE_URL=https://libretranslate.de

# Cache Configuration
VITE_CACHE_DURATION=3600000  # 1 heure en ms
VITE_MAX_CACHE_SIZE=100      # Nombre max d'entrées

# Rate Limiting
VITE_API_RATE_LIMIT=60       # Requêtes par minute
VITE_BATCH_SIZE=5            # Taille des lots
```

### Configuration Centralisée
```typescript
// src/config/apis.ts
export const apiConfig = {
  dictionary: {
    baseUrl: import.meta.env.VITE_DICTIONARY_BASE_URL || 'https://api.dictionaryapi.dev/api/v2/entries/',
    timeout: 10000,
    retries: 3,
    cache: {
      enabled: true,
      duration: 3600000, // 1 heure
      maxSize: 100
    }
  },
  
  translation: {
    baseUrl: import.meta.env.VITE_TRANSLATE_BASE_URL || 'https://libretranslate.de',
    timeout: 15000,
    retries: 2,
    batchSize: 5,
    cache: {
      enabled: true,
      duration: 7200000, // 2 heures
      maxSize: 200
    }
  },
  
  assets: {
    unsplash: {
      baseUrl: 'https://api.unsplash.com',
      accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo',
      rateLimit: 50, // par heure
    },
    pexels: {
      baseUrl: 'https://api.pexels.com/v1',
      apiKey: import.meta.env.VITE_PEXELS_API_KEY || 'demo',
      rateLimit: 200, // par heure
    },
    placeholder: {
      baseUrl: 'https://picsum.photos',
      fallbackAlways: true
    }
  }
};
```

## 🔄 Alternatives

### Dictionary API Alternatives

#### 1. Merriam-Webster API
```typescript
// Alternative avec clé API gratuite
class MerriamWebsterService implements IDictionaryService {
  private apiKey = 'your-free-api-key';
  private baseUrl = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';

  async searchWord(word: string): Promise<DictionaryResult> {
    const url = `${this.baseUrl}${word}?key=${this.apiKey}`;
    // Implementation...
  }
}
```

#### 2. WordsAPI (RapidAPI)
```typescript
class WordsApiService implements IDictionaryService {
  private headers = {
    'X-RapidAPI-Key': 'your-rapidapi-key',
    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
  };

  async searchWord(word: string): Promise<DictionaryResult> {
    const url = `https://wordsapiv1.p.rapidapi.com/words/${word}`;
    // Implementation...
  }
}
```

#### 3. Local Dictionary Fallback
```typescript
class LocalDictionaryService implements IDictionaryService {
  private dictionary = new Map<string, DictionaryResult>();

  constructor() {
    this.loadLocalDictionary();
  }

  private async loadLocalDictionary() {
    try {
      const response = await fetch('/assets/dictionaries/en-basic.json');
      const data = await response.json();
      this.dictionary = new Map(Object.entries(data));
    } catch (error) {
      console.warn('Local dictionary not available');
    }
  }
}
```

### Translation API Alternatives

#### 1. Google Translate (Free Tier)
```typescript
class GoogleTranslateService implements ITranslationService {
  private apiKey = 'your-google-api-key';
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  async translateText(text: string, target: string): Promise<TranslationResult> {
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target,
        format: 'text'
      })
    });
    // Implementation...
  }
}
```

#### 2. Microsoft Translator
```typescript
class MicrosoftTranslatorService implements ITranslationService {
  private subscriptionKey = 'your-azure-key';
  private endpoint = 'https://api.cognitive.microsofttranslator.com';

  async translateText(text: string, target: string): Promise<TranslationResult> {
    const response = await fetch(`${this.endpoint}/translate?api-version=3.0&to=${target}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ text }])
    });
    // Implementation...
  }
}
```

#### 3. Offline Translation
```typescript
class OfflineTranslationService implements ITranslationService {
  private translations = new Map<string, Map<string, string>>();

  constructor() {
    this.loadOfflineTranslations();
  }

  async translateText(text: string, target: string): Promise<TranslationResult> {
    const targetDict = this.translations.get(target);
    const translatedText = targetDict?.get(text.toLowerCase()) || text;
    
    return {
      originalText: text,
      translatedText,
      sourceLanguage: 'en',
      targetLanguage: target,
      confidence: targetDict?.has(text.toLowerCase()) ? 1.0 : 0.1
    };
  }
}
```

## 💾 Cache et Performance

### Cache Strategy
```typescript
// src/utils/cache.ts
export class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize = 100, defaultTtl = 3600000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  set(key: string, value: any, ttl?: number): void {
    // Nettoyer le cache si trop plein
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Vérifier expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  private cleanup(): void {
    const now = Date.now();
    const expired = Array.from(this.cache.entries())
      .filter(([_, entry]) => now - entry.timestamp > entry.ttl)
      .map(([key]) => key);
    
    expired.forEach(key => this.cache.delete(key));
    
    // Si toujours plein, supprimer les plus anciens
    if (this.cache.size >= this.maxSize) {
      const oldest = Array.from(this.cache.entries())
        .sort(([_, a], [__, b]) => a.timestamp - b.timestamp)
        .slice(0, Math.floor(this.maxSize * 0.3))
        .map(([key]) => key);
      
      oldest.forEach(key => this.cache.delete(key));
    }
  }
}
```

### Rate Limiting
```typescript
// src/utils/rateLimiter.ts
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private limits: Record<string, { requests: number; window: number }>;

  constructor(limits: Record<string, { requests: number; window: number }>) {
    this.limits = limits;
  }

  async checkLimit(endpoint: string): Promise<boolean> {
    const limit = this.limits[endpoint];
    if (!limit) return true;

    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    
    // Nettoyer les anciennes requêtes
    const validRequests = requests.filter(time => now - time < limit.window);
    
    if (validRequests.length >= limit.requests) {
      const oldestRequest = Math.min(...validRequests);
      const waitTime = limit.window - (now - oldestRequest);
      
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`);
    }
    
    validRequests.push(now);
    this.requests.set(endpoint, validRequests);
    
    return true;
  }
}
```

## 🚨 Gestion d'Erreurs

### Error Handling Strategy
```typescript
// src/utils/errorHandler.ts
export class ApiErrorHandler {
  static handle(error: unknown, context: string): never {
    if (error instanceof Error) {
      switch (error.name) {
        case 'NetworkError':
          throw new ApiError('Network connection failed', 'NETWORK_ERROR', context);
        case 'TimeoutError':
          throw new ApiError('Request timeout', 'TIMEOUT_ERROR', context);
        case 'RateLimitError':
          throw new ApiError('Rate limit exceeded', 'RATE_LIMIT_ERROR', context);
        default:
          throw new ApiError(error.message, 'UNKNOWN_ERROR', context);
      }
    }
    
    throw new ApiError('Unknown error occurred', 'UNKNOWN_ERROR', context);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public context: string,
    public retryable = true
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Retry Logic
```typescript
// src/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    retryIf = () => true
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts || !retryIf(error)) {
        throw error;
      }
      
      const waitTime = backoff === 'exponential' 
        ? delay * Math.pow(2, attempt - 1)
        : delay;
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}
```

## 📊 Tests et Monitoring

### API Testing
```typescript
// tests/api/dictionaryApi.test.ts
describe('DictionaryApiService', () => {
  let service: DictionaryApiService;
  
  beforeEach(() => {
    service = new DictionaryApiService();
  });

  test('should return word definition', async () => {
    const result = await service.searchWord('hello');
    
    expect(result.word).toBe('hello');
    expect(result.meanings).toHaveLength.greaterThan(0);
    expect(result.meanings[0].definitions).toHaveLength.greaterThan(0);
  });

  test('should handle unknown words gracefully', async () => {
    const result = await service.searchWord('xyznonexistentword');
    
    expect(result.word).toBe('xyznonexistentword');
    expect(result.meanings[0].definitions[0].definition).toContain('not available');
  });

  test('should respect rate limits', async () => {
    const promises = Array(100).fill(null).map(() => 
      service.searchWord('test')
    );
    
    // Certaines requêtes pourraient échouer avec rate limit
    const results = await Promise.allSettled(promises);
    const failed = results.filter(r => r.status === 'rejected').length;
    
    expect(failed).toBeLessThan(promises.length);
  });
});
```

### Health Monitoring
```typescript
// src/services/healthCheck.ts
export class ApiHealthCheck {
  async checkAllServices(): Promise<HealthReport> {
    const checks = await Promise.allSettled([
      this.checkDictionary(),
      this.checkTranslation(),
      this.checkAssets()
    ]);

    return {
      timestamp: new Date().toISOString(),
      services: {
        dictionary: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'down', error: checks[0].reason },
        translation: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'down', error: checks[1].reason },
        assets: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'down', error: checks[2].reason }
      }
    };
  }

  private async checkDictionary(): Promise<ServiceStatus> {
    try {
      const start = Date.now();
      await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/test');
      const responseTime = Date.now() - start;
      
      return {
        status: 'up',
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }
}
```

## 📚 Documentation API

### Interface Contracts
```typescript
// src/types/api.ts
export interface IDictionaryService {
  searchWord(word: string, language?: string): Promise<DictionaryResult>;
  getSuggestions(partial: string): Promise<string[]>;
  getLanguages(): Promise<Language[]>;
}

export interface ITranslationService {
  translateText(text: string, target: string, source?: string): Promise<TranslationResult>;
  translateBatch(texts: string[], target: string): Promise<TranslationResult[]>;
  detectLanguage(text: string): Promise<LanguageDetectionResult>;
  getSupportedLanguages(): Promise<Language[]>;
}

export interface IAssetsService {
  searchImages(query: string, options?: SearchOptions): Promise<ImageSearchResult>;
  getImage(id: string): Promise<ImageResult>;
  preloadImages(urls: string[]): Promise<void>;
  testConnectivity(): Promise<ConnectivityResult>;
}
```

---

**🌐 Configurez et personnalisez toutes les APIs selon vos besoins spécifiques !**

Les APIs gratuites offrent une base solide, et les alternatives permettent de s'adapter à tous les cas d'usage.