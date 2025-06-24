/**
 * Cache persistant avec IndexedDB pour robustesse offline
 * Task 10: APIs Robustesse - Phase 3
 */

// Types pour le cache persistant
export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  endpoint: string;
  size: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface CacheOptions {
  maxSize: number; // en bytes
  maxEntries: number;
  defaultTtl: number; // en ms
  cleanupInterval: number; // en ms
}

// Configuration par défaut
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  maxSize: 50 * 1024 * 1024, // 50MB
  maxEntries: 10000,
  defaultTtl: 24 * 60 * 60 * 1000, // 24 heures
  cleanupInterval: 60 * 60 * 1000, // 1 heure
};

export class PersistentCache {
  private db: IDBDatabase | null = null;
  private dbName = 'dialect-game-cache';
  private dbVersion = 1;
  private storeName = 'api-cache';
  private options: CacheOptions;
  private stats = {
    hits: 0,
    misses: 0,
    writes: 0,
    deletes: 0,
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.openDatabase();
      this.startCleanupTimer();
    } catch (error) {
      console.warn('PersistentCache: IndexedDB not available, falling back to memory cache');
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Supprimer l'ancien store s'il existe
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // Créer le nouveau store
        const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
        
        // Créer les index
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('endpoint', 'endpoint', { unique: false });
        store.createIndex('ttl', 'ttl', { unique: false });
      };
    });
  }

  async get(key: string): Promise<any | null> {
    if (!this.db) {
      this.stats.misses++;
      return null;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      const entry = await new Promise<CacheEntry | null>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Vérifier si l'entrée a expiré
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.delete(key);
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return entry.data;

    } catch (error) {
      console.error('PersistentCache.get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async set(
    key: string, 
    data: any, 
    ttl: number = this.options.defaultTtl,
    endpoint: string = 'unknown'
  ): Promise<boolean> {
    if (!this.db) {
      return false;
    }

    try {
      const serialized = JSON.stringify(data);
      const size = new Blob([serialized]).size;

      // Vérifier les limites de taille
      if (size > this.options.maxSize * 0.1) { // Max 10% de la taille totale par entrée
        console.warn(`PersistentCache: Entry too large (${size} bytes)`);
        return false;
      }

      const entry: CacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
        endpoint,
        size,
      };

      // Vérifier et nettoyer l'espace si nécessaire
      await this.ensureSpace(size);

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      this.stats.writes++;
      return true;

    } catch (error) {
      console.error('PersistentCache.set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.db) {
      return false;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      this.stats.deletes++;
      return true;

    } catch (error) {
      console.error('PersistentCache.delete error:', error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    if (!this.db) {
      return false;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return true;

    } catch (error) {
      console.error('PersistentCache.clear error:', error);
      return false;
    }
  }

  async getStats(): Promise<CacheStats> {
    if (!this.db) {
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        oldestEntry: 0,
        newestEntry: 0,
      };
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      const entries = await new Promise<CacheEntry[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      const totalEntries = entries.length;
      const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
      const timestamps = entries.map(entry => entry.timestamp);
      const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : 0;
      const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : 0;
      
      const totalRequests = this.stats.hits + this.stats.misses;
      const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

      return {
        totalEntries,
        totalSize,
        hitRate,
        oldestEntry,
        newestEntry,
      };

    } catch (error) {
      console.error('PersistentCache.getStats error:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        oldestEntry: 0,
        newestEntry: 0,
      };
    }
  }

  async getEntriesByEndpoint(endpoint: string): Promise<CacheEntry[]> {
    if (!this.db) {
      return [];
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('endpoint');
      const request = index.getAll(endpoint);

      return await new Promise<CacheEntry[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

    } catch (error) {
      console.error('PersistentCache.getEntriesByEndpoint error:', error);
      return [];
    }
  }

  private async ensureSpace(requiredSize: number): Promise<void> {
    const stats = await this.getStats();
    
    // Vérifier si on dépasse les limites
    if (stats.totalEntries >= this.options.maxEntries || 
        stats.totalSize + requiredSize > this.options.maxSize) {
      
      await this.cleanup(true); // Cleanup forcé
    }
  }

  private async cleanup(force: boolean = false): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor();

      const now = Date.now();
      let deletedCount = 0;

      await new Promise<void>((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          
          if (cursor) {
            const entry = cursor.value as CacheEntry;
            
            // Supprimer si expiré ou si cleanup forcé et c'est une vieille entrée
            if (now - entry.timestamp > entry.ttl || 
                (force && now - entry.timestamp > this.options.defaultTtl / 2)) {
              
              cursor.delete();
              deletedCount++;
            }
            
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });

      if (deletedCount > 0) {
        console.log(`PersistentCache: Cleaned up ${deletedCount} expired entries`);
      }

    } catch (error) {
      console.error('PersistentCache.cleanup error:', error);
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
  }

  // Méthodes de gestion avancée
  async backup(endpoint?: string): Promise<CacheEntry[]> {
    if (endpoint) {
      return await this.getEntriesByEndpoint(endpoint);
    }

    if (!this.db) return [];

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      return await new Promise<CacheEntry[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

    } catch (error) {
      console.error('PersistentCache.backup error:', error);
      return [];
    }
  }

  async restore(entries: CacheEntry[]): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      for (const entry of entries) {
        // Vérifier si l'entrée n'est pas expirée
        if (Date.now() - entry.timestamp <= entry.ttl) {
          store.put(entry);
        }
      }

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });

      return true;

    } catch (error) {
      console.error('PersistentCache.restore error:', error);
      return false;
    }
  }

  // Nettoyage des ressources
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Statistiques de performance
  getPerformanceStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? this.stats.hits / (this.stats.hits + this.stats.misses) 
        : 0,
    };
  }
}

// Instance globale
export const persistentCache = new PersistentCache();