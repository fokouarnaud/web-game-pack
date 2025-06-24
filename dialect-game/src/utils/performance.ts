// Monitoring et optimisations performance

/**
 * Métriques de performance Core Web Vitals
 */
export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

/**
 * Service de monitoring des performances
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // LCP - Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      this.metrics.lcp = lastEntry.startTime;
      this.reportMetric('LCP', lastEntry.startTime);
    });

    // FID - First Input Delay
    this.observeMetric('first-input', (entries) => {
      const firstEntry = entries[0] as PerformanceEntry & { processingStart: number; startTime: number };
      const fid = firstEntry.processingStart - firstEntry.startTime;
      this.metrics.fid = fid;
      this.reportMetric('FID', fid);
    });

    // CLS - Cumulative Layout Shift
    this.observeMetric('layout-shift', (entries) => {
      let cls = 0;
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
      this.metrics.cls = cls;
      this.reportMetric('CLS', cls);
    });

    // FCP - First Contentful Paint
    this.observeMetric('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        this.reportMetric('FCP', fcpEntry.startTime);
      }
    });

    // TTFB - Time to First Byte
    this.measureTTFB();
  }

  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`PerformanceObserver not supported for ${type}:`, error);
    }
  }

  private measureTTFB() {
    try {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        this.metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
        this.reportMetric('TTFB', this.metrics.ttfb);
      }
    } catch (error) {
      console.warn('TTFB measurement failed:', error);
    }
  }

  private reportMetric(name: string, value: number) {
    // Console pour développement
    if (import.meta.env.DEV) {
      console.log(`🎯 ${name}: ${Math.round(value)}ms`);
    }

    // Envoyer aux analytics en production
    if (import.meta.env.PROD && window.gtag) {
      window.gtag('event', name.toLowerCase(), {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value)
      });
    }
  }

  /**
   * Obtenir toutes les métriques actuelles
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Nettoyer les observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Utilitaire pour mesurer la performance d'une fonction
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  
  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        console.log(`⏱️ ${name}: ${Math.round(end - start)}ms`);
      });
    } else {
      const end = performance.now();
      console.log(`⏱️ ${name}: ${Math.round(end - start)}ms`);
      return result;
    }
  } catch (error) {
    const end = performance.now();
    console.log(`❌ ${name} (error): ${Math.round(end - start)}ms`);
    throw error;
  }
}

/**
 * Hook React pour monitoring des performances de composants
 */
export function usePerformanceMonitoring(componentName: string) {
  const startTime = performance.now();

  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // Plus de 16ms = potentiel problème 60fps
      console.warn(`🐌 Slow render: ${componentName} took ${Math.round(renderTime)}ms`);
    }
  });
}

/**
 * Précharger des ressources critiques
 */
export function preloadCriticalResources() {
  // Précharger les fonts importantes
  const fonts = [
    '/fonts/Inter-Regular.woff2',
    '/fonts/Poppins-SemiBold.woff2'
  ];

  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = font;
    document.head.appendChild(link);
  });

  // Précharger les images critiques
  const criticalImages = [
    '/images/hero-bg.webp',
    '/images/flags/en.svg',
    '/images/flags/fr.svg'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Optimiser les images avec lazy loading intelligent
 */
export class ImageOptimizer {
  private observer: IntersectionObserver | null = null;
  private preloadQueue: Set<string> = new Set();

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px' // Commencer à charger 50px avant d'être visible
        }
      );
    }
  }

  observeImage(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(img);
    } else {
      // Fallback si IntersectionObserver n'est pas supporté
      this.loadImage(img);
    }
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (src && !img.src) {
      img.src = src;
      img.onload = () => {
        img.classList.add('loaded');
      };
    }
  }

  preloadImage(src: string): Promise<void> {
    if (this.preloadQueue.has(src)) {
      return Promise.resolve();
    }

    this.preloadQueue.add(src);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }

  disconnect() {
    this.observer?.disconnect();
    this.preloadQueue.clear();
  }
}

/**
 * Cache intelligent pour les APIs
 */
export class PerformanceCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, data: any, ttl = 300000): void { // TTL par défaut: 5 minutes
    // Nettoyer le cache si nécessaire
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];

    // Trouver les entrées expirées
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expired.push(key);
      }
    });

    // Supprimer les expirées
    expired.forEach(key => this.cache.delete(key));

    // Si toujours trop plein, supprimer les plus anciennes
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.3));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * Débouncer pour optimiser les événements fréquents
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle pour limiter la fréquence d'exécution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Utilitaire pour détecter les connexions lentes
 */
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  // @ts-ignore - API expérimentale
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return 'medium'; // Défaut si pas d'info
  
  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'slow';
    case '3g':
      return 'medium';
    case '4g':
    default:
      return 'fast';
  }
}

/**
 * Adapter la qualité selon la connexion
 */
export function getOptimalImageQuality(): 'low' | 'medium' | 'high' {
  const speed = getConnectionSpeed();
  
  switch (speed) {
    case 'slow': return 'low';
    case 'medium': return 'medium';
    case 'fast': return 'high';
  }
}

// Instance globale du monitor de performance
export const performanceMonitor = new PerformanceMonitor();

// Instance globale de l'optimiseur d'images
export const imageOptimizer = new ImageOptimizer();

// Instance globale du cache de performance
export const performanceCache = new PerformanceCache();

// Démarrer le monitoring au chargement
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    preloadCriticalResources();
  });
}

// Types pour TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Import React pour le hook
import React from 'react';