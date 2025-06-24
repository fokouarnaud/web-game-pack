/**
 * usePreloadData - Hook optimisé cache localStorage + retry + monitoring
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export interface PreloadDataOptions<T = any> {
  cacheKey: string;
  ttl?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enablePerformanceTracking?: boolean;
  fallbackData?: T | null;
}

export interface UsePreloadDataReturn<T = any> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  isCached: boolean;
  preloadData: (fetcher: () => Promise<T>) => Promise<void>;
  refreshData: (fetcher: () => Promise<T>) => Promise<void>;
  clearCache: () => void;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  loadTime: number;
  cacheHitRate: number;
  retryCount: number;
  lastError: string | null;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const CACHE_PREFIX = 'dialect-game-cache';

export const usePreloadData = <T = any>(options: PreloadDataOptions<T>): UsePreloadDataReturn<T> => {
  const {
    cacheKey,
    ttl = 3600000,
    retryAttempts = 3,
    retryDelay = 100,
    enablePerformanceTracking = true,
    fallbackData = null as T | null
  } = options;
  
  const [data, setData] = useState<T | null>(fallbackData as T | null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    cacheHitRate: 0,
    retryCount: 0,
    lastError: null
  });
  
  const metricsRef = useRef(performanceMetrics);
  const startTimeRef = useRef<number>(0);
  
  const getFullKey = useCallback((key: string) => `${CACHE_PREFIX}-${key}`, []);
  
  const readCache = useCallback((key: string): CachedData<T> | null => {
    try {
      const cached = localStorage.getItem(getFullKey(key));
      if (!cached) return null;
      
      const parsed: CachedData<T> = JSON.parse(cached);
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(getFullKey(key));
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, [getFullKey]);
  
  const writeCache = useCallback((key: string, data: T): void => {
    try {
      const cacheData: CachedData<T> = { data, timestamp: Date.now(), ttl };
      localStorage.setItem(getFullKey(key), JSON.stringify(cacheData));
    } catch (error) {
      console.error('[usePreloadData] Cache error:', error);
    }
  }, [getFullKey, ttl]);
  
  const retry = useCallback(async (fetcher: () => Promise<T>, attempt: number = 0): Promise<T> => {
    try {
      return await fetcher();
    } catch (error) {
      if (attempt < retryAttempts) {
        const delay = retryDelay * Math.pow(2, attempt);
        metricsRef.current = {
          ...metricsRef.current,
          retryCount: attempt + 1,
          lastError: error instanceof Error ? error.message : String(error)
        };
        setPerformanceMetrics(metricsRef.current);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fetcher, attempt + 1);
      }
      throw error;
    }
  }, [retryAttempts, retryDelay]);
  
  const preloadData = useCallback(async (fetcher: () => Promise<T>): Promise<void> => {
    if (enablePerformanceTracking) startTimeRef.current = performance.now();
    setIsLoading(true);
    setError(null);
    
    try {
      const cached = readCache(cacheKey);
      if (cached) {
        setData(cached.data);
        setLastUpdated(new Date(cached.timestamp));
        setIsCached(true);
        
        if (enablePerformanceTracking) {
          metricsRef.current = {
            ...metricsRef.current,
            cacheHitRate: Math.min(100, metricsRef.current.cacheHitRate + 10),
            loadTime: performance.now() - startTimeRef.current
          };
          setPerformanceMetrics(metricsRef.current);
        }
        return;
      }
      
      const result = await retry(fetcher);
      writeCache(cacheKey, result);
      setData(result);
      setLastUpdated(new Date());
      setIsCached(false);
      
      if (enablePerformanceTracking) {
        metricsRef.current = {
          ...metricsRef.current,
          loadTime: performance.now() - startTimeRef.current,
          cacheHitRate: Math.max(0, metricsRef.current.cacheHitRate - 5),
          lastError: null
        };
        setPerformanceMetrics(metricsRef.current);
      }
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      if (fallbackData !== null) setData(fallbackData);
      metricsRef.current = { ...metricsRef.current, lastError: err.message };
      setPerformanceMetrics(metricsRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, enablePerformanceTracking, readCache, retry, writeCache, fallbackData]);
  
  const refreshData = useCallback(async (fetcher: () => Promise<T>): Promise<void> => {
    localStorage.removeItem(getFullKey(cacheKey));
    await preloadData(fetcher);
  }, [cacheKey, getFullKey, preloadData]);
  
  const clearCache = useCallback((): void => {
    localStorage.removeItem(getFullKey(cacheKey));
    setData(fallbackData as T | null);
    setLastUpdated(null);
    setIsCached(false);
    setError(null);
    const reset: PerformanceMetrics = { loadTime: 0, cacheHitRate: 0, retryCount: 0, lastError: null };
    metricsRef.current = reset;
    setPerformanceMetrics(reset);
  }, [cacheKey, getFullKey, fallbackData]);
  
  useEffect(() => {
    const cached = readCache(cacheKey);
    if (cached) {
      setData(cached.data);
      setLastUpdated(new Date(cached.timestamp));
      setIsCached(true);
    }
  }, [cacheKey, readCache]);
  
  return {
    data,
    isLoading,
    error,
    lastUpdated,
    isCached,
    preloadData,
    refreshData,
    clearCache,
    performanceMetrics
  };
};

export default usePreloadData;