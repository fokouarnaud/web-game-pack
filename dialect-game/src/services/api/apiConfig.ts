/**
 * Configuration centralisée des APIs avec robustesse avancée
 * Task 10: APIs Robustesse - Phase 3
 */

// Types pour la configuration des APIs
export interface ApiEndpoint {
  url: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  backoffMultiplier: number;
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    window: number; // en milliseconds
  };
}

export interface ApiConfig {
  dictionary: ApiEndpoint;
  translate: ApiEndpoint;
  unsplash: ApiEndpoint;
  pexels: ApiEndpoint;
  fallback: {
    enabled: boolean;
    timeout: number;
  };
  monitoring: {
    enabled: boolean;
    logErrors: boolean;
    trackPerformance: boolean;
  };
}

// Configuration par défaut avec robustesse
export const defaultApiConfig: ApiConfig = {
  dictionary: {
    url: 'https://api.dictionaryapi.dev/api/v2/entries',
    timeout: 8000,
    retries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    rateLimit: {
      requests: 60,
      window: 60000, // 1 minute
    },
  },
  
  translate: {
    url: 'https://libretranslate.de/translate',
    timeout: 10000,
    retries: 2,
    retryDelay: 1500,
    backoffMultiplier: 1.5,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    rateLimit: {
      requests: 20,
      window: 60000, // 1 minute
    },
  },
  
  unsplash: {
    url: 'https://api.unsplash.com/search/photos',
    timeout: 6000,
    retries: 2,
    retryDelay: 800,
    backoffMultiplier: 2,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo'}`,
    },
    rateLimit: {
      requests: 50,
      window: 3600000, // 1 heure
    },
  },
  
  pexels: {
    url: 'https://api.pexels.com/v1/search',
    timeout: 6000,
    retries: 2,
    retryDelay: 800,
    backoffMultiplier: 2,
    headers: {
      'Accept': 'application/json',
      'Authorization': import.meta.env.VITE_PEXELS_API_KEY || 'demo',
    },
    rateLimit: {
      requests: 200,
      window: 3600000, // 1 heure
    },
  },
  
  fallback: {
    enabled: true,
    timeout: 3000,
  },
  
  monitoring: {
    enabled: import.meta.env.DEV || import.meta.env.VITE_API_MONITORING === 'true',
    logErrors: true,
    trackPerformance: true,
  },
};

// Types d'erreurs API
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Classe d'erreur API personnalisée
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly status?: number;
  public readonly endpoint: string;
  public readonly timestamp: number;
  public readonly retryable: boolean;
  public readonly originalError?: Error;

  constructor(
    message: string,
    type: ApiErrorType,
    endpoint: string,
    status?: number,
    retryable: boolean = false,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.endpoint = endpoint;
    this.timestamp = Date.now();
    this.retryable = retryable;
    this.originalError = originalError;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      status: this.status,
      endpoint: this.endpoint,
      timestamp: this.timestamp,
      retryable: this.retryable,
    };
  }
}

// Statuts de santé des APIs
export interface ApiHealthStatus {
  healthy: boolean;
  latency: number;
  lastCheck: number;
  errorRate: number;
  availabilityScore: number;
}

export interface SystemHealth {
  dictionary: ApiHealthStatus;
  translate: ApiHealthStatus;
  unsplash: ApiHealthStatus;
  pexels: ApiHealthStatus;
  overall: {
    healthy: boolean;
    score: number;
    lastUpdate: number;
  };
}

// Métriques de performance
export interface ApiMetrics {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  averageLatency: number;
  errorsByType: Record<ApiErrorType, number>;
  lastResetTime: number;
}

// Circuit breaker states
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  minimumRequests: number;
}

// Rate limiting
export interface RateLimitState {
  requests: number;
  windowStart: number;
  blocked: boolean;
}

// Configuration des environments
export const getEnvironmentConfig = (): Partial<ApiConfig> => {
  const env = import.meta.env.MODE;
  
  switch (env) {
    case 'development':
      return {
        monitoring: {
          enabled: true,
          logErrors: true,
          trackPerformance: true,
        },
      };
      
    case 'production':
      return {
        dictionary: {
          ...defaultApiConfig.dictionary,
          timeout: 5000,
          retries: 2,
        },
        translate: {
          ...defaultApiConfig.translate,
          timeout: 8000,
          retries: 2,
        },
        monitoring: {
          enabled: false,
          logErrors: true,
          trackPerformance: false,
        },
      };
      
    case 'enhanced':
      return {
        monitoring: {
          enabled: true,
          logErrors: true,
          trackPerformance: true,
        },
      };
      
    default:
      return {};
  }
};

// Merge de la configuration avec l'environment
export const createApiConfig = (): ApiConfig => {
  const envConfig = getEnvironmentConfig();
  return {
    ...defaultApiConfig,
    ...envConfig,
    dictionary: { ...defaultApiConfig.dictionary, ...envConfig.dictionary },
    translate: { ...defaultApiConfig.translate, ...envConfig.translate },
    unsplash: { ...defaultApiConfig.unsplash, ...envConfig.unsplash },
    pexels: { ...defaultApiConfig.pexels, ...envConfig.pexels },
    fallback: { ...defaultApiConfig.fallback, ...envConfig.fallback },
    monitoring: { ...defaultApiConfig.monitoring, ...envConfig.monitoring },
  };
};

// Export de la configuration finale
export const API_CONFIG = createApiConfig();