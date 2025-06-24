/**
 * Performance Monitor Service - TDD Implementation
 * Monitoring des performances en temps réel pour l'optimisation continue
 */

export interface PerformanceMetrics {
  renderTime: number;
  startTime: number;
  endTime: number;
  memoryAtStart?: number;
  memoryAtEnd?: number;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  limit: number;
  usage: number; // Percentage
}

export interface PerformanceIssue {
  type: 'slow_render' | 'memory_leak' | 'bundle_size' | 'error_rate';
  component: string;
  duration?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: number;
}

export interface BundleMetrics {
  size: number;
  loadTime: number;
  timestamp: number;
}

export interface PerformanceWarning {
  type: 'bundle_size_exceeded' | 'memory_high' | 'render_slow';
  bundle?: string;
  component?: string;
  size?: number;
  limit?: number;
  timestamp: number;
}

export interface ErrorInfo {
  component: string;
  error: string;
  timestamp: number;
  stack: string;
}

export interface PerformanceCorrelation {
  component: string;
  hasPerformanceIssue: boolean;
  hasError: boolean;
  correlation: 'low' | 'medium' | 'high';
}

export interface OptimizationSuggestion {
  component: string;
  issue: string;
  suggestions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DashboardData {
  averageRenderTime: number;
  memoryUsage: MemoryMetrics;
  activeComponents: number;
  performanceScore: number;
  issues: PerformanceIssue[];
  trends: Array<{ timestamp: number; score: number }>;
}

export class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>();
  private bundleMetrics = new Map<string, BundleMetrics>();
  private issues: PerformanceIssue[] = [];
  private warnings: PerformanceWarning[] = [];
  private errors: ErrorInfo[] = [];
  private activeTracking = new Map<string, number>();
  
  // Configuration thresholds
  private readonly SLOW_RENDER_THRESHOLD = 100; // ms
  private readonly CRITICAL_RENDER_THRESHOLD = 1000; // ms
  private readonly MAX_BUNDLE_SIZE = 500000; // 500KB
  private readonly HIGH_MEMORY_THRESHOLD = 0.8; // 80%
  private readonly CRITICAL_MEMORY_THRESHOLD = 0.89; // 89% (pour que 90% soit considéré critique)

  /**
   * Démarrer le tracking d'un composant
   */
  startTracking(componentName: string): void {
    const startTime = performance.now();
    this.activeTracking.set(componentName, startTime);
    
    performance.mark(`${componentName}-start`);
  }

  /**
   * Terminer le tracking d'un composant
   */
  endTracking(componentName: string): void {
    const endTime = performance.now();
    const startTime = this.activeTracking.get(componentName);
    
    if (!startTime) {
      console.warn(`No start time found for component: ${componentName}`);
      return;
    }

    performance.mark(`${componentName}-end`);
    performance.measure(`${componentName}-render`, `${componentName}-start`, `${componentName}-end`);
    
    const renderTime = endTime - startTime;
    
    const metrics: PerformanceMetrics = {
      renderTime,
      startTime,
      endTime,
      memoryAtStart: this.getMemoryUsage(),
      memoryAtEnd: this.getMemoryUsage()
    };

    this.metrics.set(componentName, metrics);
    this.activeTracking.delete(componentName);
    
    // Check for performance issues
    this.checkForIssues(componentName, renderTime);
  }

