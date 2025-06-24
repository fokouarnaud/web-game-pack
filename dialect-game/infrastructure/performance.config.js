/**
 * Configuration performance et optimisation CDN
 * Task 18: Déploiement Production - Phase 4
 */

// Configuration CDN et caching
export const CDN_CONFIG = {
  // CDN providers configuration
  providers: {
    cloudflare: {
      enabled: true,
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      endpoint: 'https://api.cloudflare.com/client/v4',
      purgeUrl: '/zones/{zone_id}/purge_cache',
    },
    
    gcp: {
      enabled: true,
      projectId: process.env.GCP_PROJECT_ID,
      bucketName: process.env.GCP_CDN_BUCKET,
      region: 'us-central1',
    },
    
    aws: {
      enabled: false,
      distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
      region: 'us-east-1',
    },
  },

  // Cache configuration
  caching: {
    // Static assets
    static: {
      maxAge: 31536000, // 1 year
      staleWhileRevalidate: 86400, // 1 day
      patterns: [
        '*.js',
        '*.css',
        '*.woff2',
        '*.woff',
        '*.ttf',
        '*.svg',
        '*.png',
        '*.jpg',
        '*.jpeg',
        '*.webp',
        '*.avif',
      ],
    },
    
    // HTML pages
    html: {
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 3600, // 1 hour
      patterns: ['*.html', '/'],
    },
    
    // API responses
    api: {
      maxAge: 60, // 1 minute
      staleWhileRevalidate: 300, // 5 minutes
      patterns: ['/api/*'],
    },
    
    // Dynamic content
    dynamic: {
      maxAge: 0,
      staleWhileRevalidate: 60,
      patterns: ['/dashboard/*', '/session/*'],
    },
  },

  // Compression configuration
  compression: {
    gzip: {
      enabled: true,
      level: 6,
      threshold: 1024, // bytes
    },
    brotli: {
      enabled: true,
      quality: 4,
      threshold: 1024, // bytes
    },
  },
};

// Configuration optimisation des ressources
export const OPTIMIZATION_CONFIG = {
  // Images optimization
  images: {
    formats: ['webp', 'avif', 'jpg', 'png'],
    qualities: {
      low: 60,
      medium: 80,
      high: 90,
    },
    sizes: {
      thumbnail: { width: 150, height: 150 },
      small: { width: 400, height: 300 },
      medium: { width: 800, height: 600 },
      large: { width: 1200, height: 900 },
      xl: { width: 1920, height: 1080 },
    },
    lazyLoading: true,
    placeholder: 'blur',
  },

  // Fonts optimization
  fonts: {
    preload: [
      '/fonts/Inter-Regular.woff2',
      '/fonts/Inter-Medium.woff2',
      '/fonts/Inter-SemiBold.woff2',
    ],
    display: 'swap',
    fallbacks: {
      'Inter': 'system-ui, -apple-system, sans-serif',
    },
  },

  // JavaScript optimization
  javascript: {
    minify: true,
    sourceMaps: process.env.NODE_ENV !== 'production',
    splitting: {
      vendor: true,
      common: true,
      dynamic: true,
    },
    polyfills: {
      enabled: true,
      targets: '> 0.5%, last 2 versions, not dead',
    },
  },

  // CSS optimization
  css: {
    minify: true,
    autoprefixer: true,
    purge: {
      enabled: true,
      safelist: [
        'dark',
        /^bg-/,
        /^text-/,
        /^border-/,
        /^hover:/,
        /^focus:/,
      ],
    },
    critical: {
      enabled: true,
      inline: true,
      minify: true,
    },
  },
};

// Configuration monitoring des performances
export const PERFORMANCE_MONITORING = {
  // Core Web Vitals
  webVitals: {
    enabled: true,
    sampleRate: 0.1,
    thresholds: {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    },
  },

  // Resource monitoring
  resources: {
    enabled: true,
    thresholds: {
      loadTime: 3000, // ms
      size: 5242880, // 5MB
      count: 100,
    },
  },

  // Network monitoring
  network: {
    enabled: true,
    timeout: 5000, // ms
    retries: 3,
  },

  // Bundle analysis
  bundleAnalysis: {
    enabled: true,
    maxSize: {
      warning: 2097152, // 2MB
      error: 5242880, // 5MB
    },
  },
};

