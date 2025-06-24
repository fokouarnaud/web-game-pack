/**
 * TDD CYCLE 7 - GREEN PHASE
 * Système de cache avancé multi-niveau avec compression et invalidation intelligente
 */

// Types pour le système de cache
interface CacheEntry<T = any> {
  value: T
  timestamp: number
  ttl: number
  hits: number
  size: number
  compressed: boolean
}

interface CacheOptions {
  level: 'memory' | 'session' | 'local' | 'indexeddb'
  ttl: number
  compress?: boolean
  serialize?: boolean
}

interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  compressionRatio: number
  evictions: number
}

/**
 * Gestionnaire de cache avancé multi-niveau
 */
export class CacheManager {
  private memoryCache = new Map<string, CacheEntry>()
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    compressionRatio: 0,
    evictions: 0
  }
  private hits = 0
  private misses = 0
  private maxMemorySize = 50 * 1024 * 1024 // 50MB
  private compressionThreshold = 1024 // 1KB

  /**
   * Stocke une valeur dans le cache
   */
  async set<T>(key: string, value: T, options: CacheOptions): Promise<void> {
    const timestamp = Date.now()
    const serialized = options.serialize !== false ? JSON.stringify(value) : value as string
    const originalSize = new Blob([serialized]).size
    
    let finalValue = serialized
    let compressed = false
    
    // Compression si nécessaire
    if (options.compress && originalSize > this.compressionThreshold) {
      finalValue = await this.compress(serialized)
      compressed = true
    }
    
    const entry: CacheEntry<T> = {
      value: compressed ? finalValue as unknown as T : value,
      timestamp,
      ttl: options.ttl,
      hits: 0,
      size: new Blob([finalValue]).size,
      compressed
    }
    
    // Stocker selon le niveau
    switch (options.level) {
      case 'memory':
        await this.setMemoryCache(key, entry)
        break
      case 'session':
        await this.setSessionStorage(key, entry)
        break
      case 'local':
        await this.setLocalStorage(key, entry)
        break
      case 'indexeddb':
        await this.setIndexedDB(key, entry)
        break
    }
    
    this.updateStats()
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Chercher dans tous les niveaux (ordre de priorité)
    let entry = await this.getMemoryCache<T>(key)
    if (!entry) entry = await this.getSessionStorage<T>(key)
    if (!entry) entry = await this.getLocalStorage<T>(key)
    if (!entry) entry = await this.getIndexedDB<T>(key)
    
    if (!entry) {
      this.misses++
      return null
    }
    
    // Vérifier expiration
    if (this.isExpired(entry)) {
      await this.delete(key)
      this.misses++
      return null
    }
    
    entry.hits++
    this.hits++
    
    // Décompresser si nécessaire
    let value = entry.value
    if (entry.compressed) {
      const decompressed = await this.decompress(value as string)
      value = JSON.parse(decompressed)
    }
    
    return value
  }

  /**
   * Supprime une entrée du cache
   */
  async delete(key: string): Promise<boolean> {
    let deleted = false
    
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key)
      deleted = true
    }
    
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key)
        deleted = true
      }
      
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        deleted = true
      }
    }
    
    // IndexedDB delete
    try {
      await this.deleteFromIndexedDB(key)
      deleted = true
    } catch (error) {
      // IndexedDB might not be available
    }
    
    this.updateStats()
    return deleted
  }

  /**
   * Invalide les entrées selon un pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let invalidated = 0
    const regex = new RegExp(pattern.replace('*', '.*'))
    
    // Memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
        invalidated++
      }
    }
    
    // Storage (approximation - pas de pattern matching parfait)
    if (typeof window !== 'undefined') {
      // Session storage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && regex.test(key)) {
          sessionStorage.removeItem(key)
          invalidated++
        }
      }
      
      // Local storage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && regex.test(key)) {
          localStorage.removeItem(key)
          invalidated++
        }
      }
    }
    
    this.updateStats()
    return invalidated
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      hitRate: this.hits / (this.hits + this.misses) || 0
    }
  }

  /**
   * Nettoie le cache (supprime les entrées expirées)
   */
  async cleanup(): Promise<number> {
    let cleaned = 0
    
    // Memory cache cleanup
    for (const [key, entry] of this.memoryCache) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key)
        cleaned++
      }
    }
    
    this.updateStats()
    return cleaned
  }

  /**
   * Cache en mémoire
   */
  private async setMemoryCache<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    // Éviction si nécessaire
    if (this.getMemoryCacheSize() + entry.size > this.maxMemorySize) {
      await this.evictLeastUsed()
    }
    
    this.memoryCache.set(key, entry)
  }

  private async getMemoryCache<T>(key: string): Promise<CacheEntry<T> | null> {
    return this.memoryCache.get(key) || null
  }

  /**
   * Session storage
   */
  private async setSessionStorage<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to set session storage:', error)
    }
  }

  private async getSessionStorage<T>(key: string): Promise<CacheEntry<T> | null> {
    if (typeof window === 'undefined') return null
    
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      return null
    }
  }

  /**
   * Local storage
   */
  private async setLocalStorage<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to set local storage:', error)
    }
  }

  private async getLocalStorage<T>(key: string): Promise<CacheEntry<T> | null> {
    if (typeof window === 'undefined') return null
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      return null
    }
  }

  /**
   * IndexedDB (simulation simple)
   */
  private async setIndexedDB<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    // Implémentation simplifiée - en production, utiliser une vraie API IndexedDB
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`idb_${key}`, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to set IndexedDB:', error)
    }
  }

  private async getIndexedDB<T>(key: string): Promise<CacheEntry<T> | null> {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(`idb_${key}`)
      return item ? JSON.parse(item) : null
    } catch (error) {
      return null
    }
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`idb_${key}`)
  }

  /**
   * Compression (simulation simple)
   */
  private async compress(data: string): Promise<string> {
    // En production, utiliser une vraie librairie de compression comme pako
    return btoa(data) // Base64 comme simulation
  }

  private async decompress(compressedData: string): Promise<string> {
    return atob(compressedData)
  }

  /**
   * Utilitaires
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private getMemoryCacheSize(): number {
    let size = 0
    for (const entry of this.memoryCache.values()) {
      size += entry.size
    }
    return size
  }

  private async evictLeastUsed(): Promise<void> {
    let leastUsedKey: string | null = null
    let leastHits = Infinity
    
    for (const [key, entry] of this.memoryCache) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits
        leastUsedKey = key
      }
    }
    
    if (leastUsedKey) {
      this.memoryCache.delete(leastUsedKey)
      this.stats.evictions++
    }
  }

  private updateStats(): void {
    this.stats.totalEntries = this.memoryCache.size
    this.stats.totalSize = this.getMemoryCacheSize()
    
    // Calculer ratio de compression
    let totalOriginal = 0
    let totalCompressed = 0
    for (const entry of this.memoryCache.values()) {
      if (entry.compressed) {
        totalOriginal += entry.size * 1.5 // Estimation
        totalCompressed += entry.size
      }
    }
    
    this.stats.compressionRatio = totalOriginal > 0 ? 
      (totalOriginal - totalCompressed) / totalOriginal : 0
  }

  /**
   * Réinitialise toutes les statistiques
   */
  resetStats(): void {
    this.hits = 0
    this.misses = 0
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      compressionRatio: 0,
      evictions: 0
    }
  }

  /**
   * Vide complètement le cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()
    
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
      localStorage.clear()
    }
    
    this.updateStats()
  }
}

// Instance par défaut
export const cacheManager = new CacheManager()