  /**
   * Obtenir les métriques d'un composant
   */
  getMetrics(componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName);
  }

  /**
   * Obtenir les métriques mémoire actuelles
   */
  getMemoryMetrics(): MemoryMetrics {
    const memory = this.getPerformanceMemory();
    
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usage: memory.usedJSHeapSize / memory.totalJSHeapSize
    };
  }

  /**
   * Obtenir les problèmes de performance détectés
   */
  getPerformanceIssues(): PerformanceIssue[] {
    return [...this.issues];
  }

  /**
   * Tracker le chargement d'un bundle
   */
  trackBundleLoad(bundleName: string, size: number): void {
    const loadTime = performance.now();
    
    const bundleMetric: BundleMetrics = {
      size,
      loadTime,
      timestamp: Date.now()
    };

    this.bundleMetrics.set(bundleName, bundleMetric);
    
    // Check bundle size limits
    if (size > this.MAX_BUNDLE_SIZE) {
      this.warnings.push({
        type: 'bundle_size_exceeded',
        bundle: bundleName,
        size,
        limit: this.MAX_BUNDLE_SIZE,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Obtenir les métriques de bundles
   */
  getBundleMetrics(): Map<string, BundleMetrics> {
    return new Map(this.bundleMetrics);
  }

  /**
   * Obtenir les avertissements
   */
  getWarnings(): PerformanceWarning[] {
    return [...this.warnings];
  }

  /**
   * Obtenir les données du dashboard
   */
  getDashboardData(): DashboardData {
    const allRenderTimes = Array.from(this.metrics.values()).map(m => m.renderTime);
    const averageRenderTime = allRenderTimes.length > 0 
      ? allRenderTimes.reduce((a, b) => a + b, 0) / allRenderTimes.length 
      : 0;

    return {
      averageRenderTime,
      memoryUsage: this.getMemoryMetrics(),
      activeComponents: this.activeTracking.size,
      performanceScore: this.getPerformanceScore(),
      issues: this.getPerformanceIssues(),
      trends: this.getPerformanceTrends()
    };
  }

  /**
   * Calculer le score de performance global
   */
  getPerformanceScore(): number {
    let score = 100;
    
    // Pénalités pour les problèmes
    this.issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    // Pénalités pour la mémoire
    const memoryUsage = this.getMemoryMetrics().usage;
    if (memoryUsage > this.CRITICAL_MEMORY_THRESHOLD) {
      score -= 25;
    } else if (memoryUsage > this.HIGH_MEMORY_THRESHOLD) {
      score -= 15;
    }

    return Math.max(0, score);
  }

  /**
   * Tracker une erreur
   */
  trackError(componentName: string, error: Error): void {
    this.errors.push({
      component: componentName,
      error: error.message,
      timestamp: Date.now(),
      stack: error.stack || 'No stack trace available'
    });

    // Ajouter comme problème de performance
    this.issues.push({
      type: 'error_rate',
      component: componentName,
      severity: 'high',
      timestamp: Date.now()
    });
  }

  /**
   * Obtenir les erreurs
   */
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  /**
   * Obtenir les corrélations entre erreurs et performance
   */
  getPerformanceErrorCorrelations(): PerformanceCorrelation[] {
    const correlations: PerformanceCorrelation[] = [];
    const componentNames = new Set([
      ...Array.from(this.metrics.keys()),
      ...this.errors.map(e => e.component)
    ]);

    componentNames.forEach(component => {
      const hasPerformanceIssue = this.issues.some(issue => issue.component === component);
      const hasError = this.errors.some(error => error.component === component);
      
      let correlation: 'low' | 'medium' | 'high' = 'low';
      if (hasPerformanceIssue && hasError) {
        correlation = 'high';
      } else if (hasPerformanceIssue || hasError) {
        correlation = 'medium';
      }

      correlations.push({
        component,
        hasPerformanceIssue,
        hasError,
        correlation
      });
    });

    return correlations;
  }

  /**
   * Obtenir les suggestions d'optimisation
   */
  getOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Suggestions pour les composants lents
    this.issues.forEach(issue => {
      if (issue.type === 'slow_render') {
        suggestions.push({
          component: issue.component,
          issue: 'slow_render',
          suggestions: [
            'Consider using React.memo',
            'Check for expensive operations in render',
            'Optimize state updates',
            'Use useMemo for expensive calculations'
          ],
          priority: issue.severity === 'critical' ? 'high' : 'medium'
        });
      }
    });

    // Suggestions pour la mémoire
    const memoryUsage = this.getMemoryMetrics().usage;
    if (memoryUsage > this.HIGH_MEMORY_THRESHOLD) {
      suggestions.push({
        component: 'global',
        issue: 'high_memory_usage',
        suggestions: [
          'Check for memory leaks',
          'Clean up event listeners',
          'Optimize image loading',
          'Use lazy loading for large components'
        ],
        priority: memoryUsage > this.CRITICAL_MEMORY_THRESHOLD ? 'critical' : 'high'
      });
    }

    return suggestions;
  }

  /**
   * Méthodes privées utilitaires
   */
  private checkForIssues(componentName: string, renderTime: number): void {
    if (renderTime > this.CRITICAL_RENDER_THRESHOLD) {
      this.issues.push({
        type: 'slow_render',
        component: componentName,
        duration: renderTime,
        severity: 'critical',
        timestamp: Date.now()
      });
    } else if (renderTime > this.SLOW_RENDER_THRESHOLD) {
      this.issues.push({
        type: 'slow_render',
        component: componentName,
        duration: renderTime,
        severity: 'medium',
        timestamp: Date.now()
      });
    }
  }

  private getPerformanceMemory(): { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    
    // Fallback pour les navigateurs sans support memory
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  }

  private getMemoryUsage(): number {
    const memory = this.getPerformanceMemory();
    return memory.usedJSHeapSize;
  }

  private getPerformanceTrends(): Array<{ timestamp: number; score: number }> {
    // Retourner les 10 derniers scores (simulation)
    return Array.from({ length: 10 }, (_, i) => ({
      timestamp: Date.now() - (i * 60000), // -1 minute per point
      score: this.getPerformanceScore() + Math.random() * 10 - 5 // Slight variation
    }));
  }

  /**
   * Nettoyage des métriques anciennes
   */
  cleanup(maxAge: number = 300000): void { // 5 minutes par défaut
    const cutoff = Date.now() - maxAge;
    
    // Nettoyer les problèmes anciens
    this.issues = this.issues.filter(issue => 
      !issue.timestamp || issue.timestamp > cutoff
    );
    
    // Nettoyer les avertissements anciens
    this.warnings = this.warnings.filter(warning => warning.timestamp > cutoff);
    
    // Nettoyer les erreurs anciennes
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
  }
}

// Instance singleton pour usage global
export const performanceMonitor = new PerformanceMonitor();