// Fonctions d'optimisation
export const performanceOptimizer = {
  // Précharger les ressources critiques
  preloadCriticalResources: () => {
    const resources = [
      // Fonts
      ...OPTIMIZATION_CONFIG.fonts.preload.map(font => ({
        href: font,
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous',
      })),
      
      // Critical CSS
      {
        href: '/css/critical.css',
        as: 'style',
      },
      
      // Critical JS
      {
        href: '/js/critical.js',
        as: 'script',
      },
    ];

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      Object.assign(link, resource);
      document.head.appendChild(link);
    });
  },

  // Lazy load des images
  setupLazyLoading: () => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  },

  // Préconnexion aux domaines externes
  preconnectExternalDomains: () => {
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://api.mixpanel.com',
      'https://browser.sentry-cdn.com',
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  },

  // Optimiser les Web Workers
  setupWebWorkers: () => {
    if ('serviceWorker' in navigator) {
      // Service Worker pour le cache
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('[Performance] Service Worker registered');
          
          // Update SW when new version available
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                // New version available
                if (navigator.serviceWorker.controller) {
                  showUpdateNotification();
                }
              }
            });
          });
        })
        .catch(error => {
          console.error('[Performance] Service Worker registration failed:', error);
        });
    }

    // Web Worker pour les tâches lourdes
    if ('Worker' in window) {
      window.backgroundWorker = new Worker('/js/background-worker.js');
      console.log('[Performance] Background Worker initialized');
    }
  },

  // Optimiser les animations
  optimizeAnimations: () => {
    // Réduire les animations si l'utilisateur préfère
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    }

    // Utiliser transform au lieu de layout properties
    const observeAnimations = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              const animatedElements = node.querySelectorAll('[data-animate]');
              animatedElements.forEach(el => {
                el.style.willChange = 'transform, opacity';
              });
            }
          });
        }
      });
    });

    observeAnimations.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },

  // Monitoring des performances
  monitorPerformance: () => {
    // Monitor loading performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
          // Navigation timing
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domParse: navigation.domContentLoadedEventStart - navigation.responseEnd,
          domReady: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          
          // Paint timing
          fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          lcp: null, // Will be set by Web Vitals
          
          // Resource counts
          resources: performance.getEntriesByType('resource').length,
          
          // Memory usage (if available)
          memory: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
            total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
          } : null,
        };

        // Send to analytics
        if (window.analytics) {
          window.analytics.track('Performance Metrics', metrics);
        }

        console.log('[Performance] Metrics collected:', metrics);
      }, 0);
    });

    // Monitor resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const resource = {
          type: event.target.tagName,
          source: event.target.src || event.target.href,
          message: event.message,
        };

        if (window.analytics) {
          window.analytics.trackError(new Error('Resource loading failed'), {
            category: 'Performance',
            resource,
          });
        }
      }
    }, true);

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (window.analytics) {
              window.analytics.track('Long Task Detected', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
              });
            }
          });
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API not supported
      }
    }
  },
};

// CDN management functions
export const cdnManager = {
  // Purger le cache CDN
  purgeCache: async (paths = ['/*']) => {
    const results = [];

    // Cloudflare
    if (CDN_CONFIG.providers.cloudflare.enabled) {
      try {
        const response = await fetch(
          `${CDN_CONFIG.providers.cloudflare.endpoint}${CDN_CONFIG.providers.cloudflare.purgeUrl.replace('{zone_id}', CDN_CONFIG.providers.cloudflare.zoneId)}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CDN_CONFIG.providers.cloudflare.apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              files: paths.map(path => path.startsWith('http') ? path : `https://dialect-game.com${path}`)
            }),
          }
        );

        const result = await response.json();
        results.push({ provider: 'cloudflare', success: result.success, result });
      } catch (error) {
        results.push({ provider: 'cloudflare', success: false, error: error.message });
      }
    }

    return results;
  },

  // Pré-warmer le cache
  warmupCache: async (urls) => {
    const warmupPromises = urls.map(async url => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return { url, success: response.ok, status: response.status };
      } catch (error) {
        return { url, success: false, error: error.message };
      }
    });

    return Promise.all(warmupPromises);
  },

  // Analyser les performances CDN
  analyzeCdnPerformance: async () => {
    const testUrls = [
      'https://dialect-game.com/',
      'https://dialect-game.com/css/main.css',
      'https://dialect-game.com/js/main.js',
    ];

    const results = [];

    for (const url of testUrls) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const endTime = performance.now();
        
        results.push({
          url,
          responseTime: endTime - startTime,
          status: response.status,
          headers: {
            cacheStatus: response.headers.get('cf-cache-status'),
            age: response.headers.get('age'),
            lastModified: response.headers.get('last-modified'),
          },
        });
      } catch (error) {
        results.push({
          url,
          error: error.message,
        });
      }
    }

    return results;
  },
};

// Notification pour les mises à jour
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div class="update-notification">
      <p>Une nouvelle version est disponible!</p>
      <button onclick="location.reload()">Mettre à jour</button>
      <button onclick="this.parentElement.remove()">Plus tard</button>
    </div>
  `;
  document.body.appendChild(notification);
}

// Initialiser toutes les optimisations de performance
export function initPerformanceOptimizations() {
  try {
    // Précharger les ressources critiques
    performanceOptimizer.preloadCriticalResources();
    
    // Préconnexion aux domaines externes
    performanceOptimizer.preconnectExternalDomains();
    
    // Setup lazy loading
    performanceOptimizer.setupLazyLoading();
    
    // Setup Web Workers
    performanceOptimizer.setupWebWorkers();
    
    // Optimiser les animations
    performanceOptimizer.optimizeAnimations();
    
    // Monitoring des performances
    performanceOptimizer.monitorPerformance();
    
    console.log('[Performance] All optimizations initialized');
  } catch (error) {
    console.error('[Performance] Failed to initialize optimizations:', error);
  }
}

export default {
  CDN_CONFIG,
  OPTIMIZATION_CONFIG,
  PERFORMANCE_MONITORING,
  performanceOptimizer,
  cdnManager,
  initPerformanceOptimizations,
};