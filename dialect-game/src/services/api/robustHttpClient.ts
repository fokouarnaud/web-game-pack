/**
 * Client HTTP robuste avec retry logic, circuit breaker et monitoring
 * Task 10: APIs Robustesse - Phase 3
 */

import type {
  ApiConfig,
  CircuitBreakerConfig,
  RateLimitState,
  ApiMetrics,
} from './apiConfig';

import {
  ApiError,
  ApiErrorType,
  CircuitBreakerState,
  API_CONFIG
} from './apiConfig';

import { persistentCache } from './persistentCache';
import { apiMonitoring } from './apiMonitoring';

// Interface pour les options de requête
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipCache?: boolean;
  skipRateLimit?: boolean;
}

// Interface pour la réponse
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  cached: boolean;
  timing: {
    start: number;
    end: number;
    duration: number;
  };
}

// Circuit Breaker implementation
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private nextAttempt: number = 0;
  private successCount: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new ApiError(
          'Circuit breaker is OPEN',
          ApiErrorType.RATE_LIMIT_ERROR,
          'circuit-breaker',
          503,
          false
        );
      } else {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0;
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.minimumRequests) {
        this.state = CircuitBreakerState.CLOSED;
        this.failures = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + this.config.resetTimeout;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
    };
  }
}

// Rate Limiter implementation
class RateLimiter {
  private states = new Map<string, RateLimitState>();

  checkLimit(endpoint: string, limit: { requests: number; window: number }): boolean {
    const now = Date.now();
    const key = endpoint;
    
    let state = this.states.get(key);
    
    if (!state || now - state.windowStart >= limit.window) {
      state = {
        requests: 0,
        windowStart: now,
        blocked: false,
      };
      this.states.set(key, state);
    }

    if (state.requests >= limit.requests) {
      state.blocked = true;
      return false;
    }

    state.requests++;
    return true;
  }

  getRemainingRequests(endpoint: string, limit: { requests: number; window: number }): number {
    const state = this.states.get(endpoint);
    if (!state) return limit.requests;
    return Math.max(0, limit.requests - state.requests);
  }
}

// Cache implementation
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes par défaut
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Cleanup automatique
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Metrics collector
class MetricsCollector {
  private metrics = new Map<string, ApiMetrics>();

  recordRequest(endpoint: string, success: boolean, latency: number, errorType?: ApiErrorType): void {
    let metric = this.metrics.get(endpoint);
    
    if (!metric) {
      metric = {
        totalRequests: 0,
        successRequests: 0,
        failedRequests: 0,
        averageLatency: 0,
        errorsByType: {} as Record<ApiErrorType, number>,
        lastResetTime: Date.now(),
      };
      this.metrics.set(endpoint, metric);
    }

    metric.totalRequests++;
    
    if (success) {
      metric.successRequests++;
    } else {
      metric.failedRequests++;
      if (errorType) {
        metric.errorsByType[errorType] = (metric.errorsByType[errorType] || 0) + 1;
      }
    }

    // Calcul de la latence moyenne (moving average)
    metric.averageLatency = (metric.averageLatency * (metric.totalRequests - 1) + latency) / metric.totalRequests;
  }

  getMetrics(endpoint?: string): ApiMetrics | Record<string, ApiMetrics> {
    if (endpoint) {
      return this.metrics.get(endpoint) || this.createEmptyMetrics();
    }
    return Object.fromEntries(this.metrics);
  }

  resetMetrics(endpoint?: string): void {
    if (endpoint) {
      this.metrics.set(endpoint, this.createEmptyMetrics());
    } else {
      this.metrics.clear();
    }
  }

  private createEmptyMetrics(): ApiMetrics {
    return {
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      errorsByType: {} as Record<ApiErrorType, number>,
      lastResetTime: Date.now(),
    };
  }
}

// Client HTTP robuste principal
export class RobustHttpClient {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private rateLimiter = new RateLimiter();
  private cache = new RequestCache();
  private metrics = new MetricsCollector();
  private config: ApiConfig;

  constructor(config: ApiConfig = API_CONFIG) {
    this.config = config;
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers(): void {
    const circuitBreakerConfig: CircuitBreakerConfig = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 secondes
      minimumRequests: 3,
    };

    ['dictionary', 'translate', 'unsplash', 'pexels'].forEach(endpoint => {
      this.circuitBreakers.set(endpoint, new CircuitBreaker(circuitBreakerConfig));
    });
  }

