/**
 * Configuration Sentry pour monitoring et error tracking
 * Task 18: Déploiement Production - Phase 4
 */

import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import React from 'react';

// Configuration Sentry pour différents environnements
const sentryConfig = {
  development: {
    dsn: process.env.SENTRY_DSN_DEV,
    environment: 'development',
    debug: true,
    enabled: false,
    sampleRate: 1.0,
    tracesSampleRate: 1.0
  },
  staging: {
    dsn: process.env.SENTRY_DSN_STAGING,
    environment: 'staging',
    debug: false,
    enabled: true,
    sampleRate: 1.0,
    tracesSampleRate: 0.5
  },
  production: {
    dsn: process.env.SENTRY_DSN_PROD,
    environment: 'production',
    debug: false,
    enabled: true,
    sampleRate: 0.1,
    tracesSampleRate: 0.1
  }
};

// Initialiser Sentry
export function initSentry() {
  const environment = process.env.NODE_ENV || 'development';
  const config = sentryConfig[environment];

  if (!config.enabled) {
    console.log('[Sentry] Disabled for', environment);
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    debug: config.debug,
    
    // Performance monitoring
    integrations: [
      new BrowserTracing({
        tracingOrigins: [
          'localhost',
          'dialect-game.com',
          'staging.dialect-game.com',
          /^\//,
        ],
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],

    // Sampling rates
    sampleRate: config.sampleRate,
    tracesSampleRate: config.tracesSampleRate,

    // Release information
    release: process.env.VERSION || 'unknown',
    dist: process.env.BUILD_ID || 'unknown',

    // User context
    initialScope: {
      tags: {
        component: 'dialect-game-frontend',
        environment: config.environment,
        version: process.env.VERSION,
        buildId: process.env.BUILD_ID,
      },
    },

    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      const error = hint.originalException;
      
      if (error && error.message) {
        // Filter out network errors
        if (error.message.includes('Network Error') || 
            error.message.includes('fetch')) {
          return null;
        }
        
        // Filter out extension errors
        if (error.message.includes('extension') || 
            error.message.includes('chrome-extension')) {
          return null;
        }
        
        // Filter out ResizeObserver errors
        if (error.message.includes('ResizeObserver')) {
          return null;
        }
      }

      // Add user context
      event.user = {
        id: getUserId(),
        username: getUsername(),
        email: getUserEmail(),
      };

      // Add custom context
      event.contexts = {
        ...event.contexts,
        browser: {
          name: navigator.userAgent,
          version: navigator.appVersion,
        },
        device: {
          type: getDeviceType(),
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
        },
        performance: {
          memory: performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
          } : null,
          navigation: performance.navigation ? {
            type: performance.navigation.type,
            redirectCount: performance.navigation.redirectCount,
          } : null,
        },
      };

      return event;
    },

    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      
      if (breadcrumb.category === 'ui.click' && 
          breadcrumb.message?.includes('button')) {
        // Add custom data for button clicks
        breadcrumb.data = {
          ...breadcrumb.data,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        };
      }

      return breadcrumb;
    },
  });

  // Set up custom error handlers
  setupCustomErrorHandlers();
  
  console.log('[Sentry] Initialized for', config.environment);
}

// Configuration personnalisée pour les erreurs
function setupCustomErrorHandlers() {
  // Capture les erreurs non gérées
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason, {
      tags: {
        type: 'unhandled_promise_rejection',
      },
      extra: {
        promise: event.promise,
        reason: event.reason,
      },
    });
  });

  // Capture les erreurs de ressources
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      Sentry.captureMessage(`Resource loading error: ${event.target.src || event.target.href}`, 'warning', {
        tags: {
          type: 'resource_error',
        },
        extra: {
          source: event.target.src || event.target.href,
          tagName: event.target.tagName,
        },
      });
    }
  });
}

// Fonctions utilitaires
function getUserId() {
  // Récupérer l'ID utilisateur depuis le store ou localStorage
  return localStorage.getItem('userId') || 'anonymous';
}

function getUsername() {
  // Récupérer le nom d'utilisateur
  return localStorage.getItem('username') || null;
}

function getUserEmail() {
  // Récupérer l'email utilisateur
  return localStorage.getItem('userEmail') || null;
}

function getDeviceType() {
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    return 'mobile';
  }
  if (/Tablet|iPad/i.test(navigator.userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}

// API publique pour capturer des erreurs personnalisées
export const errorTracker = {
  // Capturer une erreur
  captureError: (error, context = {}) => {
    Sentry.captureException(error, {
      tags: {
        type: 'application_error',
        ...context.tags,
      },
      extra: context.extra || {},
      level: context.level || 'error',
    });
  },

  // Capturer un message
  captureMessage: (message, level = 'info', context = {}) => {
    Sentry.captureMessage(message, level, {
      tags: context.tags || {},
      extra: context.extra || {},
    });
  },

  // Ajouter du contexte utilisateur
  setUserContext: (user) => {
    Sentry.setUser(user);
  },

  // Ajouter des tags personnalisés
  setTags: (tags) => {
    Sentry.setTags(tags);
  },

  // Ajouter du contexte supplémentaire
  setContext: (key, context) => {
    Sentry.setContext(key, context);
  },

  // Mesurer la performance
  measurePerformance: (name, operation) => {
    const transaction = Sentry.startTransaction({ name });
    const span = transaction.startChild({ op: operation });
    
    return {
      finish: (result) => {
        span.setData('result', result);
        span.finish();
        transaction.finish();
      },
      setData: (key, value) => {
        span.setData(key, value);
      },
    };
  },

  // Capturer les métriques Web Vitals
  captureWebVitals: (metric) => {
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value}`,
      level: 'info',
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      },
    });

    // Envoyer comme métrique personnalisée si critique
    if (metric.rating === 'poor') {
      Sentry.captureMessage(`Poor Web Vital: ${metric.name}`, 'warning', {
        tags: {
          type: 'web_vitals',
          metric: metric.name,
          rating: metric.rating,
        },
        extra: {
          value: metric.value,
          threshold: getWebVitalThreshold(metric.name),
        },
      });
    }
  },
};

// Seuils Web Vitals
function getWebVitalThreshold(name) {
  const thresholds = {
    CLS: 0.1,
    FID: 100,
    FCP: 1800,
    LCP: 2500,
    TTFB: 800,
  };
  return thresholds[name] || 0;
}

// Integration avec React Error Boundary
export class SentryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.withScope((scope) => {
      scope.setTags({
        type: 'react_error_boundary',
        component: this.constructor.name,
      });
      scope.setExtra('errorInfo', errorInfo);
      scope.setContext('component', {
        stack: errorInfo.componentStack,
        props: this.props,
      });
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Oops! Quelque chose s'est mal passé.</h2>
          <p>Une erreur inattendue s'est produite. Notre équipe a été notifiée.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default { initSentry, errorTracker, SentryErrorBoundary };