  async request<T>(
    endpoint: string,
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    const endpointConfig = this.getEndpointConfig(endpoint);
    const cacheKey = this.getCacheKey(url, options);

    try {
      // Vérifier le cache mémoire d'abord
      if (!options.skipCache) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          // Enregistrer le hit de cache dans le monitoring
          apiMonitoring.recordApiCall({
            endpoint,
            method: options.method || 'GET',
            url,
            timestamp: startTime,
            duration: performance.now() - startTime,
            status: 200,
            success: true,
            cached: true,
            retryCount: 0,
          });

          return {
            data: cached,
            status: 200,
            headers: new Headers(),
            cached: true,
            timing: {
              start: startTime,
              end: performance.now(),
              duration: performance.now() - startTime,
            },
          };
        }

        // Vérifier le cache persistant
        const persistentCached = await persistentCache.get(cacheKey);
        if (persistentCached) {
          // Mettre en cache mémoire pour accès rapide
          this.cache.set(cacheKey, persistentCached, 300000);

          // Enregistrer le hit de cache persistant
          apiMonitoring.recordApiCall({
            endpoint,
            method: options.method || 'GET',
            url,
            timestamp: startTime,
            duration: performance.now() - startTime,
            status: 200,
            success: true,
            cached: true,
            retryCount: 0,
          });

          return {
            data: persistentCached,
            status: 200,
            headers: new Headers(),
            cached: true,
            timing: {
              start: startTime,
              end: performance.now(),
              duration: performance.now() - startTime,
            },
          };
        }
      }

      // Vérifier rate limiting
      if (!options.skipRateLimit && endpointConfig.rateLimit) {
        if (!this.rateLimiter.checkLimit(endpoint, endpointConfig.rateLimit)) {
          throw new ApiError(
            `Rate limit exceeded for ${endpoint}`,
            ApiErrorType.RATE_LIMIT_ERROR,
            endpoint,
            429,
            true
          );
        }
      }

      // Exécuter avec circuit breaker
      const circuitBreaker = this.circuitBreakers.get(endpoint);
      if (!circuitBreaker) {
        throw new ApiError(
          `No circuit breaker found for ${endpoint}`,
          ApiErrorType.UNKNOWN_ERROR,
          endpoint
        );
      }

      const response = await circuitBreaker.execute(() =>
        this.executeRequest<T>(url, { ...endpointConfig, ...options })
      );

      // Mettre en cache si succès
      if (!options.skipCache && response.status === 200) {
        this.cache.set(cacheKey, response.data, 300000); // 5 minutes
        
        // Mettre aussi en cache persistant pour offline
        await persistentCache.set(cacheKey, response.data, 3600000, endpoint); // 1 heure
      }

      // Enregistrer les métriques dans le système existant
      const duration = performance.now() - startTime;
      if (this.config.monitoring.trackPerformance) {
        this.metrics.recordRequest(endpoint, true, duration);
      }

      // Enregistrer dans le système de monitoring avancé
      apiMonitoring.recordApiCall({
        endpoint,
        method: options.method || 'GET',
        url,
        timestamp: startTime,
        duration,
        status: response.status,
        success: true,
        cached: false,
        retryCount: options.retries || 0,
      });

      return {
        ...response,
        cached: false,
        timing: {
          start: startTime,
          end: performance.now(),
          duration,
        },
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      const apiError = this.normalizeError(error, endpoint);

      // Enregistrer les métriques d'erreur dans le système existant
      if (this.config.monitoring.trackPerformance) {
        this.metrics.recordRequest(endpoint, false, duration, apiError.type);
      }

      // Enregistrer dans le système de monitoring avancé
      apiMonitoring.recordApiCall({
        endpoint,
        method: options.method || 'GET',
        url,
        timestamp: startTime,
        duration,
        status: apiError.status || null,
        success: false,
        errorType: apiError.type,
        cached: false,
        retryCount: options.retries || 0,
      });

      // Logger l'erreur si activé
      if (this.config.monitoring.logErrors) {
        console.error(`API Error [${endpoint}]:`, apiError.toJSON());
      }

      throw apiError;
    }
  }

  private async executeRequest<T>(
    url: string,
    options: RequestOptions & { timeout: number; retries: number; retryDelay: number }
  ): Promise<ApiResponse<T>> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= options.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout);

        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: options.headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            this.getErrorTypeFromStatus(response.status),
            url,
            response.status,
            response.status >= 500 || response.status === 429
          );
        }

        const data = await response.json();

        return {
          data,
          status: response.status,
          headers: response.headers,
          cached: false,
          timing: { start: 0, end: 0, duration: 0 }, // Will be filled by caller
        };

      } catch (error) {
        lastError = error as Error;

        // Ne pas retry si c'est une erreur non-retryable
        if (error instanceof ApiError && !error.retryable) {
          throw error;
        }

        // Attendre avant le prochain retry
        if (attempt < options.retries) {
          const delay = options.retryDelay * Math.pow(2, attempt); // Exponential backoff
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  private getEndpointConfig(endpoint: string) {
    switch (endpoint) {
      case 'dictionary':
        return this.config.dictionary;
      case 'translate':
        return this.config.translate;
      case 'unsplash':
        return this.config.unsplash;
      case 'pexels':
        return this.config.pexels;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  }

  private getCacheKey(url: string, options: RequestOptions): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private getErrorTypeFromStatus(status: number): ApiErrorType {
    if (status === 401 || status === 403) return ApiErrorType.AUTH_ERROR;
    if (status === 404) return ApiErrorType.NOT_FOUND_ERROR;
    if (status === 429) return ApiErrorType.RATE_LIMIT_ERROR;
    if (status >= 500) return ApiErrorType.SERVER_ERROR;
    if (status >= 400) return ApiErrorType.VALIDATION_ERROR;
    return ApiErrorType.UNKNOWN_ERROR;
  }

  private normalizeError(error: any, endpoint: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error.name === 'AbortError') {
      return new ApiError(
        'Request timeout',
        ApiErrorType.TIMEOUT_ERROR,
        endpoint,
        408,
        true,
        error
      );
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new ApiError(
        'Network error',
        ApiErrorType.NETWORK_ERROR,
        endpoint,
        undefined,
        true,
        error
      );
    }

    return new ApiError(
      error.message || 'Unknown error',
      ApiErrorType.UNKNOWN_ERROR,
      endpoint,
      undefined,
      false,
      error
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Méthodes d'administration et monitoring
  getMetrics(endpoint?: string) {
    return this.metrics.getMetrics(endpoint);
  }

  getCircuitBreakerStatus() {
    const status: Record<string, any> = {};
    this.circuitBreakers.forEach((breaker, endpoint) => {
      status[endpoint] = breaker.getMetrics();
    });
    return status;
  }

  getRateLimitStatus(endpoint: string) {
    const config = this.getEndpointConfig(endpoint);
    if (!config.rateLimit) return null;

    return {
      remaining: this.rateLimiter.getRemainingRequests(endpoint, config.rateLimit),
      limit: config.rateLimit.requests,
      window: config.rateLimit.window,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  resetMetrics(endpoint?: string): void {
    this.metrics.resetMetrics(endpoint);
  }

  // Nouvelles méthodes pour Task 10: APIs Robustesse
  async clearPersistentCache(): Promise<boolean> {
    return await persistentCache.clear();
  }

  async getPersistentCacheStats() {
    return await persistentCache.getStats();
  }

  getAdvancedMetrics(endpoint?: string) {
    return apiMonitoring.getEndpointMetrics(endpoint || 'all');
  }

  getSystemHealth() {
    return apiMonitoring.getSystemHealth();
  }

  getEndpointHealth(endpoint: string) {
    return apiMonitoring.getEndpointHealth(endpoint);
  }

  getActiveAlerts() {
    return apiMonitoring.getActiveAlerts();
  }

  addAlertRule(rule: any) {
    return apiMonitoring.addAlertRule(rule);
  }

  async backupCache(endpoint?: string) {
    return await persistentCache.backup(endpoint);
  }

  async restoreCache(entries: any[]) {
    return await persistentCache.restore(entries);
  }

  getDebugInfo() {
    return {
      robustClient: {
        config: this.config,
        cacheSize: this.cache.size(),
        circuitBreakers: this.getCircuitBreakerStatus(),
      },
      persistentCache: persistentCache.getPerformanceStats(),
      monitoring: apiMonitoring.getDebugInfo(),
    };
  }
}

// Instance globale
export const robustHttpClient = new RobustHttpClient();